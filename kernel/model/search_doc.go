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
	"unicode/utf8"

	"github.com/88250/lute/ast"
)

func InitIndex() {
	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

type Doc struct {
	URL     string
	Path    string
	Content string
}

type Snippet struct {
	Dir     *Dir   `json:"dir"`
	Path    string `json:"path"`
	Index   int    `json:"index"`
	Content string `json:"content"`
	Type    string `json:"type"`
}

func Search(keyword string) (ret []*Snippet) {
	ret = []*Snippet{}
	if "" == keyword {
		return
	}

	idx := 0
	for _, tree := range trees {
		dir := Conf.Dir(tree.URL)
		pos, marked := markSearch(tree.Name, keyword)
		if -1 < pos {
			ret = append(ret, &Snippet{
				Dir:     dir,
				Path:    tree.Path,
				Index:   idx,
				Content: marked,
				Type:    "title",
			})
			idx++
		}
	}

	for _, tree := range trees {
		dir := Conf.Dir(tree.URL)
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

			text := n.Text()

			pos, marked := markSearch(text, keyword)
			if -1 < pos {
				ret = append(ret, &Snippet{
					Dir:     dir,
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
