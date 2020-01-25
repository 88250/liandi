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
	WebDAVPort = "6807"
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
	os.Mkdir(LianDiDir, 0755)

	Conf = &AppConf{}

	if !gulu.File.IsExist(ConfPath) {
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

}

func saveConf() {
	data, _ := json.Marshal(Conf)
	if err := ioutil.WriteFile(ConfPath, data, 0644); nil != err {
		logger.Fatalf("写入配置文件 [%s] 失败：", ConfPath, err)
	}
}

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
	Dirs []*Dir `json:"dirs"`
}

// Dir 维护了打开的 WebDAV 目录。
type Dir struct {
	URL      string `json:"url"`
	auth     bool   `json:"auth"`
	username string `json:"username"`
	password string `json:"password"`
}
