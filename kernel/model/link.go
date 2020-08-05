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
	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
)

var (
	backlinks = map[*ast.Node][]*BacklinkRef{} // 反向链接关系：块被哪些块用了
)

type BacklinkRef struct {
	URL, Path string
	RefNodes  []*ast.Node
}

func (dir *Dir) IndexLink(tree *parse.Tree) (ret [][]*Block) {
	// 找到当前块列表
	var currentBlocks []*ast.Node
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkStop
		}

		if ast.NodeDocument == n.Type {
			return ast.WalkContinue
		}

		if "" ==  n.ID {
			return ast.WalkStop
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkStop
		}

		currentBlocks = append(currentBlocks, n)
		return ast.WalkContinue
	})

	// 清理当前块的链接关系
	for _, currentBlock := range currentBlocks {
		delete(backlinks, currentBlock)
	}

	// 构建链接关系
	for _, currentBlock := range currentBlocks {
		for _, tree := range trees {
			var refNodes []*ast.Node
			ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
				if !entering {
					return ast.WalkStop
				}

				if ast.NodeBlockRefID != n.Type {
					return ast.WalkContinue
				}

				if bytes.Equal(gulu.Str.ToBytes(currentBlock.ID), n.Tokens) && currentBlock != n {
					refNodes = append(refNodes, n)
				}
				return ast.WalkContinue
			})
			backlinks[currentBlock] = append(backlinks[currentBlock], &BacklinkRef{URL: tree.URL, Path: tree.Path, RefNodes: refNodes})
		}
	}

	// 组装当前块的反链列表
	for _, currentBlock := range currentBlocks {
		for _, backlinkRef := range backlinks[currentBlock] {
			var blocks []*Block
			for _, refNode := range backlinkRef.RefNodes {
				block := &Block{URL: backlinkRef.URL, Path: backlinkRef.Path, ID: refNode.ID, Type: refNode.Type.String(), Content: refNode.Text()}
				blocks = append(blocks, block)
			}
			if nil != blocks {
				ret = append(ret, [][]*Block{blocks}...)
			}
		}
	}
	return
}
