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
	var box, found *Box
	for i, box = range Conf.Boxes {
		if box.URL == url {
			found = box
			break
		}
	}

	if nil == found {
		Logger.Debugf("未找到待取消挂载的盒子 [%s]", url)
		return
	}

	box.Unindex()
	Conf.Boxes = append(Conf.Boxes[:i], Conf.Boxes[i+1:]...)
	found.CloseClient()
	routeWebDAV()
	Conf.Save()
	Logger.Debugf("取消挂载盒子 [%s] 完毕", url)
}

func MountRemote(url, user, password string) (ret string, alreadyMount bool) {
	for _, box := range Conf.Boxes {
		if box.URL == url {
			return box.URL, true
		}
	}

	box := &Box{URL: url, LocalPath: ""}
	if "" != user || "" != password {
		box.User = user
		box.Password = password
		box.Auth = "basic"
	}

	Conf.Boxes = append(Conf.Boxes, box)
	routeWebDAV()
	Conf.Save()
	box.InitClient()
	go box.Index()
	Logger.Debugf("挂载远程盒子 [%s] 完毕", url)
	return url, false
}

func Mount(url, localPath string) (ret string, alreadyMount bool) {
	for _, box := range Conf.Boxes {
		if "" != localPath && box.LocalPath == localPath {
			return box.URL, true
		}
	}

	id := gulu.Rand.String(7)
	url = url + id + "/" + filepath.Base(localPath) + "/"

	box := &Box{URL: url, LocalPath: localPath}
	Conf.Boxes = append(Conf.Boxes, box)
	routeWebDAV()
	Conf.Save()
	box.InitClient()
	go box.Index()
	Logger.Debugf("挂载盒子 [%s] 完毕", url)
	return url, false
}

func routeWebDAV() {
	http.DefaultServeMux = http.NewServeMux()
	for _, box := range Conf.Boxes {
		if box.IsRemote() {
			continue
		}

		// 本地伺服

		prefix := box.URL[strings.Index(box.URL, "/webdav/"):]
		webdavHandler := &webdav.Handler{
			Prefix:     prefix,
			FileSystem: webdav.Dir(box.LocalPath),
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
