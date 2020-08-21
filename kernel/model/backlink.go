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
	"errors"
	"sort"
	"sync"

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
)

var (
	treeBacklinks     = map[*parse.Tree]map[*Block][]*Block{} // 反向链接关系：块被哪些块用了
	treeBacklinksLock = &sync.Mutex{}                         // 全局反链锁，构建反链和图的时候需要加锁
)

type DefRef struct {
	Def  *Block   `json:"def"`
	Refs []*Block `json:"refs"`
}

type DefRefs []*DefRef

func (r DefRefs) Len() int           { return len(r) }
func (r DefRefs) Less(i, j int) bool { return len(r[i].Refs) < len(r[j].Refs) }
func (r DefRefs) Swap(i, j int)      { r[i], r[j] = r[j], r[i] }

func TreeBacklinks(url, path string) (ret []*Block, err error) {
	box := Conf.Box(url)
	if nil == box {
		return nil, errors.New(Conf.lang(0))
	}

	tree := box.Tree(path)
	ret = indexLink(tree)
	return
}

func Backlinks() (ret DefRefs) {
	rebuildBacklinks()

	for _, backlinkDefs := range treeBacklinks {
		for def, refs := range backlinkDefs {
			ret = append(ret, &DefRef{def, refs})
		}
	}
	sort.Sort(ret)
	return
}

func rebuildBacklinks() {
	graphLock.Lock()
	defer graphLock.Unlock()

	treeBacklinks = map[*parse.Tree]map[*Block][]*Block{}

	for _, tree := range trees {
		indexLink(tree)
	}
}

func indexLink(tree *parse.Tree) (ret []*Block) {
	treeBacklinksLock.Lock()
	defer treeBacklinksLock.Unlock()

	// 找到当前块列表
	var currentBlocks []*Block
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkStop
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkStop
		}

		currentBlocks = append(currentBlocks, buildBlock(tree.URL, tree.Path, n))
		return ast.WalkContinue
	})

	// 清理当前树的块链关系
	delete(treeBacklinks, tree)

	// 构建链接关系
	backlinks := map[*Block][]*Block{}
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

				if bytes.Equal(gulu.Str.ToBytes(currentBlock.ID), n.Tokens) {
					block := refParentBlock(n)
					refNodes = append(refNodes, block)
				}
				return ast.WalkContinue
			})

			var blocks []*Block
			for _, n := range refNodes {
				blocks = append(blocks, buildBlock(tree.URL, tree.Path, n))
			}
			if nil != blocks {
				for _, ref := range blocks {
					ref.Def = currentBlock
				}
				backlinks[currentBlock] = append(backlinks[currentBlock], blocks...)
			}
		}
	}

	treeBacklinks[tree] = backlinks

	// 按树路径合并引用
	ret = []*Block{}
	for _, refs := range backlinks {
		for _, ref := range refs {
			var appended bool
			for _, existRef := range ret {
				if existRef.URL == ref.URL && existRef.Path == ref.Path {
					existRef.Refs = append(existRef.Refs, ref)
					appended = true
					break
				}
			}
			if !appended {
				newRef := &Block{
					URL:  ref.URL,
					Path: ref.Path,
					Refs: []*Block{ref},
				}
				ret = append(ret, newRef)
			}
		}
	}
	return
}

func buildBlock(url, path string, node *ast.Node) (ret *Block) {
	content := renderBlockText(node)
	return &Block{URL: url, Path: path, ID: node.ID, Type: node.Type.String(), Content: content}
}

func refParentBlock(ref *ast.Node) *ast.Node {
	for p := ref.Parent; nil != p; p = p.Parent {
		if "" != p.ID {
			return p
		}
	}
	return nil
}
