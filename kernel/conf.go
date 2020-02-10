// LianDi - 链滴笔记，连接点滴
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
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/88250/gowebdav"
	"github.com/88250/gulu"
)

const (
	Ver        = "0.1.0"
	ServerPort = "6806"
	UserAgent  = "LianDi/v" + Ver
)

var (
	HomeDir, _ = gulu.OS.Home()
	LianDiDir  = filepath.Join(HomeDir, ".liandi")
	ConfPath   = filepath.Join(LianDiDir, "conf.json")
	LogPath    = filepath.Join(LianDiDir, "liandi.log")
)

var Conf *AppConf

func Close() {
	Conf.Close()
	StopServeWebDAV()
	CloseLog()
}

func InitConf() {
	Conf = &AppConf{LogLevel: "debug", Theme: "white", Lang: "zh_CN"}
	if !gulu.File.IsExist(ConfPath) {
		if err := os.Mkdir(LianDiDir, 0755); nil != err && !os.IsExist(err) {
			Logger.Fatalf("创建配置目录 [%s] 失败：%s", LianDiDir, err)
		}
		Logger.Infof("初始化配置文件 [%s] 完毕", ConfPath)
	} else {
		data, err := ioutil.ReadFile(ConfPath)
		if nil != err {
			Logger.Fatalf("加载配置文件 [%s] 失败：%s", ConfPath, err)
		}
		err = json.Unmarshal(data, Conf)
		if err != nil {
			Logger.Fatalf("解析配置文件 [%s] 失败：%s", ConfPath, err)
		}
		Logger.Debugf("加载配置文件 [%s] 完毕", ConfPath)
	}

	for i := 0; i < len(Conf.Dirs); i++ {
		dir := Conf.Dirs[i]
		if !dir.IsRemote() && !gulu.File.IsExist(dir.LocalPath) {
			Conf.Dirs = append(Conf.Dirs[:i], Conf.Dirs[i+1:]...)
			Logger.Debugf("目录 [%s] 不存在，已从配置中移除", dir.LocalPath)
			continue
		}
	}

	if nil == Conf.Markdown {
		Conf.Markdown = newMarkdown()
	}

	Conf.Save()
	Conf.InitClient()

	gulu.Log.SetLevel(Conf.LogLevel)
}

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
	LogLevel string    `json:"logLevel"` // 日志级别：Off, Trace, Debug, Info, Warn, Error, Fatal
	Dirs     []*Dir    `json:"dirs"`     // 已经打开的文件夹
	Theme    string    `json:"theme"`    // 界面主题
	Lang     string    `json:"lang"`     // 界面语言
	Markdown *Markdown `json:"markdown"` // Markdown 引擎配置
}

type Markdown struct {
	AutoSpace                           bool `json:"autoSpace"`
	FixTermTypo                         bool `json:"fixTermTypo"`
	ChinesePunct                        bool `json:"chinesePunct"`
	InlineMathAllowDigitAfterOpenMarker bool `json:"inlineMathAllowDigitAfterOpenMarker"`
}

func newMarkdown() *Markdown {
	return &Markdown{
		AutoSpace:                           true,
		FixTermTypo:                         true,
		ChinesePunct:                        true,
		InlineMathAllowDigitAfterOpenMarker: false,
	}
}

func (conf *AppConf) Save() {
	data, _ := json.MarshalIndent(Conf, "", "   ")
	if err := ioutil.WriteFile(ConfPath, data, 0644); nil != err {
		Logger.Fatalf("写入配置文件 [%s] 失败：%s", ConfPath, err)
	}
}

func (conf *AppConf) InitClient() {
	for _, dir := range conf.Dirs {
		dir.InitClient()
	}
}

func (conf *AppConf) Close() {
	for _, dir := range conf.Dirs {
		dir.CloseClient()
	}
	conf.Save()
}

func (conf *AppConf) dir(url string) *Dir {
	for _, dir := range conf.Dirs {
		if dir.URL == url {
			return dir
		}
	}
	return nil
}

func (conf *AppConf) lang(num int) string {
	return langs[conf.Lang][num]
}

// Dir 维护了打开的 WebDAV 文件夹。
type Dir struct {
	URL       string `json:"url"`      // WebDAV URL
	Auth      string `json:"auth"`     // WebDAV 鉴权方式，空值表示不需要鉴权
	User      string `json:"user"`     // WebDAV 用户名
	Password  string `json:"password"` // WebDAV 密码
	LocalPath string `json:"path"`     // 本地文件系统文件夹路径，远程 WebDAV 的话该字段为空

	client *gowebdav.Client `json:"-"` // WebDAV 客户端
}

