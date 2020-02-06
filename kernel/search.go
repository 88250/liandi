// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// Lute is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
//     http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v1 for more details.

package main

import (
	"path/filepath"
	"strings"
)

func InitSearch() {
	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

var docs []*Doc

type Doc struct {
	URL     string
	Path    string
	Content string
}

type Snippet struct {
	URL     string `json:"url"`
	Path    string `json:"path"`
	Line    int    `json:"line"`
	Pos     int    `json:"pos"`
	Content string `json:"content"`
}

func genDocId(url, path string) string {
	return url + path
}

func newDoc(url, path, content string) (doc *Doc) {
	return &Doc{URL: url, Path: path, Content: content}
}

func (dir *Dir) RemoveIndexDoc(url, path string) {
	for i, doc := range docs {
		if doc.URL == url && doc.Path == path {
			docs = docs[:i+copy(docs[i:], docs[i+1:])]
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
	for idx, line := range lines {
		if pos := strings.Index(strings.ToLower(line), strings.ToLower(keyword)); -1 != pos {
			highlight := line[0:pos] + "<mark>" + line[pos:pos+len(keyword)] + "</mark>" + line[pos+len(keyword):]
			snippet := &Snippet{URL: doc.URL, Path: filepath.ToSlash(doc.Path), Line: idx + 1, Pos: pos, Content: highlight}
			ret = append(ret, snippet)
		}
	}
	return ret
}
