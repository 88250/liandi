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

	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/util"
)

func convertWikiLinks(trees []*parse.Tree) {
	defer Recover()

	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering || ast.NodeText != n.Type {
				return ast.WalkContinue
			}

			text := util.BytesToStr(n.Tokens)
			length := len(text)
			start, end := 0, length
			for {
				part := text[start:end]
				if idx := strings.Index(part, "]]"); 0 > idx {
					break
				} else {
					end = start + idx
				}
				if idx := strings.Index(part, "[["); 0 > idx {
					break
				} else {
					start += idx
				}
				if end <= start {
					break
				}

				link := path.Join(path.Dir(tree.Path), text[start+2:end]) // 统一转为绝对路径方便后续查找
				linkText := link
				if linkParts := strings.Split(link, "|"); 1 < len(linkParts) {
					link = linkParts[0]
					linkText = linkParts[1]
				}
				link, linkText = strings.TrimSpace(link), strings.TrimSpace(linkText)
				if !strings.Contains(link, "#") {
					link += "#" // 在结尾统一带上锚点方便后续查找
				}

				id := searchLinkID(trees, link)
				if "" == id {
					start, end = end, length
					continue
				}

				repl := "((" + id + " \"" + linkText + "\"))"
				end += 2
				text = text[:start] + repl + text[end:]
				start, end = start+len(repl), len(text)
				length = end
			}
			n.Tokens = util.StrToBytes(text)
			return ast.WalkContinue
		})
	}

	// 将文本节点进行结构化处理
	buildBlockRefInText(trees)
}

func buildBlockRefInText(trees []*parse.Tree) {
	for _, tree := range trees {
		var unlinkTextNodes []*ast.Node
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering || ast.NodeText != n.Type {
				return ast.WalkContinue
			}

			lute := NewLute()
			t := parse.Parse("", n.Tokens, lute.Options)
			var children []*ast.Node
			if nil != t.Root.FirstChild {
				for c := t.Root.FirstChild.FirstChild; nil != c; c = c.Next {
					children = append(children, c)
				}
			} else {
				// 空白的文本节点
				children = append(children, &ast.Node{Type: n.Type, Tokens: n.Tokens})
			}
			for _, c := range children {
				n.InsertBefore(c)
			}
			unlinkTextNodes = append(unlinkTextNodes, n)
			return ast.WalkContinue
		})

		for _, node := range unlinkTextNodes {
			node.Unlink()
		}
	}
}

func searchLinkID(trees []*parse.Tree, link string) (id string) {
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering || (ast.NodeDocument != n.Type && ast.NodeHeading != n.Type) {
				return ast.WalkContinue
			}

			nodePath := tree.Path + "#"
			if ast.NodeHeading == n.Type {
				nodePath += n.Text()
			}

			if nodePath == link {
				id = n.ID
				return ast.WalkStop
			}
			return ast.WalkContinue
		})
		if "" != id {
			return
		}
	}
	return
}
