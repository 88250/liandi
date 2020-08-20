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
	treeBacklinks     = map[*parse.Tree]map[BacklinkDef][]*BacklinkRef{} // 反向链接关系：块被哪些块用了
	treeBacklinksLock = &sync.Mutex{}                                    // 全局反链锁，构建反链和图的时候需要加锁
)

type BacklinkDef *ast.Node

type BacklinkRef struct {
	URL, Path string
	RefNodes  []*ast.Node
}

type Refs []*BacklinkRef

func (r Refs) Len() int           { return len(r) }
func (r Refs) Less(i, j int) bool { return len(r[i].RefNodes) < len(r[j].RefNodes) }
func (r Refs) Swap(i, j int)      { r[i], r[j] = r[j], r[i] }

type BacklinkRefBlock struct {
	URL    string   `json:"url"`
	Path   string   `json:"path"`
	Blocks []*Block `json:"blocks"`
}

//type BacklinkDefBlock struct {
//	URL       string              `json:"url"`
//	Path      string              `json:"path"`
//	RefBlocks []*BacklinkRefBlock `json:"refBlocks"`
//}

func TreeBacklinks(url, path string) (ret []*BacklinkRefBlock, err error) {
	box := Conf.Box(url)
	if nil == box {
		return nil, errors.New(Conf.lang(0))
	}

	tree := box.Tree(path)
	ret = indexLink(tree)
	return
}

func Backlinks() (ret []*BacklinkRefBlock) {
	ret = []*BacklinkRefBlock{}

	rebuildBacklinks()
	defRefs := map[BacklinkDef][]*BacklinkRef{}
	for _, backlinkDefs := range treeBacklinks {
		for def, backlinkRefs := range backlinkDefs {
			if refs, ok := defRefs[def]; ok {
				defRefs[def] = append(defRefs[def], refs...)
			} else {
				defRefs[def] = backlinkRefs
			}
		}
	}

	var allRefs Refs
	for _, refs := range defRefs {
		for _, ref := range refs {
			allRefs = append(allRefs, ref)
		}
	}
	sort.Sort(allRefs)

	for _, ref := range allRefs {
		blocks := buildRefBlockBlocks(ref)
		if nil != blocks {
			ret = append(ret, &BacklinkRefBlock{URL: ref.URL, Path: ref.Path, Blocks: blocks})
		}
	}
	return
}

func rebuildBacklinks() {
	graphLock.Lock()
	defer graphLock.Unlock()

	for _, tree := range trees {
		delete(treeBacklinks, tree)
	}

	for _, tree := range trees {
		indexLink(tree)
	}
}

func indexLink(tree *parse.Tree) (ret []*BacklinkRefBlock) {
	treeBacklinksLock.Lock()
	defer treeBacklinksLock.Unlock()

	ret = []*BacklinkRefBlock{}
	// 找到当前块列表
	var currentBlocks []BacklinkDef
	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkStop
		}

		if isSearchBlockSkipNode(n) {
			return ast.WalkStop
		}

		currentBlocks = append(currentBlocks, n)
		return ast.WalkContinue
	})

	// 清理当前树的块链关系
	delete(treeBacklinks, tree)

	// 构建链接关系
	backlinks := map[BacklinkDef][]*BacklinkRef{}
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
			backlinks[currentBlock] = append(backlinks[currentBlock], &BacklinkRef{URL: tree.URL, Path: tree.Path, RefNodes: refNodes})
		}
	}

	treeBacklinks[tree] = backlinks

	// 组装当前块的反链列表
	for _, currentBlock := range currentBlocks {
		for _, backlinkRef := range backlinks[currentBlock] {
			blocks := buildRefBlockBlocks(backlinkRef)
			if nil != blocks {
				ret = append(ret, &BacklinkRefBlock{URL: backlinkRef.URL, Path: backlinkRef.Path, Blocks: blocks})
			}
		}
	}
	return
}

func buildRefBlockBlocks(ref *BacklinkRef) (ret []*Block) {
	for _, refNode := range ref.RefNodes {
		content := renderBlockText(refNode)
		block := &Block{URL: ref.URL, Path: ref.Path, ID: refNode.ID, Type: refNode.Type.String(), Content: content}
		ret = append(ret, block)
	}
	return
}

func refParentBlock(ref *ast.Node) *ast.Node {
	for p := ref.Parent; nil != p; p = p.Parent {
		if "" != p.ID {
			return p
		}
	}
	return nil
}
