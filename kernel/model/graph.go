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

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/render"
)

var graphLock = &sync.Mutex{}

func TreeGraph(keyword string, url, p string, depth int) (nodes []interface{}, links []interface{}) {
	box := Conf.Box(url)
	if nil == box {
		return
	}

	rebuildLinks()

	tree := box.Tree(p)
	genTreeGraph(keyword, tree, &nodes, &links)
	growGraph(&nodes, depth)
	connectForwardlinks(&links)
	connectBacklinks(&links)
	markBugBlock(&nodes, &links)
	return
}

func Graph(keyword string) (nodes []interface{}, links []interface{}) {
	rebuildLinks()

	for _, tree := range trees {
		genTreeGraph(keyword, tree, &nodes, &links)
	}
	connectForwardlinks(&links)
	connectBacklinks(&links)
	markBugBlock(&nodes, &links)
	return
}

func growGraph(nodes *[]interface{}, maxDepth int) {
	forwardDepth, backDepth := 0, 0
	growLinkedNodes(nodes, nodes, &forwardDepth, &backDepth, maxDepth)
}

func growLinkedNodes(nodes, all *[]interface{}, forwardDepth, backDepth *int, maxDepth int) {
	if 1 > len(*nodes) {
		return
	}

	forwardGeneration := &[]interface{}{}
	if maxDepth > *forwardDepth {
		for _, ref := range forwardlinks {
			for _, node := range *nodes {
				if node.(map[string]interface{})["name"] == ref.ID {
					if existNodes(all, ref.Def.ID) || existNodes(forwardGeneration, ref.Def.ID) || existNodes(nodes, ref.Def.ID) {
						continue
					}

					category := NodeCategoryChild
					if ast.NodeDocument.String() == ref.Def.Type {
						category = NodeCategoryRoot
					}

					def := map[string]interface{}{
						"name":     ref.Def.ID,
						"category": category,
						"url":      ref.Def.URL,
						"path":     ref.Def.Path,
						"content":  ref.Def.Content,
						"label": map[string]interface{}{
							"show": true,
						},
						"emphasis": map[string]interface{}{
							"label": map[string]interface{}{
								"show": true,
							},
						},
					}

					*forwardGeneration = append(*forwardGeneration, def)
				}
			}
		}

	}

	backGeneration := &[]interface{}{}
	if maxDepth > *backDepth {
		for _, def := range backlinks {
			for _, node := range *nodes {
				if node.(map[string]interface{})["name"] == def.ID {
					for _, ref := range def.Refs {
						if existNodes(all, ref.ID) || existNodes(backGeneration, ref.ID) || existNodes(nodes, ref.ID) {
							continue
						}

						category := NodeCategoryChild
						if ast.NodeDocument.String() == ref.Type {
							category = NodeCategoryRoot
						}

						ref := map[string]interface{}{
							"name":     ref.ID,
							"category": category,
							"url":      ref.URL,
							"path":     ref.Path,
							"content":  ref.Content,
							"label": map[string]interface{}{
								"show": true,
							},
							"emphasis": map[string]interface{}{
								"label": map[string]interface{}{
									"show": true,
								},
							},
						}

						*backGeneration = append(*backGeneration, ref)
					}
				}
			}
		}
	}

	generation := &[]interface{}{}
	*generation = append(*generation, *forwardGeneration...)
	*generation = append(*generation, *backGeneration...)
	*forwardDepth++
	*backDepth++
	growLinkedNodes(generation, nodes, forwardDepth, backDepth, maxDepth)
	*nodes = append(*nodes, *generation...)
}

func existNodes(nodes *[]interface{}, id string) bool {
	for _, node := range *nodes {
		if node.(map[string]interface{})["name"] == id {
			return true
		}
	}
	return false
}

func connectForwardlinks(links *[]interface{}) {
	for _, ref := range forwardlinks {
		*links = append(*links, map[string]interface{}{
			"source": ref.ID,
			"target": ref.Def.ID,
			"lineStyle": map[string]interface{}{
				"type": "dotted",
			},
		})
	}
}

func connectBacklinks(links *[]interface{}) {
	for _, def := range backlinks {
		for _, ref := range def.Refs {
			*links = append(*links, map[string]interface{}{
				"source": ref.ID,
				"target": def.ID,
				"lineStyle": map[string]interface{}{
					"type": "dotted",
				},
			})
		}
	}
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

		var text string
		if ast.NodeDocument == n.Type {
			text = tree.Name
		} else {
			text = renderBlockText(n)
			text = render.SubStr(text, 16)
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
		checkBadNodes(nodes, node, links)
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

func checkBadNodes(nodes *[]interface{}, node interface{}, links *[]interface{}) {
	currentNode := node.(map[string]interface{})
	for _, n := range *nodes {
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
