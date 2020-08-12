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
	"encoding/json"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/parse"
	"github.com/88250/lute/render"
	"github.com/88250/lute/util"
)

// JSONRenderer 描述了 JSON 渲染器。
type JSONRenderer struct {
	*render.BaseRenderer
}

// NewJSONRenderer 创建一个 JSON 渲染器。
func NewJSONRenderer(tree *parse.Tree) render.Renderer {
	ret := &JSONRenderer{render.NewBaseRenderer(tree)}
	ret.RendererFuncs[ast.NodeDocument] = ret.renderDocument
	ret.RendererFuncs[ast.NodeParagraph] = ret.renderParagraph
	ret.RendererFuncs[ast.NodeText] = ret.renderText
	ret.RendererFuncs[ast.NodeCodeSpan] = ret.renderCodeSpan
	ret.RendererFuncs[ast.NodeCodeSpanOpenMarker] = ret.renderCodeSpanOpenMarker
	ret.RendererFuncs[ast.NodeCodeSpanContent] = ret.renderCodeSpanContent
	ret.RendererFuncs[ast.NodeCodeSpanCloseMarker] = ret.renderCodeSpanCloseMarker
	ret.RendererFuncs[ast.NodeCodeBlock] = ret.renderCodeBlock
	ret.RendererFuncs[ast.NodeCodeBlockFenceOpenMarker] = ret.renderCodeBlockOpenMarker
	ret.RendererFuncs[ast.NodeCodeBlockFenceInfoMarker] = ret.renderCodeBlockInfoMarker
	ret.RendererFuncs[ast.NodeCodeBlockCode] = ret.renderCodeBlockCode
	ret.RendererFuncs[ast.NodeCodeBlockFenceCloseMarker] = ret.renderCodeBlockCloseMarker
	ret.RendererFuncs[ast.NodeMathBlock] = ret.renderMathBlock
	ret.RendererFuncs[ast.NodeMathBlockOpenMarker] = ret.renderMathBlockOpenMarker
	ret.RendererFuncs[ast.NodeMathBlockContent] = ret.renderMathBlockContent
	ret.RendererFuncs[ast.NodeMathBlockCloseMarker] = ret.renderMathBlockCloseMarker
	ret.RendererFuncs[ast.NodeInlineMath] = ret.renderInlineMath
	ret.RendererFuncs[ast.NodeInlineMathOpenMarker] = ret.renderInlineMathOpenMarker
	ret.RendererFuncs[ast.NodeInlineMathContent] = ret.renderInlineMathContent
	ret.RendererFuncs[ast.NodeInlineMathCloseMarker] = ret.renderInlineMathCloseMarker
	ret.RendererFuncs[ast.NodeEmphasis] = ret.renderEmphasis
	ret.RendererFuncs[ast.NodeEmA6kOpenMarker] = ret.renderEmAsteriskOpenMarker
	ret.RendererFuncs[ast.NodeEmA6kCloseMarker] = ret.renderEmAsteriskCloseMarker
	ret.RendererFuncs[ast.NodeEmU8eOpenMarker] = ret.renderEmUnderscoreOpenMarker
	ret.RendererFuncs[ast.NodeEmU8eCloseMarker] = ret.renderEmUnderscoreCloseMarker
	ret.RendererFuncs[ast.NodeStrong] = ret.renderStrong
	ret.RendererFuncs[ast.NodeStrongA6kOpenMarker] = ret.renderStrongA6kOpenMarker
	ret.RendererFuncs[ast.NodeStrongA6kCloseMarker] = ret.renderStrongA6kCloseMarker
	ret.RendererFuncs[ast.NodeStrongU8eOpenMarker] = ret.renderStrongU8eOpenMarker
	ret.RendererFuncs[ast.NodeStrongU8eCloseMarker] = ret.renderStrongU8eCloseMarker
	ret.RendererFuncs[ast.NodeBlockquote] = ret.renderBlockquote
	ret.RendererFuncs[ast.NodeBlockquoteMarker] = ret.renderBlockquoteMarker
	ret.RendererFuncs[ast.NodeHeading] = ret.renderHeading
	ret.RendererFuncs[ast.NodeHeadingC8hMarker] = ret.renderHeadingC8hMarker
	ret.RendererFuncs[ast.NodeHeadingID] = ret.renderHeadingID
	ret.RendererFuncs[ast.NodeList] = ret.renderList
	ret.RendererFuncs[ast.NodeListItem] = ret.renderListItem
	ret.RendererFuncs[ast.NodeThematicBreak] = ret.renderThematicBreak
	ret.RendererFuncs[ast.NodeHardBreak] = ret.renderHardBreak
	ret.RendererFuncs[ast.NodeSoftBreak] = ret.renderSoftBreak
	ret.RendererFuncs[ast.NodeHTMLBlock] = ret.renderHTML
	ret.RendererFuncs[ast.NodeInlineHTML] = ret.renderInlineHTML
	ret.RendererFuncs[ast.NodeLink] = ret.renderLink
	ret.RendererFuncs[ast.NodeImage] = ret.renderImage
	ret.RendererFuncs[ast.NodeBang] = ret.renderBang
	ret.RendererFuncs[ast.NodeOpenBracket] = ret.renderOpenBracket
	ret.RendererFuncs[ast.NodeCloseBracket] = ret.renderCloseBracket
	ret.RendererFuncs[ast.NodeOpenParen] = ret.renderOpenParen
	ret.RendererFuncs[ast.NodeCloseParen] = ret.renderCloseParen
	ret.RendererFuncs[ast.NodeLinkText] = ret.renderLinkText
	ret.RendererFuncs[ast.NodeLinkSpace] = ret.renderLinkSpace
	ret.RendererFuncs[ast.NodeLinkDest] = ret.renderLinkDest
	ret.RendererFuncs[ast.NodeLinkTitle] = ret.renderLinkTitle
	ret.RendererFuncs[ast.NodeStrikethrough] = ret.renderStrikethrough
	ret.RendererFuncs[ast.NodeStrikethrough1OpenMarker] = ret.renderStrikethrough1OpenMarker
	ret.RendererFuncs[ast.NodeStrikethrough1CloseMarker] = ret.renderStrikethrough1CloseMarker
	ret.RendererFuncs[ast.NodeStrikethrough2OpenMarker] = ret.renderStrikethrough2OpenMarker
	ret.RendererFuncs[ast.NodeStrikethrough2CloseMarker] = ret.renderStrikethrough2CloseMarker
	ret.RendererFuncs[ast.NodeTaskListItemMarker] = ret.renderTaskListItemMarker
	ret.RendererFuncs[ast.NodeTable] = ret.renderTable
	ret.RendererFuncs[ast.NodeTableHead] = ret.renderTableHead
	ret.RendererFuncs[ast.NodeTableRow] = ret.renderTableRow
	ret.RendererFuncs[ast.NodeTableCell] = ret.renderTableCell
	ret.RendererFuncs[ast.NodeEmoji] = ret.renderEmoji
	ret.RendererFuncs[ast.NodeEmojiUnicode] = ret.renderEmojiUnicode
	ret.RendererFuncs[ast.NodeEmojiImg] = ret.renderEmojiImg
	ret.RendererFuncs[ast.NodeEmojiAlias] = ret.renderEmojiAlias
	ret.RendererFuncs[ast.NodeFootnotesDef] = ret.renderFootnotesDef
	ret.RendererFuncs[ast.NodeFootnotesRef] = ret.renderFootnotesRef
	ret.RendererFuncs[ast.NodeToC] = ret.renderToC
	ret.RendererFuncs[ast.NodeBackslash] = ret.renderBackslash
	ret.RendererFuncs[ast.NodeBackslashContent] = ret.renderBackslashContent
	ret.RendererFuncs[ast.NodeHTMLEntity] = ret.renderHtmlEntity
	ret.RendererFuncs[ast.NodeYamlFrontMatter] = ret.renderYamlFrontMatter
	ret.RendererFuncs[ast.NodeYamlFrontMatterOpenMarker] = ret.renderYamlFrontMatterOpenMarker
	ret.RendererFuncs[ast.NodeYamlFrontMatterContent] = ret.renderYamlFrontMatterContent
	ret.RendererFuncs[ast.NodeYamlFrontMatterCloseMarker] = ret.renderYamlFrontMatterCloseMarker
	ret.RendererFuncs[ast.NodeBlockRef] = ret.renderBlockRef
	ret.RendererFuncs[ast.NodeBlockRefID] = ret.renderBlockRefID
	ret.RendererFuncs[ast.NodeBlockRefSpace] = ret.renderBlockRefSpace
	ret.RendererFuncs[ast.NodeBlockRefText] = ret.renderBlockRefText
	return ret
}

