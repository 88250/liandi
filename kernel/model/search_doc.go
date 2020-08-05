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
)

func InitIndex() {
	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

var (
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

func (dir *Dir) MoveIndexDoc(url, path, newPath string) {
	for _, d := range docs {
		if url == d.URL && path == d.Path {
			d.Path = newPath
			break
		}
	}
}

func (dir *Dir) RemoveIndexDoc(url, path string) {
	for i, doc := range docs {
		if doc.URL == url && doc.Path == path {
			docs = docs[:i+copy(docs[i:], docs[i+1:])]
			break
		}
	}
}

func (dir *Dir) IndexDoc(url, path, content string) {
	doc := &Doc{URL: url, Path: path, Content: content}
	for i, d := range docs {
		if doc.URL == d.URL && doc.Path == d.Path {
			docs = docs[:i+copy(docs[i:], docs[i+1:])]
			break
		}
	}
	docs = append(docs, doc)
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
			snippet := &Snippet{URL: doc.URL, Path: doc.Path, Ln: idx + 1, Col: pos + 1, Index: index, Content: highlight}
			ret = append(ret, snippet)
			index++
		}
	}
	return ret
}
