// LianDi - 链滴笔记，链接点滴
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
	"crypto/sha1"
	"encoding/hex"
	stdpath "path"

	"github.com/88250/gulu"
	"github.com/blevesearch/bleve"
	_ "github.com/blevesearch/bleve/analysis/lang/cjk"
)

var queryIndex bleve.Index

func InitSearch() {
	ReloadQueryIndex()
	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

func ReloadQueryIndex() {
	if nil != queryIndex {
		queryIndex.Close()
	}
	queryIndex = nil
	var indices []bleve.Index
	for _, dir := range Conf.Dirs {
		indices = append(indices, dir.index)
	}
	queryIndex = bleve.NewIndexAlias(indices...)
}

type Doc struct {
	Id      string
	Name    string
	Content string
	URL     string
	Path    string
}

func sha(str string) string {
	hash := sha1.Sum(gulu.Str.ToBytes(str))
	return hex.EncodeToString(hash[:])
}

func genDocId(url, path string) string {
	return sha(stdpath.Join(url, path))
}

func newDoc(name, content, url, path string) (doc *Doc) {
	id := genDocId(url, path)
	return &Doc{Id: id, Name: name, Content: content, URL: url, Path: path}
}

func (dir *Dir) BatchIndexDocs(docs []*Doc) {
	length := len(docs)
	if 1 > length {
		return
	}

	batch := dir.index.NewBatch()
	for _, doc := range docs {
		if err := batch.Index(doc.Id, doc); nil != err {
			Logger.Errorf("加入批量索引失败：%s", err)
		}
	}

	if err := dir.index.Batch(batch); nil != err {
		Logger.Errorf("批量索引失败：%s", err)
	}
}

func (dir *Dir) BatchUnindexDocs(docIds []string) {
	length := len(docIds)
	if 1 > length {
		return
	}

	batch := dir.index.NewBatch()
	for i := 0; i < length; i++ {
		batch.Delete(docIds[i])
	}

	if err := dir.index.Batch(batch); nil != err {
		Logger.Errorf("批量删除索引失败：%s", err)
	}
}

func (dir *Dir) RemoveIndexDoc(docId string) {
	if err := dir.index.Delete(docId); nil != err {
		Logger.Errorf("删除索引失败：%s", err)
	}
}

func (dir *Dir) IndexDoc(doc *Doc) {
	if err := dir.index.Index(doc.Id, doc); nil != err {
		Logger.Errorf("索引失败：%s", err)
	}
}

func Search(text string) (ret *bleve.SearchResult) {
	query := bleve.NewMatchQuery(text)
	query.Analyzer = "cjk"
	searchRequest := bleve.NewSearchRequest(query)
	searchRequest.Highlight = bleve.NewHighlightWithStyle("html")
	searchRequest.Fields = []string{"*"}
	ret, err := queryIndex.Search(searchRequest)
	if nil != err {
		Logger.Warnf("搜索失败：%s", err)
		return nil
	}
	Logger.Infof("%s", ret)
	return
}
