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
	"bytes"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
)

var (
	forwardlinks = map[*ast.Node][]*ast.Node{} // 正向链接关系：块用了哪些块
	backlinks    = map[*ast.Node][]*ast.Node{} // 反向链接关系：块被哪些块用了
)

func (dir *Dir) IndexLink(tree *parse.Tree) (currentBacklinks []*ast.Node) {
	// 找到当前块列表
	var currentBlocks []*ast.Node
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkStop
		}

		if ast.NodeDocument != n.Parent.Type {
			// 仅支持根节点的直接子节点
			return ast.WalkContinue
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkStop
		}

		currentBlocks = append(currentBlocks, n)
		return ast.WalkContinue
	})

	// 清理当前块的链接关系
	for _, currentBlock := range currentBlocks {
		delete(forwardlinks, currentBlock)
		delete(backlinks, currentBlock)
	}

	// 构建链接关系
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkStop
			}

			if ast.NodeBlockRefID != n.Type {
				return ast.WalkContinue
			}

			for _, currentBlock := range currentBlocks {
				if bytes.Equal(currentBlock.Tokens, n.Tokens) {
					backlinks[currentBlock] = append(backlinks[currentBlock], n)
				}
			}

			// TODO: 正向链接

			return ast.WalkContinue
		})
	}

	// 组装当前块的反链列表
	for _, currentBlock := range currentBlocks {
		currentBacklinks = append(currentBacklinks, backlinks[currentBlock]...)
	}
	return
}
