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
	"crypto/tls"
	"fmt"
	"io/ioutil"
	"mime"
	"net/url"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/88250/gulu"
	"github.com/gin-gonic/gin"
	"github.com/parnurzeal/gorequest"
)

func Upload(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(200, ret)

	form, _ := c.MultipartForm()
	files := form.File["file[]"]
	u := c.GetHeader("X-URL")
	u, _ = url.PathUnescape(u)
	p := c.GetHeader("X-Path")
	p, _ = url.PathUnescape(p)
	p = filepath.Dir(p)
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

		if err := PutBlob(u, writePath, data); nil != err {
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
}

func UploadFetch(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(200, ret)

	if !Conf.Image.AutoFetch {
		return
	}

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
	p = filepath.Dir(p)
	p = p[1:]                     // 去掉开头的 /
	mode := c.GetHeader("X-Mode") // markdown, wysiwyg
	dir := Conf.dir(u)
	if nil == dir {
		ret.Code = -1
		msg := Conf.lang(0)
		Logger.Error(msg)
		ret.Msg = msg
		return
	}

	response, data, errors := gorequest.New().Get(originalURL).TLSClientConfig(&tls.Config{InsecureSkipVerify: true}).
		Set("User-Agent", UserAgent).Timeout(7 * time.Second).EndBytes()
	if nil != errors {
		ret.Code = -1
		msg := fmt.Sprintf(Conf.lang(11), errors)
		Logger.Errorf(msg)
		ret.Msg = msg
		return
	}
	if 200 != response.StatusCode {
		msg := fmt.Sprintf(Conf.lang(11), strconv.Itoa(response.StatusCode))
		Logger.Errorf(msg)
		ret.Msg = msg
		ret.Code = -1
		return
	}

	contentType := response.Header.Get("Content-Type")
	exts, err := mime.ExtensionsByType(contentType)
	if nil != err {
		msg := fmt.Sprintf(Conf.lang(11), strconv.Itoa(response.StatusCode))
		Logger.Errorf(msg)
		ret.Msg = msg
		ret.Code = -1
		return
	}
	suffix := exts[0]

	linkBase := joinUrlPath(u, p)
	if "markdown" == mode {
		linkBase = ""
	}

	fname := gulu.Rand.String(16) + suffix
	writePath := joinUrlPath(p, fname)
	exist, err := Exist(u, writePath)
	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		return
	}

	if exist {
		ext := filepath.Ext(fname)
		fname = fname[:len(fname)-len(ext)]
		fname = fname + "-" + gulu.Rand.String(7) + ext
		writePath = joinUrlPath(p, fname)
	}

	if err := PutBlob(u, writePath, data); nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		return
	}

	ret.Data = map[string]interface{}{
		"url":         joinUrlPath(linkBase, fname),
		"originalURL": originalURL,
	}
}

func joinUrlPath(urlPart string, pathParts ...string) string {
	pathPart := path.Join(pathParts...)
	if "" == urlPart {
		return pathPart
	}
	if !strings.HasSuffix(urlPart, "/") {
		return urlPart + "/" + pathPart
	}
	return urlPart + pathPart
}
