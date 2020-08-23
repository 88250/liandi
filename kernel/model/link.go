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
	"github.com/88250/lute/util"
	"sort"

	"github.com/88250/lute/ast"
)

var (
	forwardlinks []*Block // 正向链接关系 refs
	backlinks    []*Block // 反向链接关系 defs
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
	rebuildLinks()

	ret = []*Block{}
	for _, def := range backlinks {
		if def.URL != url || def.Path != path {
			continue
		}

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

	*depth++
	ret.Def = cloneBlock(block.Def, depth)
	for _, ref := range block.Refs {
		ret.Refs = append(ret.Refs, cloneBlock(ref, depth))
	}
	*depth--
	return
}

func Backlinks() (ret DefRefs) {
	rebuildLinks()

	for _, block := range forwardlinks {
		ret = append(ret, &DefRef{block.Def, block.Refs})
	}
	sort.Sort(ret)
	return
}

func rebuildLinks() {
	graphLock.Lock()
	defer graphLock.Unlock()

	forwardlinks = []*Block{}
	backlinks = []*Block{}

	// 捞出所有内容块定义和引用节点
	var defs, refs []*ast.Node
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkStop
			}

			if ast.NodeDocument == n.Type || ast.NodeDocument == n.Parent.Type {
				n.URL, n.Path = tree.URL, tree.Path
				defs = append(defs, n)
			} else if ast.NodeBlockRefID == n.Type {
				n.URL, n.Path = tree.URL, tree.Path
				refs = append(refs, n)
			}
			return ast.WalkContinue
		})
	}

	// 构建正向链接
	for _, def := range defs {
		block := buildBlock(def)
		for _, ref := range refs {
			if def.ID == util.BytesToStr(ref.Tokens) {
				refBlock := buildBlock(refParentBlock(ref))
				block.Refs = append(block.Refs, refBlock)
			}
		}
		backlinks = append(backlinks, block)
	}

	// 构建反向链接
	for _, ref := range refs {
		block := buildBlock(refParentBlock(ref))
		for _, def := range defs {
			if def.ID == util.BytesToStr(ref.Tokens) {
				block.Def = buildBlock(def)
				forwardlinks = append(forwardlinks, block)
			}
		}
	}
}

func buildBlock(node *ast.Node) (ret *Block) {
	content := renderBlockText(node)
	return &Block{URL: node.URL, Path: node.Path, ID: node.ID, Type: node.Type.String(), Content: content}
}

func refParentBlock(ref *ast.Node) *ast.Node {
	for p := ref.Parent; nil != p; p = p.Parent {
		if "" != p.ID {
			return p
		}
	}
	return nil
}
