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
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/88250/gowebdav"
	"github.com/88250/gulu"
	"github.com/blevesearch/bleve"
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
	IndexPath  = filepath.Join(LianDiDir, "index")
	LogPath    = filepath.Join(LianDiDir, "liandi.log")
)

var Conf *AppConf

func Close() {
	queryIndex.Close()
	Conf.Close()
	CloseLog()
}

func InitConf() {
	Conf = &AppConf{LogLevel: "debug"}
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
		if !dir.IsRemote() && !gulu.File.IsExist(dir.Path) {
			Conf.Dirs = append(Conf.Dirs[:i], Conf.Dirs[i+1:]...)
			Logger.Debugf("目录 [%s] 不存在，已从配置中移除", dir.Path)
			continue
		}
	}

	Conf.Save()
	Conf.InitClient()

	gulu.Log.SetLevel(Conf.LogLevel)
}

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
	LogLevel string `json:"logLevel"` // 日志级别：Off, Trace, Debug, Info, Warn, Error, Fatal
	Dirs     []*Dir `json:"dirs"`     // 已经打开的文件夹
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

// Dir 维护了打开的 WebDAV 文件夹。
type Dir struct {
	URL      string `json:"url"`      // WebDAV URL
	Auth     string `json:"auth"`     // WebDAV 鉴权方式，空值表示不需要鉴权
	User     string `json:"user"`     // WebDAV 用户名
	Password string `json:"password"` // WebDAV 密码
	Path     string `json:"path"`     // 本地文件系统文件夹路径，远程 WebDAV 的话该字段为空

	client *gowebdav.Client `json:"-"` // WebDAV 客户端
	index  bleve.Index      `json:"-"` // 搜索引擎客户端
}

func (dir *Dir) IsRemote() bool {
	return "" == dir.Path
}

func (dir *Dir) InitClient() {
	// 初始化 WebDAV 客户端
	dir.client = gowebdav.NewClient(dir.URL, dir.User, dir.Password)
	dir.client.SetTimeout(7 * time.Second)

	// 初始化搜索引擎客户端
	indexName := sha(dir.URL)
	indexPath := filepath.Join(IndexPath, indexName)
	var err error
	if gulu.File.IsExist(indexPath) {
		dir.index, err = bleve.Open(indexPath)
		if nil != err {
			Logger.Fatalf("加载搜索索引失败：%s", err)
			return
		}
	} else {
		mapping := bleve.NewIndexMapping()
		mapping.DefaultAnalyzer = "cjk"
		dir.index, err = bleve.New(indexPath, mapping)
		if nil != err {
			Logger.Fatalf("创建搜索索引失败：%s", err)
			return
		}
	}
}

func (dir *Dir) CloseClient() {
	dir.client = nil
	dir.index.Close()
}

func (dir *Dir) Ls(path string) (ret []os.FileInfo, err error) {
	if ret, err = dir.client.ReadDir(path); nil != err {
		msg := fmt.Sprintf("列出目录 [%s] 下路径为 [%s] 的文件列表失败：%s", dir.URL, path, err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	return
}

func (dir *Dir) Get(path string) (ret string, err error) {
	data, err := dir.client.Read(path)
	if nil != err {
		msg := fmt.Sprintf("读取目录 [%s] 下的文件 [%s] 失败：%s", dir.URL, path, err)
		Logger.Errorf(msg)
		return "", errors.New(msg)
	}
	return gulu.Str.FromBytes(data), nil
}

func (dir *Dir) Put(path string, content []byte) error {
	if err := dir.client.Write(path, content, 0644); nil != err {
		msg := fmt.Sprintf("读取目录 [%s] 下的文件 [%s] 失败：%s", dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Stat(path string) (ret os.FileInfo, err error) {
	if ret, err = dir.client.Stat(path); nil != err {
		msg := fmt.Sprintf("查看目录 [%s] 下 [%s] 的元信息失败：%s", dir.URL, path, err)
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
		msg := fmt.Sprintf("重命名目录 [%s] 下的文件 [%s] 失败：%s", dir.URL, oldPath, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Mkdir(path string) error {
	if err := dir.client.Mkdir(path, 0755); nil != err {
		msg := fmt.Sprintf("在目录 [%s] 下创建新目录 [%s] 失败：%s", dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Remove(path string) error {
	if err := dir.client.Remove(path); nil != err {
		msg := fmt.Sprintf("在目录 [%s] 下删除 [%s] 失败：%s", dir.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (dir *Dir) Index() {
	Logger.Debugf("开始索引 [%s] 目录", dir.URL)
	files := dir.Files("/")
	var docs []*Doc
	for _, file := range files {
		content, err := dir.Get(file.(*gowebdav.File).Path())
		if nil == err {
			p := ""
			if !dir.IsRemote() {
				p = filepath.FromSlash(path.Join(dir.Path, file.Name()))
			}
			doc := newDoc(file.Name(), content, dir.URL, p)
			docs = append(docs, doc)
		}
	}
	dir.BatchIndexDocs(docs)
	Logger.Debugf("索引目录 [%s] 完毕", dir.URL)
}

func (dir *Dir) Unindex() {
	Logger.Debugf("开始删除索引 [%s] 目录", dir.URL)
	files := dir.Files("/")
	var docIds []string
	for _, file := range files {
		content, err := dir.Get(file.(*gowebdav.File).Path())
		if nil == err {
			doc := newDoc(file.Name(), content, dir.URL, path.Join(dir.Path, file.Name()))
			docIds = append(docIds, doc.Id)
		}
	}
	dir.BatchUnindexDocs(docIds)
	indexName := sha(dir.URL)
	dir.index.Close()
	os.RemoveAll(filepath.Join(IndexPath, indexName))
	Logger.Debugf("删除索引目录 [%s] 完毕", dir.URL)
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