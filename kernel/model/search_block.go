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
	"github.com/88250/lute/html"
	"path"
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
	Type    string `json:"type"`
	Content string `json:"content"`
}

func (dir *Dir) MoveTree(p, newPath string) {
	for _, tree := range trees {
		if tree.URL == dir.URL && tree.Path == p {
			tree.Path = newPath
			tree.Name = path.Base(p)
			break
		}
	}
}

func (dir *Dir) RemoveTreeDir(dirPath string) {
	for i := 0; i < len(trees); i++ {
		if trees[i].URL == dir.URL && strings.HasPrefix(trees[i].Path, dirPath) {
			trees = append(trees[:i], trees[i+1:]...)
			i--
		}
	}
}

func (dir *Dir) MoveTreeDir(dirPath, newDirPath string) {
	for _, tree := range trees {
		if tree.URL == dir.URL && strings.HasPrefix(tree.Path, dirPath) {
			tree.Path = strings.Replace(tree.Path, dirPath, newDirPath, -1)
			tree.Name = path.Base(tree.Path)
		}
	}
}

func (dir *Dir) RemoveTree(path string) {
	for i, tree := range trees {
		if tree.URL == dir.URL && tree.Path == path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
}

func (dir *Dir) ParseIndexTree(p, markdown string) (ret *parse.Tree) {
	ret = parse.Parse("", util.StrToBytes(markdown), Lute.Options)
	ret.URL = dir.URL
	ret.Path = p[:len(p)-len(path.Ext(p))]
	ret.Name = path.Base(ret.Path)
	ast.Walk(ret.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if "" == n.ID {
			n.ID = time.Now().Format("20060102150405") + "-" + gulu.Rand.String(6)
		}
		return ast.WalkContinue
	})
	return
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

func (dir *Dir) Tree(path string) *parse.Tree {
	for _, t := range trees {
		if dir.URL == t.URL && path == t.Path {
			return t
		}
	}
	return nil
}

func SearchBlock(keyword string) (ret []*Block) {
	ret = []*Block{}
	keyword = strings.TrimSpace(keyword)
	if "" == keyword {
		return
	}
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkContinue
			}

			if ast.NodeDocument == n.Type {
				//u := html.EscapeString(tree.URL)
				//p := html.EscapeString(tree.Path)
				//c := html.EscapeString(tree.Name)
				//block := &Block{URL: u, Path: p, ID: n.ID, Type: n.Type.String(), Content: c}
				//ret = append(ret, block)
				return ast.WalkContinue
			}

			if ast.NodeDocument != n.Parent.Type {
				// 仅支持根节点的直接子节点
				return ast.WalkContinue
			}

			if isSearchBlockSkipNode(n) {
				return ast.WalkStop
			}

			text := n.Text()
			if strings.Contains(text, keyword) {
				u := html.EscapeString(tree.URL)
				p := html.EscapeString(tree.Path)
				c := html.EscapeString(text)
				block := &Block{URL: u, Path: p, ID: n.ID, Content: c}
				ret = append(ret, block)
			}

			if 64 <= len(ret) { // TODO: 这里需要按树分组优化
				return ast.WalkStop
			}

			if ast.NodeList == n.Type {
				return ast.WalkSkipChildren
			}
			return ast.WalkContinue
		})
	}
	return
}

func isSearchBlockSkipNode(node *ast.Node) bool {
	return ast.NodeText == node.Type || ast.NodeThematicBreak == node.Type ||
		ast.NodeHTMLBlock == node.Type || ast.NodeInlineHTML == node.Type || ast.NodeCodeBlock == node.Type ||
		ast.NodeCodeSpan == node.Type || ast.NodeHardBreak == node.Type || ast.NodeSoftBreak == node.Type ||
		ast.NodeHTMLEntity == node.Type
}
