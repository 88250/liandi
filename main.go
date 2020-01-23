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
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/88250/gulu"
	"github.com/88250/liandi/command"
	"github.com/88250/liandi/util"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/webdav"
	"gopkg.in/olahol/melody.v1"
)

var logger *gulu.Logger

func init() {
	rand.Seed(time.Now().UTC().UnixNano())

	gulu.Log.SetLevel("debug")
	logger = gulu.Log.NewLogger(os.Stdout)

	util.InitConf()

	go util.ParentExited()
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	m := melody.New()
	r.GET("/ws", func(c *gin.Context) {
		m.HandleRequest(c.Writer, c.Request)
	})

	m.HandleConnect(func(s *melody.Session) {
		util.SetPushChan(s)
		logger.Debug("websocket connected")
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		logger.Infof("request [%s]", msg)
		request := map[string]interface{}{}
		if err := json.Unmarshal(msg, &request); nil != err {
			result := util.NewResult()
			result.Code = -1
			result.Msg = "Bad Request"
			responseData, _ := json.Marshal(result)
			util.Push(responseData)

			return
		}

		cmdStr := request["cmd"].(string)
		cmd := command.Commands[cmdStr]
		if nil == cmd {
			result := util.NewResult()
			result.Code = -1
			result.Msg = "Invalid Command"
			responseData, _ := json.Marshal(result)
			util.Push(responseData)

			return
		}

		param := request["param"].(map[string]interface{})
		go cmd.Exec(param)
	})

	go serveWebDAV()

	addr := "localhost:" + util.ServerPort
	logger.Infof("链滴笔记内核进程 [v%s] 正在启动，监听端口 [%s]", util.Ver, "http://"+addr)
	if err := r.Run(addr); nil != err {
		logger.Errorf("启动链滴笔记内核失败 [%s]", err)
	}
}

func serveWebDAV() {
	fs := &webdav.Handler{
		FileSystem: webdav.Dir("."),
		LockSystem: webdav.NewMemLS(),
	}

	http.HandleFunc("/webdav/", func(w http.ResponseWriter, req *http.Request) {
		req.URL.Path = req.URL.Path[len("/webdav"):]
		if req.Method == "GET" && handleDirList(fs.FileSystem, w, req) {
			return
		}

		fs.ServeHTTP(w, req)
	})

	addr := "localhost:" + util.WebDAVPort
	logger.Infof("WebDAV 服务器正在启动 [%s]", "http://"+addr)
	http.ListenAndServe(addr, nil)
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
