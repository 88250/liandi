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
	"encoding/json"
	"math/rand"
	"net/http/pprof"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/88250/gulu"
	"github.com/88250/liandi/kernel/cmd"
	"github.com/88250/liandi/kernel/conf"
	"github.com/gin-gonic/gin"
	"github.com/mitchellh/go-ps"
	"gopkg.in/olahol/melody.v1"
)

func init() {
	rand.Seed(time.Now().UTC().UnixNano())

	conf.InitLog()
	conf.InitConf()
	conf.InitMount()
	conf.InitSearch()

	go ParentExited()
	conf.CheckUpdatePeriodically()
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	r.GET("/debug/pprof/", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/allocs", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/block", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/goroutine", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/heap", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/mutex", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/threadcreate", gin.WrapF(pprof.Index))
	r.GET("/debug/pprof/cmdline", gin.WrapF(pprof.Cmdline))
	r.GET("/debug/pprof/profile", gin.WrapF(pprof.Profile))
	r.GET("/debug/pprof/symbol", gin.WrapF(pprof.Symbol))
	r.GET("/debug/pprof/trace", gin.WrapF(pprof.Trace))

	m := melody.New()
	m.Config.MaxMessageSize = 1024 * 1024 * 2
	r.GET("/ws", func(c *gin.Context) {
		if err := m.HandleRequest(c.Writer, c.Request); nil != err {
			conf.Logger.Errorf("处理命令失败：%s", err)
		}
	})

	r.POST("/upload", conf.Upload)
	r.POST("/upload/fetch", conf.UploadFetch)

	m.HandleConnect(func(s *melody.Session) {
		conf.SetPushChan(s)
		conf.Logger.Debugf("WebSocket 已连接")
	})

	m.HandleDisconnect(func(s *melody.Session) {
		conf.Logger.Debugf("WebSocket 连接已断开")
	})

	m.HandleError(func(s *melody.Session, err error) {
		conf.Logger.Debugf("WebSocket 连接报错：%s", err)
	})

	m.HandleClose(func(s *melody.Session, i int, str string) error {
		conf.Logger.Debugf("WebSocket 关闭：%v, %v", i, str)
		return nil
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		conf.Logger.Debugf("request [%s]", shortReqMsg(msg))
		request := map[string]interface{}{}
		if err := json.Unmarshal(msg, &request); nil != err {
			result := conf.NewResult()
			result.Code = -1
			result.Msg = "Bad Request"
			responseData, _ := json.Marshal(result)
			conf.Push(responseData)
			return
		}

		cmdStr := request["cmd"].(string)
		cmdId := request["reqId"].(float64)
		param := request["param"].(map[string]interface{})
		command := cmd.NewCommand(cmdStr, cmdId, param)
		if nil == command {
			result := conf.NewResult()
			result.Code = -1
			result.Msg = "查找命令 [" + cmdStr + "] 失败"
			conf.Push(result.Bytes())
			return
		}
		cmd.Exec(command)
	})

	handleSignal()

	addr := "127.0.0.1:" + conf.ServerPort
	conf.Logger.Infof("内核进程 [v%s] 正在启动，监听端口 [%s]", conf.Ver, "http://"+addr)
	if err := r.Run(addr); nil != err {
		conf.Logger.Errorf("启动链滴笔记内核失败 [%s]", err)
	}
}

func handleSignal() {
	c := make(chan os.Signal)
	signal.Notify(c, syscall.SIGINT, syscall.SIGQUIT, syscall.SIGTERM)

	go func() {
		s := <-c
		conf.Logger.Infof("收到系统信号 [%s]，退出内核进程", s)

		conf.Close()
		os.Exit(0)
	}()
}

var ppid = os.Getppid()

func ParentExited() {
	for range time.Tick(2 * time.Second) {
		process, e := ps.FindProcess(ppid)
		if nil == process || nil != e {
			conf.Logger.Info("UI 进程已经退出，现在退出内核进程")
			conf.Close()
			os.Exit(0)
		}
	}
}

func shortReqMsg(msg []byte) []byte {
	s := gulu.Str.FromBytes(msg)
	max := 128
	if len(s) > max {
		count := 0
		for i := range s {
			count++
			if count > max {
				return gulu.Str.ToBytes(s[:i] + "...")
			}
		}
	}
	return msg
}
