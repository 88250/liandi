// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package conf

import (
	"context"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/88250/gulu"
	"golang.org/x/net/webdav"
)

const (
	WebDAVPort          = "6807"
	WebDAVLocalhostAddr = "127.0.0.1:" + WebDAVPort
)

var server *http.Server

func InitMount() {
	routeWebDAV()
	RestartServeWebDAV()
}

func Unmount(url string) {
	var i int
	var dir, found *Dir
	for i, dir = range Conf.Dirs {
		if dir.URL == url {
			found = dir
			break
		}
	}

	if nil == found {
		Logger.Debugf("未找到待取消挂载的目录 [%s]", url)
		return
	}

	dir.Unindex()
	Conf.Dirs = append(Conf.Dirs[:i], Conf.Dirs[i+1:]...)
	found.CloseClient()
	routeWebDAV()
	Conf.Save()
	Logger.Debugf("取消挂载目录 [%s] 完毕", url)
}

func MountRemote(url, user, password string) (ret string, alreadyMount bool) {
	for _, dir := range Conf.Dirs {
		if dir.URL == url {
			return dir.URL, true
		}
	}

	dir := &Dir{URL: url, LocalPath: ""}
	if "" != user || "" != password {
		dir.User = user
		dir.Password = password
		dir.Auth = "basic"
	}

	Conf.Dirs = append(Conf.Dirs, dir)
	routeWebDAV()
	Conf.Save()
	dir.InitClient()
	go dir.Index()
	Logger.Debugf("挂载远程目录 [%s] 完毕", url)
	return url, false
}

func Mount(url, localPath string) (ret string, alreadyMount bool) {
	for _, dir := range Conf.Dirs {
		if "" != localPath && dir.LocalPath == localPath {
			return dir.URL, true
		}
	}

	id := gulu.Rand.String(7)
	url = url + id + "/" + filepath.Base(localPath) + "/"

	dir := &Dir{URL: url, LocalPath: localPath}
	Conf.Dirs = append(Conf.Dirs, dir)
	routeWebDAV()
	Conf.Save()
	dir.InitClient()
	go dir.Index()
	Logger.Debugf("挂载目录 [%s] 完毕", url)
	return url, false
}

func routeWebDAV() {
	http.DefaultServeMux = http.NewServeMux()
	for _, dir := range Conf.Dirs {
		if dir.IsRemote() {
			continue
		}

		// 本地目录伺服

		prefix := dir.URL[strings.Index(dir.URL, "/webdav/"):]
		webdavHandler := &webdav.Handler{
			Prefix:     prefix,
			FileSystem: webdav.Dir(dir.LocalPath),
			LockSystem: webdav.NewMemLS(),
		}

		http.HandleFunc(prefix, func(w http.ResponseWriter, req *http.Request) {
			webdavHandler.ServeHTTP(w, req)
		})
	}
}

func RestartServeWebDAV() {
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

func NormalizeURL(url string) (ret string) {
	ret = url
	if !strings.HasSuffix(ret, "/") {
		ret = ret + "/"
	}
	return
}
