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
	"time"

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/util"
)

var (
	// trees 用于维护所有已挂载的文档抽象语法树。
	trees []*parse.Tree
)

type Block struct {
	URL     string `json:"url"`
	Path    string `json:"path"`
	ID      string `json:"id"`
	Content string `json:"content"`
}

func (dir *Dir) MoveTree(url, path, newPath string) {
	for _, tree := range trees {
		if tree.URL == url && tree.Path == path {
			tree.Path = newPath
			break
		}
	}
}

func (dir *Dir) RemoveTree(url, path string) {
	for i, tree := range trees {
		if tree.URL == url && tree.Path == path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
}

func (dir *Dir) ParseIndexTree(url, path, markdown string) {
	tree := parse.Parse("", util.StrToBytes(markdown), Lute.Options)
	tree.URL = url
	tree.Path = path

	ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if "" == n.ID {
			n.ID = time.Now().Format("20060102150405") + "-" + gulu.Rand.String(6)
		}
		return ast.WalkContinue
	})

	dir.IndexTree(tree)
}

func (dir *Dir) IndexTree(tree *parse.Tree) {
	for i, t := range trees {
		if tree.URL == t.URL && tree.Path == t.Path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
	trees = append(trees, tree)
}

func (dir *Dir) queryTree(url, path string) *parse.Tree {
	for _, t := range trees {
		if url == t.URL && path == t.Path {
			return t
		}
	}
	return nil
}

func SearchBlock(keyword string) (ret []*Block) {
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkContinue
			}

			if ast.NodeHeading != n.Type && ast.NodeParagraph != n.Type {
				return ast.WalkContinue
			}

			text := n.Text()
			if strings.Contains(text, keyword) {
				block := &Block{URL: tree.URL, Path: tree.Path, ID: n.ID, Content: text}
				ret = append(ret, block)
			}
			return ast.WalkSkipChildren
		})
	}
	return
}