func (r *JSONRenderer) renderBlockRef(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderBlockRefID(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBlockRefSpace(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBlockRefText(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderYamlFrontMatter(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderYamlFrontMatterCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderYamlFrontMatterContent(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderYamlFrontMatterOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderHtmlEntity(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBackslashContent(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBackslash(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderToC(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderFootnotesRef(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderFootnotesDef(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderInlineMath(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderInlineMathOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderInlineMathContent(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderInlineMathCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderMathBlock(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderMathBlockCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderMathBlockContent(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderMathBlockOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmojiImg(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmojiUnicode(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmojiAlias(node *ast.Node, entering bool) ast.WalkStatus {
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmoji(node *ast.Node, entering bool) ast.WalkStatus {
	return ast.WalkContinue
}

func (r *JSONRenderer) renderTableCell(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderTableRow(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderTableHead(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderTable(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderStrikethrough(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderStrikethrough1OpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrikethrough1CloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrikethrough2OpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrikethrough2CloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderImage(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderCloseParen(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderOpenParen(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCloseBracket(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderOpenBracket(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBang(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderLinkTitle(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderLinkDest(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderLinkSpace(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderLinkText(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderLink(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderHTML(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderInlineHTML(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderDocument(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderParagraph(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderText(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeSpan(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderCodeSpanOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeSpanContent(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeSpanCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmphasis(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderEmAsteriskOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmAsteriskCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmUnderscoreOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderEmUnderscoreCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrong(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderStrongA6kOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrongA6kCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrongU8eOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderStrongU8eCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderBlockquote(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderBlockquoteMarker(node *ast.Node, entering bool) ast.WalkStatus {
	return ast.WalkStop
}

func (r *JSONRenderer) renderHeading(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderHeadingC8hMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderHeadingID(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderList(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderListItem(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderTaskListItemMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderThematicBreak(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderHardBreak(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderSoftBreak(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeBlock(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkContinue
}

func (r *JSONRenderer) renderCodeBlockCloseMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeBlockCode(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeBlockInfoMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderCodeBlockOpenMarker(node *ast.Node, entering bool) ast.WalkStatus {
	r.renderNode(node, entering)
	return ast.WalkStop
}

func (r *JSONRenderer) renderNode(node *ast.Node, entering bool) {
	if entering {
		if nil != node.Previous {
			r.WriteString(",")
		}
		data, err := json.Marshal(node)
		if nil != err {
			Logger.Errorf("持久化节点数据失败：%s", err)
			return
		}
		n := util.BytesToStr(data)
		n = n[:len(n)-1] // 去掉结尾的 }
		r.WriteString(n)
		if nil != node.FirstChild {
			r.WriteString(",\"Children\":[")
		} else {
			r.WriteString("}")
		}
	} else {
		if nil != node.FirstChild {
			r.WriteByte(']')
			r.WriteString("}")
		}
	}
}
