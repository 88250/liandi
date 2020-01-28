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

	"github.com/88250/gowebdav"
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
			logger.Fatalf("加载搜索索引失败：%s", err)
			return
		}
	} else {
		mapping := bleve.NewIndexMapping()
		mapping.DefaultAnalyzer = "cjk"
		index, err = bleve.New(IndexPath, mapping)
		if nil != err {
			logger.Fatalf("创建搜索索引失败：%s", err)
			return
		}
	}

	go func() {
		for _, dir := range Conf.Dirs {
			files := dir.Files("/")
			var docs []*Doc
			for _, file := range files {
				content, err := dir.Get(file.(gowebdav.File).Path())
				if nil == err {
					doc := newDoc("", content, dir.URL, dir.Path)
					docs = append(docs, doc)
				}
			}
			BatchIndex(docs)
		}
	}()
}

type Doc struct {
	Id      string
	Title   string
	Content string
	URL     string
	Path    string
}

func newDoc(title, content, url, path string) (doc *Doc) {
	hash := sha256.Sum256(gulu.Str.ToBytes(content))
	return &Doc{Id: hex.EncodeToString(hash[:]), Title: title, Content: content, URL: url, Path: path}
}
func Index(doc *Doc) {
	if err := index.Index(doc.Id, doc); nil != err {
		logger.Errorf("索引失败：%s", err)
	}
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
			logger.Errorf("索引失败：%s", err)
		}
	}

	if err := index.Batch(batch); nil != err {
		logger.Errorf("索引失败：%s", err)
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
		logger.Warnf("搜索失败：%s", err)
		return
	}
	logger.Infof("%s", searchResults)
}
