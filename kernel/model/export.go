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
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/render"
	"github.com/88250/lute/util"
	"strings"
)

func ExportMarkdown(url, p string) string {
	box := Conf.Box(url)
	if nil == box {
		return Conf.lang(0)
	}

	tree := box.Tree(p)
	formatRenderer := render.NewFormatRenderer(tree)
	md := formatRenderer.Render()

	luteEngine := NewLute()
	exportTree := parse.Parse("", md, luteEngine.Options)
	var refNodes []*ast.Node
	ast.Walk(exportTree.Root, func(n *ast.Node, entering bool) ast.WalkStatus {
		if !entering {
			return ast.WalkContinue
		}

		if ast.NodeBlockRef != n.Type {
			return ast.WalkContinue
		}

		id := n.ChildByType(ast.NodeBlockRefID)
		def := getBlock(tree.URL, util.BytesToStr(id.Tokens))
		if nil == def {
			return ast.WalkContinue
		}

		text := n.ChildByType(ast.NodeBlockRefText)

		defMd := renderBlockMarkdown(def)
		buf := &bytes.Buffer{}
		if "*" != text.Text() {
			buf.WriteString("**" + text.Text() + "**")
		}
		buf.WriteString("\n\n")
		buf.WriteString("> **" + text.Text() + "**\n> \n")
		lines := strings.Split(defMd, "\n")
		for i, line := range lines {
			buf.WriteString("> " + line)
			if i < len(lines)-1 {
				buf.WriteString("\n")
			}
		}
		buf.WriteString("\n\n")

		bqContent := &ast.Node{Type: ast.NodeText, Tokens: buf.Bytes()}
		n.InsertBefore(bqContent)
		refNodes = append(refNodes, n)
		return ast.WalkSkipChildren
	})

	for _, ref := range refNodes {
		ref.Unlink()
	}
	return renderBlockMarkdown(exportTree.Root)
}
