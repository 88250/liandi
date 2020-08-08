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
	"github.com/88250/lute/util"
	"strconv"
)

// ParseJSON 用于解析 jsonStr 生成 Markdown 抽象语法树。
func ParseJSON(jsonStr string) (ret *parse.Tree, err error) {
	var root map[string]interface{}
	err = json.Unmarshal(util.StrToBytes(jsonStr), &root)
	if nil != err {
		return nil, err
	}

	ret = &parse.Tree{Name: "", Root: &ast.Node{Type: ast.NodeDocument}, Context: &parse.Context{Option: Lute.Options}}
	ret.Context.Tip = ret.Root
	children := root["Children"]
	if nil == children {
		return
	}
	childNodes := children.([]interface{})
	for _, child := range childNodes {
		genASTByJSON(child, ret)
	}
	return
}

func genASTByJSON(jsonNode interface{}, tree *parse.Tree) {
	n := jsonNode.(map[string]interface{})
	typ := n["Type"].(string)
	node := &ast.Node{Type: ast.Str2NodeType(typ)}
	val := n["Val"]
	if nil != val {
		node.Tokens = util.StrToBytes(n["Val"].(string))
	}
	node.ID = n["ID"].(string)
	switch node.Type {
	case ast.NodeCodeBlock:
		node.IsFencedCodeBlock = n["IsFencedCodeBlock"].(bool)
	case ast.NodeCodeBlockFenceOpenMarker:
		node.CodeBlockOpenFence = node.Tokens
	case ast.NodeCodeBlockFenceCloseMarker:
		node.CodeBlockCloseFence = node.Tokens
	case ast.NodeHeading:
		node.HeadingLevel, _ = strconv.Atoi(string(node.Tokens))
		node.HeadingSetext = n["HeadingSetext"].(bool)
	case ast.NodeList:
		listDataTyp, _ := strconv.Atoi(string(node.Tokens))
		node.ListData = &ast.ListData{Typ: listDataTyp}
	case ast.NodeListItem:
		listDataTyp := tree.Context.Tip.ListData.Typ
		marker := node.Tokens
		node.ListData = &ast.ListData{Typ: listDataTyp, Marker: marker}
	case ast.NodeEmojiUnicode, ast.NodeEmojiImg, ast.NodeHTMLEntity:
		node.Type = ast.NodeText
	}
	tree.Context.Tip.AppendChild(node)
	tree.Context.Tip = node
	defer tree.Context.ParentTip()

	if nil == n["Children"] {
		return
	}
	children := n["Children"].([]interface{})
	for _, child := range children {
		genASTByJSON(child, tree)
	}
}

// RenderJSON 用于渲染 JSON 格式数据。
func RenderJSON(markdown string) (retJSON string) {
	tree := parse.Parse("", []byte(markdown), Lute.Options)
	renderer := NewJSONRenderer(tree)
	output := renderer.Render()
	retJSON = string(output)
	return
}

func WriteASTJSON(tree *parse.Tree) error {
	renderer := NewJSONRenderer(tree)
	output := renderer.Render()

	dir := Conf.dir(tree.URL)
	if err := dir.Put(tree.Path+".json", output); nil != err {
		return err
	}
	return nil
}

func ReadASTJSON(url, p string) (jsonStr string, err error) {
	dir := Conf.dir(url)
	jsonStr, err = dir.Get(p)
	return
}
