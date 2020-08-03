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
	"path/filepath"
	"strings"

	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
)

func InitSearch() {
	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

var (
	// trees 用于维护所有已挂载的文档抽象语法树。
	trees []*parse.Tree

	// docs 用于维护所有已挂载的文档。
	docs []*Doc
)

type Doc struct {
	URL     string
	Path    string
	Content string
}

type Snippet struct {
	URL     string `json:"url"`
	Path    string `json:"path"`
	Ln      int    `json:"ln"`
	Col     int    `json:"col"`
	Index   int    `json:"index"`
	Content string `json:"content"`
}

func genDocId(url, path string) string {
	return url + path
}

func newDoc(url, path, content string) *Doc {
	return &Doc{URL: url, Path: path, Content: content}
}

func newTree(url, path, content string) (ret *parse.Tree) {
	ret = parse.Parse("", util.StrToBytes(content), Lute.Options)
	ret.Dir = url
	ret.Path = path
	return
}

func (dir *Dir) RemoveIndexDoc(url, path string) {
	for i, doc := range docs {
		if doc.URL == url && doc.Path == path {
			docs = docs[:i+copy(docs[i:], docs[i+1:])]
			break
		}
	}
}

func (dir *Dir) RemoveTree(url, path string) {
	for i, tree := range trees {
		if tree.Dir == url && tree.Path == path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
}

func (dir *Dir) IndexDoc(doc *Doc) {
	for i, d := range docs {
		if doc.URL == d.URL && doc.Path == d.Path {
			docs = docs[:i+copy(docs[i:], docs[i+1:])]
			break
		}
	}
	docs = append(docs, doc)
}

func (dir *Dir) IndexTree(tree *parse.Tree) {
	for i, t := range trees {
		if tree.Dir == t.Dir && tree.Path == t.Path {
			trees = trees[:i+copy(trees[i:], trees[i+1:])]
			break
		}
	}
	trees = append(trees, tree)
}

func Search(keyword string) (ret []*Snippet) {
	ret = []*Snippet{}
	for _, doc := range docs {
		snippets := searchDoc(keyword, doc)
		ret = append(ret, snippets...)
	}
	return
}

func searchDoc(keyword string, doc *Doc) (ret []*Snippet) {
	lines := strings.Split(doc.Content, "\n")
	index := 0
	for idx, line := range lines {
		if pos := strings.Index(strings.ToLower(line), strings.ToLower(keyword)); -1 != pos {
			highlight := line[0:pos] + "<mark>" + line[pos:pos+len(keyword)] + "</mark>" + line[pos+len(keyword):]
			snippet := &Snippet{URL: doc.URL, Path: filepath.ToSlash(doc.Path), Ln: idx + 1, Col: pos + 1, Index: index, Content: highlight}
			ret = append(ret, snippet)
			index++
		}
	}
	return ret
}

func SearchBlock(keyword string) (blocks []*ast.Node) {
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
				blocks = append(blocks, n)
			}
			return ast.WalkSkipChildren
		})
	}
	return
}
