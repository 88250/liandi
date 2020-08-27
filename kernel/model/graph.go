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
	markLinkedNodes(&nodes, &links)
	return
}

func Graph(keyword string) (nodes []interface{}, links []interface{}) {
	rebuildLinks()

	for _, tree := range trees {
		genTreeGraph(keyword, tree, &nodes, &links)
	}
	connectForwardlinks(&links)
	connectBacklinks(&links)
	markLinkedNodes(&nodes, &links)
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
				if node.(map[string]interface{})["id"] == ref.ID {
					if existNodes(all, ref.Def.ID) || existNodes(forwardGeneration, ref.Def.ID) || existNodes(nodes, ref.Def.ID) {
						continue
					}

					def := map[string]interface{}{
						"id":   ref.Def.ID,
						"url":  ref.Def.URL,
						"path": ref.Def.Path,
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
				if node.(map[string]interface{})["id"] == def.ID {
					for _, ref := range def.Refs {
						if existNodes(all, ref.ID) || existNodes(backGeneration, ref.ID) || existNodes(nodes, ref.ID) {
							continue
						}

						ref := map[string]interface{}{
							"id":   ref.ID,
							"url":  ref.URL,
							"path": ref.Path,
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
		if node.(map[string]interface{})["id"] == id {
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
			"ref":    true,
		})
	}
}

func connectBacklinks(links *[]interface{}) {
	for _, def := range backlinks {
		for _, ref := range def.Refs {
			*links = append(*links, map[string]interface{}{
				"source": ref.ID,
				"target": def.ID,
				"ref":    true,
			})
		}
	}
}

const (
	NodeSize = 1 // 节点默认大小
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
			return ast.WalkStop
		}

		text := renderBlockText(n)
		if "" == text || !strings.Contains(strings.ToLower(text), strings.ToLower(keyword)) {
			return ast.WalkContinue
		}

		text = render.SubStr(text, 32)

		node := map[string]interface{}{
			"id":      n.ID,
			"url":     tree.URL,
			"path":    tree.Path,
			"content": text,
		}
		size := NodeSize
		node["symbolSize"] = size

		checkBadNodes(nodes, node, links)
		*nodes = append(*nodes, node)

		if tree.ID != n.ID {
			// 连接根块和子块
			*links = append(*links, map[string]interface{}{
				"source": tree.ID,
				"target": n.ID,
				"ref":    false,
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
		if currentNode["id"] == existNode["id"] {
			currentNode["id"] = currentNode["id"].(string) + "-" + gulu.Rand.String(7)
			*links = append(*links, map[string]interface{}{
				"source": existNode["id"],
				"target": currentNode["id"],
			})
		}
	}
}

func markLinkedNodes(nodes *[]interface{}, links *[]interface{}) {
	tmpLinks := (*links)[:0]
	for _, link := range *links {
		l := link.(map[string]interface{})
		var sourceFound, targetFound bool
		for _, node := range *nodes {
			n := node.(map[string]interface{})
			if l["target"] == n["id"] {
				size := NodeSize
				if s := n["symbolSize"]; nil != s {
					size = s.(int)
				}
				size += 1
				n["symbolSize"] = size
				targetFound = true
			} else if l["source"] == n["id"] {
				sourceFound = true
			}
		}
		if sourceFound && targetFound {
			tmpLinks = append(tmpLinks, link)
		}
	}
	*links = tmpLinks
}
