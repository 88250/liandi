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
	"unicode/utf8"

	"github.com/88250/lute/ast"
)

func Graph(keyword string) (nodes []interface{}, links []interface{}) {
	for _, tree := range trees {
		delete(treeBacklinks, tree)
	}

	for _, tree := range trees {
		indexLink(tree)

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

			text := n.Text()
			if !strings.Contains(strings.ToLower(text), strings.ToLower(keyword)) {
				return ast.WalkContinue
			}

			var runes []rune
			for i := 0; i < len(text); i++ {
				r, size := utf8.DecodeRuneInString(text)
				runes = append(runes, r)
				i += size
				if 16 < len(runes) {
					runes = append(runes, []rune("...")...)
					break
				}
			}
			text = string(runes)

			isRoot := ast.NodeDocument == n.Type
			value := 0
			show := true
			if !isRoot {
				value = 1
				show = false
			}
			nodes = append(nodes, map[string]interface{}{
				"name":     n.ID,
				"category": value,
				"url":      tree.URL,
				"path":     tree.Path,
				"content":  text,
				"label": map[string]interface{}{
					"show": show,
				},
			})

			if tree.ID != n.ID {
				links = append(links, map[string]interface{}{
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

	for _, nodeBacklinks := range treeBacklinks {
		for target, refs := range nodeBacklinks {
			for _, sources := range refs {
				for _, source := range sources.RefNodes {
					links = append(links, map[string]interface{}{
						"source": source.ID,
						"target": target.ID,
						"lineStyle": map[string]interface{}{
							"type": "dotted",
						},
					})
				}
			}
		}
	}

	for _, node := range nodes {
		n := node.(map[string]interface{})
		for _, link := range links {
			l := link.(map[string]interface{})
			lineStyle := l["lineStyle"].(map[string]interface{})["type"]
			if (l["source"] == n["name"] || l["target"] == n["name"]) && "dotted" == lineStyle {
				n["category"] = 2
			}
		}
	}
	return
}
