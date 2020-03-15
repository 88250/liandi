// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package main

import (
	"crypto/tls"
	"io/ioutil"
	"mime"
	"net/url"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/88250/gulu"
	"github.com/gin-gonic/gin"
	"github.com/parnurzeal/gorequest"
)

func Upload(c *gin.Context) {
	ret := gulu.Ret.NewResult()

	form, _ := c.MultipartForm()
	files := form.File["file[]"]
	u := c.GetHeader("X-URL")
	u, _ = url.PathUnescape(u)
	p := c.GetHeader("X-Path")
	p, _ = url.PathUnescape(p)
	p = path.Dir(p)
	p = p[1:]                     // 去掉开头的 /
	mode := c.GetHeader("X-Mode") // markdown, wysiwyg
	dir := Conf.dir(u)
	if nil == dir {
		ret.Code = -1
		ret.Msg = Conf.lang(0)
		return
	}

	var errFiles []string
	succMap := map[string]interface{}{}
	linkBase := joinUrlPath(u, p)
	if "markdown" == mode {
		linkBase = ""
	}
	for _, file := range files {
		fname := file.Filename
		f, err := file.Open()
		if nil != err {
			errFiles = append(errFiles, fname)
			ret.Msg = err.Error()
			break
		}

		data, err := ioutil.ReadAll(f)
		if nil != err {
			errFiles = append(errFiles, fname)
			ret.Msg = err.Error()
			break
		}

		writePath := joinUrlPath(p, fname)
		exist, err := Exist(u, writePath)
		if nil != err {
			errFiles = append(errFiles, fname)
			ret.Msg = err.Error()
			break
		}

		if exist {
			ext := filepath.Ext(fname)
			fname = fname[:len(fname)-len(ext)]
			fname = fname + "-" + gulu.Rand.String(7) + ext
			writePath = joinUrlPath(p, fname)
		}

		if err := Put(u, writePath, data); nil != err {
			errFiles = append(errFiles, fname)
			ret.Msg = err.Error()
			break
		}

		succMap[file.Filename] = joinUrlPath(linkBase, fname)
	}

	ret.Data = map[string]interface{}{
		"errFiles": errFiles,
		"succMap":  succMap,
	}

	c.JSON(200, ret)
}

func UploadFetch(c *gin.Context) {
	ret := gulu.Ret.NewResult()

	var requestJSON map[string]interface{}
	if err := c.BindJSON(&requestJSON); nil != err {
		ret.Code = -1
		ret.Msg = "Bad request"
		return
	}

	originalURL := requestJSON["url"].(string)
	if !strings.HasPrefix(originalURL, "http") {
		ret.Code = -1
		ret.Msg = "Bad request"
		return
	}

	u := c.GetHeader("X-URL")
	u, _ = url.PathUnescape(u)
	p := c.GetHeader("X-Path")
	p, _ = url.PathUnescape(p)
	p = path.Dir(p)
	p = p[1:]                     // 去掉开头的 /
	mode := c.GetHeader("X-Mode") // markdown, wysiwyg
	//dir := Conf.dir(u)
	//if nil == dir {
	//	ret.Code = -1
	//	ret.Msg = Conf.lang(0)
	//	return
	//}

	request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	request.Header.Set("User-Agent", UserAgent)
	request.Timeout(7 * time.Second)
	response, data, errors := request.Get(originalURL).EndBytes()
	if nil != errors {
		Logger.Errorf("Fetch image [%s] failed: %s", originalURL, errors)
		ret.Code = -1
		return
	}
	if 200 != response.StatusCode {
		Logger.Errorf("Fetch image [%s] failed, status code is [%d]", originalURL, response.StatusCode)
		ret.Code = -1
		return
	}

	contentType := response.Header.Get("Content-Type")
	exts, err := mime.ExtensionsByType(contentType)
	if nil != err {
		Logger.Errorf("Detect image [%s] suffix failed: %s", originalURL, err)
		ret.Code = -1
		return
	}
	suffix := exts[0]

	errFiles := []string{}
	succMap := map[string]interface{}{}
	linkBase := joinUrlPath(u, p)
	if "markdown" == mode {
		linkBase = ""
	}

	fname := gulu.Rand.String(16) + suffix
	writePath := joinUrlPath(p, fname)
	exist, err := Exist(u, writePath)
	if nil != err {
		errFiles = append(errFiles, fname)
		ret.Msg = err.Error()
		ret.Data = map[string]interface{}{
			"errFiles": errFiles,
			"succMap":  succMap,
		}
		return
	}

	if exist {
		ext := filepath.Ext(fname)
		fname = fname[:len(fname)-len(ext)]
		fname = fname + "-" + gulu.Rand.String(7) + ext
		writePath = joinUrlPath(p, fname)
	}

	if err := Put(u, writePath, data); nil != err {
		errFiles = append(errFiles, fname)
		ret.Msg = err.Error()
		ret.Data = map[string]interface{}{
			"errFiles": errFiles,
			"succMap":  succMap,
		}
		return
	}

	succMap[originalURL] = joinUrlPath(linkBase, fname)

	ret.Data = map[string]interface{}{
		"errFiles": errFiles,
		"succMap":  succMap,
	}

	c.JSON(200, ret)
}

func joinUrlPath(urlPart string, pathParts ...string) string {
	pathPart := path.Join(pathParts...)
	if !strings.HasSuffix(urlPart, "/") {
		return urlPart + "/" + pathPart
	}
	return urlPart + pathPart
}