func (dir *Dir) IsRemote() bool {
	return "" == dir.LocalPath
}

func (dir *Dir) InitClient() {
	// 初始化 WebDAV 客户端
	dir.client = gowebdav.NewClient(dir.URL, dir.User, dir.Password)
	dir.client.SetTimeout(7 * time.Second)
}

func (dir *Dir) CloseClient() {
	dir.client = nil
}

func (dir *Dir) Ls(path string) (ret []os.FileInfo, err error) {
	if ret, err = dir.client.ReadDir(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(2), dir.URL, path, err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	return
}

func (dir *Dir) Get(path string) (ret string, err error) {
	data, err := dir.client.Read(path)
	if nil != err {
		msg := fmt.Sprintf(Conf.lang(3), dir.URL, path, err)
		Logger.Errorf(msg)
		return "", errors.New(msg)
	}
	return gulu.Str.FromBytes(data), nil
}

func (dir *Dir) Put(path string, content []byte) error {
	if err := dir.client.Write(path, content, 0644); nil != err {
		msg := fmt.Sprintf(Conf.lang(3), dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Stat(path string) (ret os.FileInfo, err error) {
	if ret, err = dir.client.Stat(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(4), dir.URL, path, err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	return
}

func (dir *Dir) Exist(path string) (ret bool, err error) {
	if _, err = dir.client.Stat(path); nil != err {
		if _, ok := err.(*os.PathError); ok {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (dir *Dir) Rename(oldPath, newPath string) error {
	if err := dir.client.Rename(oldPath, newPath, false); nil != err {
		msg := fmt.Sprintf(Conf.lang(5), dir.URL, oldPath, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Mkdir(path string) error {
	if err := dir.client.Mkdir(path, 0755); nil != err {
		msg := fmt.Sprintf(Conf.lang(6), dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Remove(path string) error {
	if err := dir.client.Remove(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(7), dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Index() {
	Logger.Debugf("开始索引 [%s] 目录", dir.URL)
	files := dir.Files("/")
	for _, file := range files {
		p := file.(*gowebdav.File).Path()
		if content, err := dir.Get(p); nil == err {
			doc := newDoc(dir.URL, p, content)
			docs = append(docs, doc)
		}
	}
	Logger.Debugf("索引目录 [%s] 完毕", dir.URL)
}

func (dir *Dir) Unindex() {
	Logger.Debugf("开始删除索引 [%s] 目录", dir.URL)
	files := dir.Files("/")
	for _, file := range files {
		p := file.(*gowebdav.File).Path()
		dir.RemoveIndexDoc(dir.URL, p)
	}
}

func (dir *Dir) Files(path string) (ret []os.FileInfo) {
	fs, err := dir.Ls(path)
	if nil != err {
		return
	}
	dir.files(&fs, &ret)
	return
}

func (dir *Dir) files(files, ret *[]os.FileInfo) {
	for _, file := range *files {
		f := file.(*gowebdav.File)
		if strings.HasPrefix(f.Name(), ".") {
			continue
		}

		if dir.isSkipDir(f.Name()) {
			continue
		}

		if f.IsDir() {
			fs, err := dir.Ls(f.Path())
			if nil == err {
				dir.files(&fs, ret)
			}
		} else {
			if isMarkdown(f) {
				*ret = append(*ret, f)
			}
		}
	}
	return
}

func (dir *Dir) isSkipDir(filename string) bool {
	return "node_modules" == filename || "dist" == filename || "target" == filename
}

var zhCN = map[int]string{
	0: "查询目录失败",
	1: "文件名重复",
	2: "列出目录 [%s] 下路径为 [%s] 的文件列表失败：%s",
	3: "读取目录 [%s] 下的文件 [%s] 失败：%s",
	4: "查看目录 [%s] 下 [%s] 的元信息失败：%s",
	5: "重命名目录 [%s] 下的文件 [%s] 失败：%s",
	6: "在目录 [%s] 下创建新目录 [%s] 失败：%s",
	7: "在目录 [%s] 下删除 [%s] 失败：%s",
}

var enUS = map[int]string{
	0: "Query dir failed",
	1: "Duplicated filename",
	2: "List files of dir [%s] and path [%s] failed: %s",
	3: "Read dir [%s] file [%s] failed: %s",
	4: "Get dir [%s] file [%s] meta info failed: %s",
	5: "Rename dir [%s] file [%s] failed: %s",
	6: "Create dir [%s] dir [%s] failed: %s",
	7: "Remove dir [%s] path [%s] failed: %s",
}

var langs = map[string]map[int]string{
	"zh_CN": zhCN,
	"en_US": enUS,
}
