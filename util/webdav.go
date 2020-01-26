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
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/net/webdav"
)

const (
	WebDAVPort          = "6807"
	WebDAVLocalhostAddr = "127.0.0.1:" + WebDAVPort
)

var server *http.Server

func InitMount() {
	for _, dir := range Conf.Dirs {
		if "" != dir.Path {
			Mount(dir.URL, dir.Path)
		}
	}
	StartServeWebDAV()
}

func Mount(url, path string) {
	for _, dir := range Conf.Dirs {
		if dir.URL == url {
			return
		}
	}

	dir := &Dir{URL: url, Path: path}
	Conf.Dirs = append(Conf.Dirs, dir)

	http.DefaultServeMux = http.NewServeMux()
	for _, dir := range Conf.Dirs {
		if "" == dir.Path {
			continue
		}

		prefix := dir.URL[strings.Index(dir.URL, "/webdav/"):]
		webdavHandler := &webdav.Handler{
			Prefix:     prefix,
			FileSystem: webdav.Dir(dir.Path),
			LockSystem: webdav.NewMemLS(),
		}
		http.HandleFunc(prefix, func(w http.ResponseWriter, req *http.Request) {
			if req.Method == "GET" && handleDirList(webdavHandler, w, req) {
				return
			}

			webdavHandler.ServeHTTP(w, req)
		})
	}
	return
}

func StartServeWebDAV() {
	if nil != server {
		StopServeWebDAV()
	}
	server = &http.Server{Addr: WebDAVLocalhostAddr}
	go server.ListenAndServe()
}

func StopServeWebDAV() {
	if nil == server {
		return
	}
	server.Shutdown(context.Background())
}

func handleDirList(handler *webdav.Handler, w http.ResponseWriter, req *http.Request) bool {
	prefix := handler.Prefix
	path := req.URL.Path[len(prefix):]
	base := filepath.Base(path)
	ctx := context.Background()
	f, err := handler.FileSystem.OpenFile(ctx, path, os.O_RDONLY, 0)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "读取目录 [%s] 失败：%s", path, err.Error())
		return false
	}
	defer f.Close()
	if fi, _ := f.Stat(); fi != nil && !fi.IsDir() {
		return false
	}
	dirs, err := f.Readdir(-1)
	if nil != err {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "读取目录 [%s] 失败：%s", path, err.Error())
		return false
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, "<pre>\n")
	for _, d := range dirs {
		name := filepath.Join(prefix, base, d.Name())
		if d.IsDir() {
			name += string(filepath.Separator)
		}
		fmt.Fprintf(w, "<a href=\"%s\">%s</a>\n", name, name)
	}
	fmt.Fprintf(w, "</pre>\n")
	return true
}
