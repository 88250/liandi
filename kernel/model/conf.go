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
	"github.com/88250/lute"
	"github.com/88250/lute/parse"
)

// Mode 标识了运行模式，默认开发环境。
// 打包时通过构建参数 -ldflags "-X github.com/88250/liandi/kernel/model.Mode=prod" 注入 prod 生产模式，参考 build 脚本。
var Mode = "dev"

const (
	Ver        = "1.1.3"
	ServerPort = "6806"
	UserAgent  = "LianDi/v" + Ver
)

var (
	HomeDir, _    = gulu.OS.Home()
	LianDiDir     = filepath.Join(HomeDir, ".liandi")
	ConfPath      = filepath.Join(LianDiDir, "conf.json")
	LogPath       = filepath.Join(LianDiDir, "liandi.log")
	WorkingDir, _ = os.Getwd()
)

var Conf *AppConf
var Lute *lute.Lute

func Close() {
	Conf.Close()
	StopServeWebDAV()
	CloseLog()
}

func InitConf() {
	Conf = &AppConf{LogLevel: "debug", Theme: "light", Lang: "zh_CN", Boxes: []*Box{}}
	Lute = lute.New()
	if gulu.File.IsExist(ConfPath) {
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

	for i := 0; i < len(Conf.Boxes); i++ {
		box := Conf.Boxes[i]
		if !box.IsRemote() && !gulu.File.IsExist(box.LocalPath) {
			Conf.Boxes = append(Conf.Boxes[:i], Conf.Boxes[i+1:]...)
			Logger.Debugf("笔记本 [%s] 不存在，已从配置中移除", box.LocalPath)
			continue
		}
	}

	if nil == Conf.Markdown {
		Conf.Markdown = newMarkdown()
	}
	ConfLute()
	if nil == Conf.Image {
		Conf.Image = newImage()
	}

	if "" == Conf.Lang {
		Conf.Lang = "zh_CN"
	}

	Conf.Save()
	Conf.InitClient()

	gulu.Log.SetLevel(Conf.LogLevel)
}

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
	LogLevel string    `json:"logLevel"` // 日志级别：Off, Trace, Debug, Info, Warn, Error, Fatal
	Boxes    []*Box    `json:"boxes"`    // 已经打开的盒子
	Theme    string    `json:"theme"`    // 界面主题：light, dark
	Lang     string    `json:"lang"`     // 界面语言
	Markdown *Markdown `json:"markdown"` // Markdown 引擎配置
	Image    *Image    `json:"image"`    // 图片处理配置
}

type Markdown struct {
	Footnotes                           bool   `json:"footnotes"`
	ToC                                 bool   `json:"toc"`
	AutoSpace                           bool   `json:"autoSpace"`
	FixTermTypo                         bool   `json:"fixTermTypo"`
	ChinesePunct                        bool   `json:"chinesePunct"`
	InlineMathAllowDigitAfterOpenMarker bool   `json:"inlineMathAllowDigitAfterOpenMarker"`
	MathEngine                          string `json:"mathEngine"` // KaTeX / MathJax
	HideToolbar                         bool   `json:"hideToolbar"`
	Outline                             bool   `json:"outline"`
	ParagraphBeginningSpace             bool   `json:"paragraphBeginningSpace"`
}

type Image struct {
	AutoFetch bool `json:"autoFetch"` // 是否自动拉取远程图片到本地
}

func newMarkdown() *Markdown {
	return &Markdown{
		Footnotes:                           false,
		ToC:                                 false,
		AutoSpace:                           true,
		FixTermTypo:                         false,
		ChinesePunct:                        false,
		InlineMathAllowDigitAfterOpenMarker: false,
		MathEngine:                          "KaTeX",
		HideToolbar:                         false,
		Outline:                             false,
		ParagraphBeginningSpace:             false,
	}
}

func ConfLute() {
	Lute.Footnotes = Conf.Markdown.Footnotes
	Lute.ToC = Conf.Markdown.ToC
	Lute.AutoSpace = Conf.Markdown.AutoSpace
	Lute.FixTermTypo = Conf.Markdown.FixTermTypo
	Lute.ChinesePunct = Conf.Markdown.ChinesePunct
	Lute.InlineMathAllowDigitAfterOpenMarker = Conf.Markdown.InlineMathAllowDigitAfterOpenMarker
	Lute.InlineMathAllowDigitAfterOpenMarker = Conf.Markdown.InlineMathAllowDigitAfterOpenMarker
	Lute.ChineseParagraphBeginningSpace = Conf.Markdown.ParagraphBeginningSpace
	Lute.BlockRef = true
}

