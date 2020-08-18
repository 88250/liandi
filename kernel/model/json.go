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
)

// ParseJSON 用于解析 jsonStr 生成 Markdown 抽象语法树。
func ParseJSON(jsonStr string) (ret *parse.Tree, err error) {
	root := &ast.Node{}
	err = json.Unmarshal(util.StrToBytes(jsonStr), root)
	if nil != err {
		return nil, err
	}

	ret = &parse.Tree{Name: "", Root: &ast.Node{Type: ast.NodeDocument, ID: root.ID}, Context: &parse.Context{Option: Lute.Options}}
	ret.Context.Tip = ret.Root
	if nil == root.Children {
		return
	}
	for _, child := range root.Children {
		genASTByJSON(child, ret)
	}
	ret.ID = ret.Root.ID
	return
}

func genASTByJSON(node *ast.Node, tree *parse.Tree) {
	tree.Context.Tip.AppendChild(node)
	tree.Context.Tip = node
	defer tree.Context.ParentTip()
	if nil == node.Children {
		return
	}
	for _, child := range node.Children {
		genASTByJSON(child, tree)
	}
}

func WriteASTJSON(tree *parse.Tree) error {
	renderer := NewJSONRenderer(tree)
	output := renderer.Render()

	box := Conf.Box(tree.URL)
	if err := box.Put(tree.Path+".md.json", output); nil != err {
		return err
	}
	return nil
}

func ReadASTJSON(url, p string) (jsonStr string, err error) {
	box := Conf.Box(url)
	jsonStr, err = box.Get(p)
	return
}
