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
	"github.com/88250/gulu"
	"golang.org/x/net/webdav"
	"net/http"
	"os"
)

const WebDAVPort = "6807"

var server *http.Server

func InitMount() {
	for _, dir := range Conf.Dirs {
		if "" != dir.Path {
			Mount(dir.Path)
		}
	}
	RestartServeWebDAV()
}

func Mount(path string) (ret string) {
	id := gulu.Rand.String(7)
	prefix := "/webdav/" + id + "/"

	ret = "127.0.0.1:" + WebDAVPort + prefix
	for _, dir := range Conf.Dirs {
		if dir.URL == ret {
			return ret
		}
	}

	dir := &Dir{URL: ret}
	Conf.Dirs = append(Conf.Dirs, dir)

	StopServeWebDAV()
	for _, dir := range Conf.Dirs {
		prefix := dir.URL[len("127.0.0.1:"+WebDAVPort):]
		fs := &webdav.Handler{
			Prefix:     prefix,
			FileSystem: webdav.Dir(path),
			LockSystem: webdav.NewMemLS(),
		}
		http.HandleFunc(prefix, func(w http.ResponseWriter, req *http.Request) {
			if req.Method == "GET" && handleDirList(fs.FileSystem, w, req) {
				return
			}

			fs.ServeHTTP(w, req)
		})
	}
	StartServeWebDAV()
	return
}

func StartServeWebDAV() {
	if nil != server {
		StopServeWebDAV()
	}

	addr := "127.0.0.1:" + WebDAVPort
	logger.Infof("WebDAV 服务器正在启动 [%s]", "http://"+addr+"/webdav/")
	server = &http.Server{Addr: addr}
	go server.ListenAndServe()
}

func StopServeWebDAV() {
	if nil == server {
		return
	}
	server.Shutdown(context.Background())
}

func RestartServeWebDAV() {
	if nil != server {
		server.Shutdown(context.Background())
	}
	addr := "127.0.0.1:" + WebDAVPort
	logger.Infof("WebDAV 服务器正在重新加载 [%s]", "http://"+addr+"/webdav/")
	server = &http.Server{Addr: addr}
	server.ListenAndServe()
}

func handleDirList(fs webdav.FileSystem, w http.ResponseWriter, req *http.Request) bool {
	ctx := context.Background()
	f, err := fs.OpenFile(ctx, req.URL.Path, os.O_RDONLY, 0)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "读取目录 [%s] 失败：%s", req.URL.Path, err.Error())
		return false
	}
	defer f.Close()
	if fi, _ := f.Stat(); fi != nil && !fi.IsDir() {
		return false
	}
	dirs, err := f.Readdir(-1)
	if nil != err {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "读取目录 [%s] 失败：%s", req.URL.Path, err.Error())
		return false
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, "<pre>\n")
	for _, d := range dirs {
		name := d.Name()
		if d.IsDir() {
			name += "/"
		}
		fmt.Fprintf(w, "<a href=\"%s\">%s</a>\n", name, name)
	}
	fmt.Fprintf(w, "</pre>\n")
	return true
}
