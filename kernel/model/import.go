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
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering || ast.NodeText != n.Type {
				return ast.WalkContinue
			}

			text := util.BytesToStr(n.Tokens)
			length := len(text)
			start := 0
			end := length
			for {
				part := text[start:end]
				start = strings.Index(part, "[[")
				if 0 > start {
					break
				}
				start += 2
				end = strings.Index(part, "]]")
				if 0 > end {
					break
				}

				link := path.Join(path.Dir(tree.Path), text[start:end])
				linkText := link
				linkParts := strings.Split(link, "|")
				if 1 < len(linkParts) {
					link = linkParts[0]
					linkText = linkParts[1]
				}
				link = strings.TrimSpace(link)
				linkText = strings.TrimSpace(linkText)
				if !strings.Contains(link, "#") {
					// 在结尾统一带上锚点
					link += "#"
				}

				id := searchLinkID(trees, link)
				if "" == id {
					start = end
					end = length
					continue
				}

				newText := text[:start-2] + "((" + id
				if "" != linkText {
					newText += " \"" + linkText + "\"))" + text[end+2:]
				}
				text = newText

				start = end
				end = length
			}
			n.Tokens = util.StrToBytes(text)
			return ast.WalkContinue
		})
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