func newImage() *Image {
	return &Image{
		AutoFetch: false,
	}
}

func (conf *AppConf) Save() {
	data, _ := json.MarshalIndent(Conf, "", "   ")
	if err := ioutil.WriteFile(ConfPath, data, 0644); nil != err {
		Logger.Fatalf("写入配置文件 [%s] 失败：%s", ConfPath, err)
	}
}

func (conf *AppConf) InitClient() {
	for _, box := range conf.Boxes {
		box.InitClient()
	}
}

func (conf *AppConf) Close() {
	for _, box := range conf.Boxes {
		box.CloseClient()
	}
	conf.Save()
}

func (conf *AppConf) Box(url string) *Box {
	for _, box := range conf.Boxes {
		if box.URL == url {
			return box
		}
	}
	return nil
}

func (conf *AppConf) lang(num int) string {
	return langs[conf.Lang][num]
}

// Box 维护了打开的 WebDAV 端点。
type Box struct {
	URL       string `json:"url"`      // WebDAV URL
	Auth      string `json:"auth"`     // WebDAV 鉴权方式，空值表示不需要鉴权
	User      string `json:"user"`     // WebDAV 用户名
	Password  string `json:"password"` // WebDAV 密码
	LocalPath string `json:"path"`     // 本地文件系统文件夹路径，远程 WebDAV 的话该字段为空

	client *gowebdav.Client // WebDAV 客户端
}

func (box *Box) IsRemote() bool {
	return "" == box.LocalPath
}

func (box *Box) InitClient() {
	box.client = gowebdav.NewClient(box.URL, box.User, box.Password)
	box.client.SetTimeout(7 * time.Second)
}

func (box *Box) CloseClient() {
	box.client = nil
}

