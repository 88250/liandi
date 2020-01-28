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

package util

import (
	"crypto/sha256"
	"encoding/hex"

	"github.com/88250/gulu"
	"github.com/blevesearch/bleve"

	_ "github.com/blevesearch/bleve/analysis/lang/cjk"
)

var index bleve.Index

func InitSearch() {
	var err error

	if gulu.File.IsExist(IndexPath) {
		index, err = bleve.Open(IndexPath)
		if nil != err {
			Logger.Fatalf("加载搜索索引失败：%s", err)
			return
		}
	} else {
		mapping := bleve.NewIndexMapping()
		mapping.DefaultAnalyzer = "cjk"
		index, err = bleve.New(IndexPath, mapping)
		if nil != err {
			Logger.Fatalf("创建搜索索引失败：%s", err)
			return
		}
	}

	for _, dir := range Conf.Dirs {
		go dir.Index()
	}
}

type Doc struct {
	Id      string
	Name    string
	Content string
	URL     string
	Path    string
}

func newDoc(name, content, url, path string) (doc *Doc) {
	hash := sha256.Sum256(gulu.Str.ToBytes(content))
	return &Doc{Id: hex.EncodeToString(hash[:]), Name: name, Content: content, URL: url, Path: path}
}

func BatchIndex(docs []*Doc) {
	length := len(docs)
	if 1 > length {
		return
	}

	batch := index.NewBatch()
	for i := 0; i < length; i++ {
		doc := docs[i]
		if err := batch.Index(doc.Id, doc); nil != err {
			Logger.Errorf("索引失败：%s", err)
		}
	}

	if err := index.Batch(batch); nil != err {
		Logger.Errorf("批量索引失败：%s", err)
	}
}

func BatchUnindex(docIds []string) {
	length := len(docIds)
	if 1 > length {
		return
	}

	batch := index.NewBatch()
	for i := 0; i < length; i++ {
		batch.Delete(docIds[i])
	}

	if err := index.Batch(batch); nil != err {
		Logger.Errorf("批量删除索引失败：%s", err)
	}
}

func Search(text string) {
	query := bleve.NewMatchQuery(text)
	query.Analyzer = "cjk"
	searchRequest := bleve.NewSearchRequest(query)
	searchRequest.Highlight = bleve.NewHighlightWithStyle("html")
	searchRequest.Fields = []string{"*"}
	searchResults, err := index.Search(searchRequest)
	if nil != err {
		Logger.Warnf("搜索失败：%s", err)
		return
	}
	Logger.Infof("%s", searchResults)
}
