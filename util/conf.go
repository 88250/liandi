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
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/88250/gulu"
)

const (
	Ver        = "1.0.0"
	ServerPort = "6806"
	UserAgent  = "LianDi/v" + Ver
)

var (
	logger     = gulu.Log.NewLogger(os.Stdout)
	HomeDir, _ = gulu.OS.Home()
	LianDiDir  = filepath.Join(HomeDir, ".liandi")
	ConfPath   = filepath.Join(LianDiDir, "conf.json")
)

var Conf *AppConf

func InitConf() {
	Conf = &AppConf{LogLevel: "debug"}

	if !gulu.File.IsExist(ConfPath) {
		if err := os.Mkdir(LianDiDir, 0755); nil != err && !os.IsExist(err) {
			logger.Fatalf("创建配置目录 [%s] 失败：%s", LianDiDir, err)
		}

		saveConf()
		logger.Infof("初始化配置文件 [%s] 完毕", ConfPath)
	} else {
		data, err := ioutil.ReadFile(ConfPath)
		if nil != err {
			logger.Fatalf("加载配置文件 [%s] 失败：%s", ConfPath, err)
		}
		err = json.Unmarshal(data, Conf)
		if err != nil {
			logger.Fatalf("解析配置文件 [%s] 失败：%s", ConfPath, err)
		}
		logger.Debugf("加载配置文件 [%s] 完毕", ConfPath)
	}

	length := len(Conf.Dirs)
	for i := 0; i < length; i++ {
		dir := Conf.Dirs[i]
		if !gulu.File.IsExist(dir.Path) {
			Conf.Dirs = append(Conf.Dirs[:i], Conf.Dirs[i+1:]...)
			logger.Debugf("目录 [%s] 不存在，已从配置中移除", dir.Path)
		}
	}

	gulu.Log.SetLevel(Conf.LogLevel)
}

func saveConf() {
	data, _ := json.Marshal(Conf)
	if err := ioutil.WriteFile(ConfPath, data, 0644); nil != err {
		logger.Fatalf("写入配置文件 [%s] 失败：", ConfPath, err)
	}
}

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
	LogLevel string `json:"logLevel"` // 日志级别：Off, Trace, Debug, Info, Warn, Error, Fatal
	Dirs     []*Dir `json:"dirs"`     // 已经打开的文件夹
}

// Dir 维护了打开的 WebDAV 文件夹。
type Dir struct {
	URL      string `json:"url"`      // WebDAV URL
	Auth     bool   `json:"auth"`     // WebDAV 是否需要鉴权
	Username string `json:"username"` // WebDAV 用户名
	Password string `json:"password"` // WebDAV 密码
	Path     string `json:"path"`     // 本地文件系统文件夹路径，远程 WebDAV 的话该字段为控制
}
