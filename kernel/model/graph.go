// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package model

import (
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
)

var graphLock = &sync.Mutex{}

func TreeGraph(keyword string, url, p string) (nodes []interface{}, links []interface{}) {
	box := Conf.Box(url)
	if nil == box {
		return
	}

	rebuildLinks()

	tree := box.Tree(p)
	genTreeGraph(keyword, tree, &nodes, &links)
	connectBacklinks(&nodes, &links, true)
	//TODO connectForwardLinks(tree, &nodes, &links, true)

	markBugBlock(&nodes, &links)
	return
}

func Graph(keyword string) (nodes []interface{}, links []interface{}) {
	rebuildLinks()

	for _, tree := range trees {
		genTreeGraph(keyword, tree, &nodes, &links)
	}

	connectBacklinks(&nodes, &links, false)

	markBugBlock(&nodes, &links)
	return
}

func markBugBlock(nodes *[]interface{}, links *[]interface{}) {
	for _, node := range *nodes {
		n := node.(map[string]interface{})
		if 0 == n["category"] {
			// 跳过根块
			continue
		}
		for _, link := range *links {
			l := link.(map[string]interface{})
			lineStyle := l["lineStyle"].(map[string]interface{})["type"]
			if (l["source"] == n["name"] || l["target"] == n["name"]) && "dotted" == lineStyle {
				n["category"] = NodeCategoryLinked
			}
		}
	}
}

func connectBacklinks(nodes *[]interface{}, links *[]interface{}, fromTree bool) {
	allRefs := map[string]*Block{}
	for _, ref := range backlinks {
		*links = append(*links, map[string]interface{}{
			"source": ref.ID,
			"target": ref.Def.ID,
			"lineStyle": map[string]interface{}{
				"type": "dotted",
			},
		})
		allRefs[ref.ID] = ref
	}

	if !fromTree {
		return
	}

	// Tree Graph 需要从其他树的节点进行延伸补全

	for refID, ref := range allRefs {
		var existed bool
		for _, n := range *nodes {
			node := n.(map[string]interface{})
			id := node["name"].(string)

			if refID == id {
				existed = true
				break
			}
		}

		if !existed {
			category := NodeCategoryRoot
			show := true
			if ast.NodeDocument.String() != ref.Type {
				category = NodeCategoryChild
				show = false
			}

			node := map[string]interface{}{
				"name":     refID,
				"category": category, // TODO 其他文档引用类型
				"url":      ref.URL,
				"path":     ref.Path,
				"content":  ref.Content,
				"label": map[string]interface{}{
					"show": show,
				},
				"emphasis": map[string]interface{}{
					"label": map[string]interface{}{
						"show": true,
					},
				},
			}

			*nodes = append(*nodes, node)
		}
	}
}

func connectForwardLinks(keyword string, tree *parse.Tree, nodes *[]interface{}, links *[]interface{}) {
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if nil != n.Parent && ast.NodeDocument != n.Parent.Type {
			// 仅支持根节点的直接子节点
			return ast.WalkContinue
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkContinue
		}

		text := renderBlockText(n)
		if ast.NodeDocument == n.Type {
			text = tree.Name + "  " + text
		}

		if !strings.Contains(strings.ToLower(text), strings.ToLower(keyword)) {
			return ast.WalkContinue
		}

		isRoot := ast.NodeDocument == n.Type
		value := NodeCategoryRoot
		show := true
		if !isRoot {
			value = NodeCategoryChild
			show = false
		}

		maxTextLen := 16
		if !isRoot {
			maxTextLen = 64
		}

		var runes []rune
		for i := 0; i < len(text); {
			r, size := utf8.DecodeRuneInString(text[i:])
			runes = append(runes, r)
			i += size
			if maxTextLen < len(runes) {
				runes = append(runes, []rune("...")...)
				break
			}
		}
		text = string(runes)
		if "" == text {
			return ast.WalkContinue
		}

		node := map[string]interface{}{
			"name":     n.ID,
			"category": value,
			"url":      tree.URL,
			"path":     tree.Path,
			"content":  text,
			"label": map[string]interface{}{
				"show": show,
			},
			"emphasis": map[string]interface{}{
				"label": map[string]interface{}{
					"show": true,
				},
			},
		}
		checkBadNodes(*nodes, node, links)
		*nodes = append(*nodes, node)

		if tree.ID != n.ID {
			// 连接根块和子块
			*links = append(*links, map[string]interface{}{
				"source": tree.ID,
				"target": n.ID,
				"symbol": "none",
				"lineStyle": map[string]interface{}{
					"type": "solid",
				},
			})
		}

		if ast.NodeList == n.Type {
			return ast.WalkSkipChildren
		}
		return ast.WalkContinue
	})
}

const (
	NodeCategoryRoot   = 0 // 根块
	NodeCategoryChild  = 1 // 子块
	NodeCategoryLinked = 2 // 关联块
	NodeCategoryBug    = 3 // 问题块
)

func genTreeGraph(keyword string, tree *parse.Tree, nodes *[]interface{}, links *[]interface{}) {
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if nil != n.Parent && ast.NodeDocument != n.Parent.Type {
			// 仅支持根节点的直接子节点
			return ast.WalkContinue
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkContinue
		}

		text := renderBlockText(n)
		if ast.NodeDocument == n.Type {
			text = tree.Name + "  " + text
		}

		if !strings.Contains(strings.ToLower(text), strings.ToLower(keyword)) {
			return ast.WalkContinue
		}

		isRoot := ast.NodeDocument == n.Type
		value := NodeCategoryRoot
		show := true
		if !isRoot {
			value = NodeCategoryChild
			show = false
		}

		maxTextLen := 16
		if !isRoot {
			maxTextLen = 64
		}

		var runes []rune
		for i := 0; i < len(text); {
			r, size := utf8.DecodeRuneInString(text[i:])
			runes = append(runes, r)
			i += size
			if maxTextLen < len(runes) {
				runes = append(runes, []rune("...")...)
				break
			}
		}
		text = string(runes)
		if "" == text {
			return ast.WalkContinue
		}

		node := map[string]interface{}{
			"name":     n.ID,
			"category": value,
			"url":      tree.URL,
			"path":     tree.Path,
			"content":  text,
			"label": map[string]interface{}{
				"show": show,
			},
			"emphasis": map[string]interface{}{
				"label": map[string]interface{}{
					"show": true,
				},
			},
		}
		checkBadNodes(*nodes, node, links)
		*nodes = append(*nodes, node)

		if tree.ID != n.ID {
			// 连接根块和子块
			*links = append(*links, map[string]interface{}{
				"source": tree.ID,
				"target": n.ID,
				"symbol": "none",
				"lineStyle": map[string]interface{}{
					"type": "solid",
				},
			})
		}

		if ast.NodeList == n.Type {
			return ast.WalkSkipChildren
		}
		return ast.WalkContinue
	})
}

func checkBadNodes(nodes []interface{}, node interface{}, links *[]interface{}) {
	currentNode := node.(map[string]interface{})
	for _, n := range nodes {
		existNode := n.(map[string]interface{})
		if currentNode["name"] == existNode["name"] {
			currentNode["name"] = currentNode["name"].(string) + "-" + gulu.Rand.String(7)
			currentNode["category"] = NodeCategoryBug
			*links = append(*links, map[string]interface{}{
				"source": existNode["name"],
				"target": currentNode["name"],
				"symbol": "none",
				"lineStyle": map[string]interface{}{
					"type": "dashed",
				},
			})
		}
	}
}