func (box *Box) Ls(path string) (ret []os.FileInfo, err error) {
	if ret, err = box.client.ReadDir(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(2), box.URL, path, err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	return
}

func (box *Box) Get(path string) (ret string, err error) {
	data, err := box.client.Read(path)
	if nil != err {
		msg := fmt.Sprintf(Conf.lang(3), box.URL, path, err)
		Logger.Errorf(msg)
		return "", errors.New(msg)
	}
	return gulu.Str.FromBytes(data), nil
}

func (box *Box) Put(path string, content []byte) error {
	if err := box.client.Write(path, content, 0644); nil != err {
		msg := fmt.Sprintf(Conf.lang(3), box.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (box *Box) Stat(path string) (ret os.FileInfo, err error) {
	if ret, err = box.client.Stat(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(4), box.URL, path, err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	return
}

func (box *Box) Exist(path string) (ret bool, err error) {
	if _, err = box.client.Stat(path); nil != err {
		if _, ok := err.(*os.PathError); ok {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (box *Box) Rename(oldPath, newPath string) error {
	if err := box.client.Rename(oldPath, newPath, false); nil != err {
		msg := fmt.Sprintf(Conf.lang(5), box.URL, oldPath, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (box *Box) Mkdir(path string) error {
	if err := box.client.Mkdir(path, 0755); nil != err {
		msg := fmt.Sprintf(Conf.lang(6), box.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (box *Box) Remove(path string) error {
	if err := box.client.Remove(path); nil != err {
		msg := fmt.Sprintf(Conf.lang(7), box.URL, path, err)
		Logger.Errorf(msg)
		return errors.New(msg)
	}
	return nil
}

func (box *Box) Index() {
	Logger.Debugf("开始导入笔记本 [%s] 下新的 Markdown 文件", box.URL)
	markdowns := box.ListNewMarkdowns("/")
	var importTrees []*parse.Tree
	for _, file := range markdowns {
		p := file.(*gowebdav.File).Path()
		markdown, err := box.Get(p)
		if nil != err {
			Logger.Fatalf("读取笔记本 [%s] 下的文件 [%s] 失败：%s", box.URL, p, err)
		}
		tree := box.ParseIndexTree(p, markdown)
		importTrees = append(importTrees, tree)
	}
	convertWikiLinks(importTrees) // 支持 [[link]] 语法的导入 https://github.com/88250/liandi/issues/131
	for _, tree := range importTrees {
		if err := WriteASTJSON(tree); nil != err {
			Logger.Fatalf("生成笔记本 [%s] 下的文件 [%s] 的元数据失败：%s", box.URL, tree.Path, err)
		}
	}
	Logger.Debugf("导入笔记本 [%s] 下新的 Markdown 文件 [%d] 完毕", box.URL, len(markdowns))

	Logger.Debugf("开始索引 [%s] 笔记本", box.URL)
	files := box.ListJSONs("/")
	for _, file := range files {
		p := file.(*gowebdav.File).Path()
		astJSONStr, err := ReadASTJSON(box.URL, p)
		if nil != err {
			Logger.Fatalf("读取笔记本 [%s] 下的文件 [%s] 的元数据失败：%s", box.URL, p, err)
		}
		tree, err := ParseJSON(astJSONStr)
		if nil != err {
			Logger.Fatalf("解析笔记本 [%s] 下的文件 [%s] 的元数据失败：%s", box.URL, p, err)
		}
		tree.URL = box.URL
		tree.Path = p[:len(p)-len(".md.json")]
		tree.Name = path.Base(tree.Path)
		box.IndexTree(tree)
	}
	Logger.Debugf("索引笔记本 [%s] 完毕", box.URL)
}

func (box *Box) Unindex() {
	Logger.Debugf("开始删除索引 [%s] 笔记本", box.URL)
	var paths []string
	for _, tree := range trees {
		paths = append(paths, tree.Path)
	}
	for _, p := range paths {
		box.RemoveTree(p)
	}

	// TODO 清理反向链接关系
}

func (box *Box) ListJSONs(path string) (ret []os.FileInfo) {
	fs, err := box.Ls(path)
	if nil != err {
		return
	}
	box.listJSONs(&fs, &ret)
	return
}

func (box *Box) listJSONs(files, ret *[]os.FileInfo) {
	for _, file := range *files {
		f := file.(*gowebdav.File)
		if strings.HasPrefix(f.Name(), ".") {
			continue
		}

		if box.isSkipDir(f.Name()) {
			continue
		}

		if f.IsDir() {
			fs, err := box.Ls(f.Path())
			if nil == err {
				box.listJSONs(&fs, ret)
			}
		} else {
			if isJSON(f) {
				*ret = append(*ret, f)
			}
		}
	}
	return
}

func (box *Box) ListNewMarkdowns(path string) (ret []os.FileInfo) {
	fs, err := box.Ls(path)
	if nil != err {
		return
	}
	box.listNewMarkdowns(&fs, &ret)
	return
}

func (box *Box) listNewMarkdowns(files, ret *[]os.FileInfo) {
	for _, file := range *files {
		f := file.(*gowebdav.File)
		if strings.HasPrefix(f.Name(), ".") {
			continue
		}

		if box.isSkipDir(f.Name()) {
			continue
		}

		if f.IsDir() {
			fs, err := box.Ls(f.Path())
			if nil == err {
				box.listNewMarkdowns(&fs, ret)
			}
		} else {
			if isMarkdown(f) {
				exist, _ := box.Exist(f.Path() + ".json")
				if !exist {
					*ret = append(*ret, f)
				}
			}
		}
	}
	return
}

func (box *Box) isSkipDir(filename string) bool {
	return "node_modules" == filename || "dist" == filename || "target" == filename || strings.HasSuffix(filename, deletedSuffix)
}

var zhCN = map[int]string{
	0:  "查询笔记本失败",
	1:  "文件名重复",
	2:  "列出笔记本 [%s] 下路径为 [%s] 的文件列表失败：%s",
	3:  "读取笔记本 [%s] 下的文件 [%s] 失败：%s",
	4:  "查看笔记本 [%s] 下 [%s] 的元信息失败：%s",
	5:  "重命名笔记本 [%s] 下的文件 [%s] 失败：%s",
	6:  "在笔记本 [%s] 下创建新文件夹 [%s] 失败：%s",
	7:  "在笔记本 [%s] 下删除 [%s] 失败：%s",
	8:  "检查更新失败",
	9:  "新版本可用 %s",
	10: "已是最新版",
	11: "拉取远程图片失败：%s",
	12: "解析失败：%s",
	13: "查询文件失败",
}

var enUS = map[int]string{
	0:  "Query notebook failed",
	1:  "Duplicated filename",
	2:  "List files of box [%s] and path [%s] failed: %s",
	3:  "Read notebook [%s] file [%s] failed: %s",
	4:  "Get notebook [%s] file [%s] meta info failed: %s",
	5:  "Rename notebook [%s] file [%s] failed: %s",
	6:  "Create notebook [%s] folder [%s] failed: %s",
	7:  "Remove notebook [%s] path [%s] failed: %s",
	8:  "Check update failed",
	9:  "New version is available %s",
	10: "Is the latest version",
	11: "Fetch remote image failed: %s",
	12: "Parse failed: %s",
	13: "Query file failed",
}

var langs = map[string]map[int]string{
	"zh_CN": zhCN,
	"en_US": enUS,
}
