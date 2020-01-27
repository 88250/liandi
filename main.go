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
	"encoding/json"
	"math/rand"
	"os"
	"time"

	"github.com/88250/gulu"
	"github.com/88250/liandi/command"
	"github.com/88250/liandi/util"
	"github.com/gin-gonic/gin"
	"gopkg.in/olahol/melody.v1"
)

var logger *gulu.Logger

func init() {
	rand.Seed(time.Now().UTC().UnixNano())

	gulu.Log.SetLevel("debug")
	logger = gulu.Log.NewLogger(os.Stdout)

	util.InitConf()
	util.InitMount()
	util.InitSearch()

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
		logger.Debugf("request [%s]", msg)
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

	addr := "127.0.0.1:" + util.ServerPort
	logger.Infof("链滴笔记内核进程 [v%s] 正在启动，监听端口 [%s]", util.Ver, "http://"+addr)
	if err := r.Run(addr); nil != err {
		logger.Errorf("启动链滴笔记内核失败 [%s]", err)
	}
}
