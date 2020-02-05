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
	Path     string   `json:"path"`
	Line     int      `json:"line"`
	Ch       int      `json:"ch"`
	Contents []string `json:"contents"`
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
	docs = append(docs, doc)
}

func Search(text string) (ret []*Snippet) {
	return
}
