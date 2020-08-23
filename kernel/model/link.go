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
	backlinks         []*Block        // 反向链接关系 ref
	forwardlinks      []*Block        // 正向链接关系 def
	treeBacklinksLock = &sync.Mutex{} // 全局反链锁，构建反链和图的时候需要加锁
)

type DefRef struct {
	Def  *Block   `json:"def"`
	Refs []*Block `json:"refs"`
}

type DefRefs []*DefRef

func (r DefRefs) Len() int { return len(r) }
func (r DefRefs) Less(i, j int) bool {
	if len(r[i].Refs) == len(r[j].Refs) {
		return r[i].Def.ID > r[j].Def.ID
	} else {
		return len(r[i].Refs) < len(r[j].Refs)
	}
}
func (r DefRefs) Swap(i, j int) { r[i], r[j] = r[j], r[i] }

func TreeBacklinks(url, path string) (ret []*Block, err error) {
	box := Conf.Box(url)
	if nil == box {
		return nil, errors.New(Conf.lang(0))
	}

	tree := box.Tree(path)
	indexLink(tree)

	ret = []*Block{}
	for _, def := range forwardlinks {
		depth := 0
		cloned := cloneBlock(def, &depth)
		ret = append(ret, cloned)
	}
	return
}

func cloneBlock(block *Block, depth *int) (ret *Block) {
	if nil == block {
		return
	}

	*depth++
	if 2 < *depth {
		return
	}

	ret = &Block{
		URL:     block.URL,
		Path:    block.Path,
		ID:      block.ID,
		Content: block.Content,
		Type:    block.Type,
	}

	ret.Def = cloneBlock(block, depth)
	for _, ref := range block.Refs {
		ret.Refs = append(ret.Refs, cloneBlock(ref, depth))
	}
	*depth--
	return
}

func Backlinks() (ret DefRefs) {
	rebuildLinks()

	for _, block := range backlinks {
		ret = append(ret, &DefRef{block.Def, block.Refs})
	}
	sort.Sort(ret)
	return
}

func rebuildLinks() {
	graphLock.Lock()
	defer graphLock.Unlock()

	backlinks = []*Block{}
	forwardlinks = []*Block{}

	for _, tree := range trees {
		indexLink(tree)
	}
}

func indexLink(tree *parse.Tree) {
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
	for i, length := 0, len(backlinks); i < length; {
		if backlinks[i].URL == tree.URL && backlinks[i].Path == tree.Path {
			i++
		} else {
			backlinks = append(backlinks[:i], backlinks[i+1:]...)
			length--
		}
	}
	for i, length := 0, len(forwardlinks); i < length; {
		if forwardlinks[i].URL == tree.URL && forwardlinks[i].Path == tree.Path {
			i++
		} else {
			forwardlinks = append(forwardlinks[:i], forwardlinks[i+1:]...)
			length--
		}
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

				if bytes.Equal(gulu.Str.ToBytes(currentBlock.ID), n.Tokens) {
					block := refParentBlock(n)
					refNodes = append(refNodes, block)
				}
				return ast.WalkContinue
			})

			for _, n := range refNodes {
				ref := buildBlock(tree.URL, tree.Path, n)
				ref.Def = currentBlock
				currentBlock.Refs = append(currentBlock.Refs, ref)
				currentBlock.Def = currentBlock
				backlinks = append(backlinks, ref)
				forwardlinks = append(forwardlinks, currentBlock)
			}
		}
	}

	// TODO 按树路径合并引用
	//ret = []*Block{}
	//for _, ref := range backlinks {
	//	var appended bool
	//	for _, existRef := range ret {
	//		if existRef.URL == ref.URL && existRef.Path == ref.Path {
	//			existRef.Refs = append(existRef.Refs, ref)
	//			appended = true
	//			break
	//		}
	//	}
	//	if !appended {
	//		newRef := &Block{
	//			URL:  ref.URL,
	//			Path: ref.Path,
	//			Refs: []*Block{ref},
	//		}
	//		ret = append(ret, newRef)
	//	}
	//}
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
