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
	"github.com/88250/lute/ast"
)

func Graph() (nodes []interface{}, links []interface{}) {
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

			isRoot := ast.NodeDocument == n.Type
			value := 0
			symbolSize := 20
			if !isRoot {
				value = 1
				symbolSize = 1
			}
			nodes = append(nodes, map[string]interface{}{
				"name":       n.ID,
				"symbolSize": symbolSize,
				"category":   value,
				"url":        tree.URL,
				"path":       tree.Path,
				"content":    n.Text(),
			})

			links = append(links, map[string]interface{}{
				"source": tree.ID,
				"target": n.ID,
				"symbol": []string{"circle", "circle"},
				"lineStyle": map[string]interface{}{
					"type": "solid",
				},
			})

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
						"source": source,
						"target": target,
						"lineStyle": map[string]interface{}{
							"type": "dashed",
						},
					})
				}
			}
		}
	}
	return
}
