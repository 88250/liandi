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

	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/util"
)

// WikiLink 描述了 [[link|text]] 结构。
type WikiLink struct {
	link string // 链接
	text string // 自定义锚文本
}

func convertWikiLinks(trees []*parse.Tree) {
	for _, tree := range trees {
		ast.Walk(tree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
			if !entering || ast.NodeText != n.Type {
				return ast.WalkContinue
			}

			links := extractWikiLinks(util.BytesToStr(n.Tokens))
			for _, link := range links {
				_ = link
			}
			return ast.WalkContinue
		})
	}
}

func extractWikiLinks(text string) (wikiLinks []*WikiLink) {
	length := len(text)
	start := 0
	end := length
	for {
		part := text[start:end]
		start = strings.Index(part, "[[")
		if 0 > start {
			return
		}
		end = strings.Index(part, "]]")
		if 0 > end {
			return
		}

		link := text[start:end]
		linkText := link
		linkParts := strings.Split(link, "|")
		if 1 < len(linkParts) {
			link = linkParts[0]
			linkText = linkParts[1]
		}
		wikiLink := &WikiLink{
			link: link,
			text: linkText,
		}
		wikiLinks = append(wikiLinks, wikiLink)
		start = end
		end = length
	}
	return
}
