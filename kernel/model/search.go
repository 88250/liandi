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
	"path"
	"strings"
	"unicode/utf8"

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
	Type    string `json:"type"`
}

type Snippet struct {
	Box     *Box   `json:"box"`
	Path    string `json:"path"`
	Index   int    `json:"index"`
	Content string `json:"content"`
	Type    string `json:"type"`
}

func InitIndex() {
	for _, box := range Conf.Boxes {
		go box.Index()
	}
}

func (box *Box) MoveTree(p, newPath string) {
	for _, tree := range trees {
		if tree.URL == box.URL && tree.Path == p {
			tree.Path = newPath
			tree.Name = path.Base(p)
			break
		}
	}
}

func (box *Box) RemoveTreeDir(dirPath string) {
	for i := 0; i < len(trees); i++ {
		if trees[i].URL == box.URL && strings.HasPrefix(trees[i].Path, dirPath) {
			trees = append(trees[:i], trees[i+1:]...)
			i--
		}
	}
}

func (box *Box) MoveTreeDir(dirPath, newDirPath string) {
	for _, tree := range trees {
		if tree.URL == box.URL && strings.HasPrefix(tree.Path, dirPath) {
			tree.Path = strings.Replace(tree.Path, dirPath, newDirPath, -1)
		}
	}
}

func (box *Box) RemoveTree(path string) {
	for i, tree := range trees {
		if tree.URL == box.URL && tree.Path == path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
}

func (box *Box) ParseIndexTree(p, markdown string) (ret *parse.Tree) {
	ret = parse.Parse("", util.StrToBytes(markdown), Lute.Options)
	ret.URL = box.URL
	ret.Path = p[:len(p)-len(path.Ext(p))]
	ret.Name = path.Base(ret.Path)
	ret.ID = ast.NewNodeID()
	ret.Root.ID = ret.ID
	ast.Walk(ret.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if "" == n.ID && nil != n.Parent && ast.NodeDocument == n.Parent.Type {
			n.ID = ast.NewNodeID()
		}
		return ast.WalkContinue
	})
	return
}

func (box *Box) IndexTree(tree *parse.Tree) {
	for i, t := range trees {
		if tree.URL == t.URL && tree.Path == t.Path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
	trees = append(trees, tree)
}

func (box *Box) Tree(path string) *parse.Tree {
	for _, t := range trees {
		if box.URL == t.URL && path == t.Path {
			return t
		}
	}
	return nil
}

func GetBlock(id string) (ret *Block) {
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkContinue
			}

			if nil != n.Parent && ast.NodeDocument != n.Parent.Type {
				// 仅支持根节点的直接子节点
				return ast.WalkContinue
			}

			if isSearchBlockSkipNode(n) {
				return ast.WalkStop
			}

			if id == n.ID {
				text := renderBlockHTML(n)
				ret = &Block{URL: tree.URL, Path: tree.Path, ID: n.ID, Type: n.Type.String(), Content: text}
				return ast.WalkStop
			}
			return ast.WalkContinue
		})
	}
	return
}

func SearchBlock(url, keyword string) (ret []*Block) {
	ret = []*Block{}
	keyword = strings.TrimSpace(keyword)
	if "" == keyword {
		return
	}
	for _, tree := range trees {
		if tree.URL != url {
			continue
		}

		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkContinue
			}

			if nil != n.Parent && ast.NodeDocument != n.Parent.Type {
				// 仅支持根节点的直接子节点
				return ast.WalkContinue
			}

			if isSearchBlockSkipNode(n) {
				return ast.WalkStop
			}

			text := renderBlockText(n)
			if ast.NodeDocument == n.Type {
				text = tree.Name + "  " + text
			}

			pos, marked := markSearch(text, keyword)
			if -1 < pos {
				block := &Block{URL: tree.URL, Path: tree.Path, ID: n.ID, Type: n.Type.String(), Content: marked}
				ret = append(ret, block)
			}

			if 16 <= len(ret) { // TODO: 这里需要按树分组优化
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
	return "" == node.ID ||
		ast.NodeText == node.Type || ast.NodeThematicBreak == node.Type ||
		ast.NodeHTMLBlock == node.Type || ast.NodeInlineHTML == node.Type || ast.NodeCodeBlock == node.Type ||
		ast.NodeMathBlock == node.Type || ast.NodeInlineMath == node.Type ||
		ast.NodeCodeSpan == node.Type || ast.NodeHardBreak == node.Type || ast.NodeSoftBreak == node.Type ||
		ast.NodeHTMLEntity == node.Type || ast.NodeYamlFrontMatter == node.Type
}

func Search(keyword string) (ret []*Snippet) {
	ret = []*Snippet{}
	if "" == keyword {
		return
	}

	idx := 0
	for _, tree := range trees {
		box := Conf.Box(tree.URL)
		pos, marked := markSearch(tree.Name, keyword)
		if -1 < pos {
			ret = append(ret, &Snippet{
				Box:     box,
				Path:    tree.Path,
				Index:   idx,
				Content: marked,
				Type:    "title",
			})
			idx++
		}
	}

	for _, tree := range trees {
		box := Conf.Box(tree.URL)
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering {
				return ast.WalkContinue
			}

			if ast.NodeDocument == n.Type || ast.NodeDocument != n.Parent.Type {
				// 仅支持根节点的直接子节点
				return ast.WalkContinue
			}

			if isSearchBlockSkipNode(n) {
				return ast.WalkStop
			}

			text := renderBlockText(n)
			pos, marked := markSearch(text, keyword)
			if -1 < pos {
				ret = append(ret, &Snippet{
					Box:     box,
					Path:    tree.Path,
					Index:   idx,
					Content: marked,
					Type:    "content",
				})
				idx++
			}

			if 16 <= len(ret) {
				return ast.WalkStop
			}

			if ast.NodeList == n.Type {
				return ast.WalkSkipChildren
			}
			return ast.WalkContinue
		})
		idx++
	}
	return
}

func markSearch(text, keyword string) (pos int, marked string) {
	if pos = strings.Index(strings.ToLower(text), strings.ToLower(keyword)); -1 != pos {
		var before []rune
		var count int
		for i := pos; 0 < i; { // 关键字前面太长的话缩短一些
			r, size := utf8.DecodeLastRuneInString(text[:i])
			i -= size
			before = append([]rune{r}, before...)
			count++
			if 32 < count {
				break
			}
		}
		marked = string(before) + "<mark>" + text[pos:pos+len(keyword)] + "</mark>" + text[pos+len(keyword):]
	}
	return
}
