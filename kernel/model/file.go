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
	"errors"
	"fmt"
	"os"
	"path"
	"sort"
	"strings"

	"github.com/88250/gowebdav"
	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
)

type File struct {
	Path   string `json:"path"`
	Name   string `json:"name"`
	IsDir  bool   `json:"isdir"`
	Size   int64  `json:"size"`
	HSize  string `json:"hSize"`
	Mtime  int64  `json:"mtime"`
	HMtime string `json:"hMtime"`
}

func fromFileInfo(fileInfo os.FileInfo) (ret *File) {
	ret = &File{}
	f := fileInfo.(*gowebdav.File)
	ret.Path = f.Path()
	ret.Name = f.Name()
	ret.IsDir = f.IsDir()
	if !ret.IsDir {
		ret.Name = ret.Name[:len(ret.Name)-len(".md.json")]
		ret.Path = ret.Path[:len(ret.Path)-len(".md.json")]
	}
	ret.Size = f.Size()
	ret.Mtime = f.ModTime().Unix()
	return
}

func isMarkdown(fileInfo os.FileInfo) bool {
	return strings.HasSuffix(fileInfo.Name(), ".md")
}

func isJSON(fileInfo os.FileInfo) bool {
	return strings.HasSuffix(fileInfo.Name(), ".md.json")
}

func Ls(url, path string) (ret []*File, err error) {
	// 列出文件实现基于 WebDAV 操作，因为根据语法树无法逆推出空的文件夹

	ret = []*File{}

	box := Conf.Box(url)
	if nil == box {
		return nil, errors.New(Conf.lang(0))
	}

	files, err := box.Ls(path)
	if nil != err {
		return nil, err
	}

	var dirs, docs []*File
	for _, f := range files {
		if strings.HasPrefix(f.Name(), ".") || box.isSkipDir(f.Name()) {
			continue
		}

		if f.IsDir() {
			dirs = append(dirs, fromFileInfo(f))
			continue
		}

		if isJSON(f) {
			docs = append(docs, fromFileInfo(f))
			continue
		}
	}

	sort.Slice(dirs, func(i, j int) bool { return dirs[i].Name < dirs[j].Name })
	ret = append(ret, dirs...)
	sort.Slice(docs, func(i, j int) bool { return docs[i].Name < docs[j].Name })
	ret = append(ret, docs...)
	return
}

func Get(url, path string) (dom string, err error) {
	box := Conf.Box(url)
	if nil == box {
		return "", errors.New(Conf.lang(0))
	}

	tree := box.Tree(path)
	if nil == tree {
		return "", errors.New(Conf.lang(13))
	}
	dom = Lute.Tree2VditorIRBlockDOM(tree, false)
	return
}

func Put(url, p string, domStr string) (backlinks []*BacklinkRefBlock, err error) {
	box := Conf.Box(url)
	if nil == box {
		return nil, errors.New(Conf.lang(0))
	}

	treeID := ast.NewNodeID()
	tree := box.Tree(p)
	if nil != tree {
		treeID = tree.ID
	}

	// DOM 转树
	tree, err = Lute.VditorIRBlockDOM2Tree(domStr)
	if nil != err {
		msg := fmt.Sprintf(Conf.lang(12), err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	tree.URL = url
	tree.Path = p
	tree.Name = path.Base(p)
	tree.ID = treeID
	tree.Root.ID = treeID

	// 索引
	box.IndexTree(tree)

	// 反向链接
	backlinks = indexLink(tree)

	// 持久化数据
	if err = WriteASTJSON(tree); nil != err {
		return nil, err
	}
	return
}

func PutBlob(url, path string, data []byte) (err error) {
	box := Conf.Box(url)
	if nil == box {
		return errors.New(Conf.lang(0))
	}

	err = box.Put(path, data)
	return
}

func Create(url, path string) (err error) {
	exist, err := Exist(url, path+".md.json")
	if nil != err {
		return err
	}
	if exist {
		return errors.New(Conf.lang(1))
	}
	_, err = Put(url, path, "")
	return
}

func Exist(url, path string) (bool, error) {
	box := Conf.Box(url)
	if nil == box {
		return false, errors.New(Conf.lang(0))
	}
	return box.Exist(path)
}

func Rename(url, oldPath, newPath string) error {
	box := Conf.Box(url)
	if nil == box {
		return errors.New(Conf.lang(0))
	}
	if strings.HasSuffix(oldPath, "/") {
		// 重命名文件夹
		if err := box.Rename(oldPath, newPath); nil != err {
			return err
		}
		box.MoveTreeDir(oldPath, newPath)
		return nil
	}

	// 重命名文件

	if err := box.Rename(oldPath+".md.json", newPath+".md.json"); nil != err {
		return err
	}
	box.MoveTree(oldPath, newPath)

	// 如果存在 md 文件的话也进行重命名，否则重启时会索引生成 AST
	exist, err := box.Exist(oldPath + ".md")
	if nil != err {
		return err
	}
	if exist {
		return box.Rename(oldPath+".md", newPath+".md")
	}
	return nil
}

func Mkdir(url, path string) error {
	box := Conf.Box(url)
	if nil == box {
		return errors.New(Conf.lang(0))
	}
	exist, err := box.Exist(path)
	if nil != err {
		return err
	}
	if exist {
		return errors.New(Conf.lang(1))
	}
	return box.Mkdir(path)
}

// deletedSuffix 文件/文件夹删除后缀。
// 删除逻辑为了安全考虑，只是进行重命名，带上 .deleted 后缀。
const deletedSuffix = ".deleted"

func Remove(url, p string) error {
	box := Conf.Box(url)
	if nil == box {
		return errors.New(Conf.lang(0))
	}

	if strings.HasSuffix(p, "/") {
		newPath := p[:len(p)-1] + deletedSuffix + "/"
		exist, err := Exist(url, newPath)
		if nil != err {
			return err
		}
		if exist {
			newPath = p[:len(p)-1] + "-" + gulu.Rand.String(7) + deletedSuffix + "/"
		}
		if err := box.Rename(p, newPath); nil != err {
			return err
		}
		box.RemoveTreeDir(p)
		return nil
	}

	// 删除文件
	newPath := p + ".md.json" + deletedSuffix
	exist, err := Exist(url, newPath)
	if nil != err {
		return err
	}
	if exist {
		newPath = p + "-" + gulu.Rand.String(7) + ".md.json" + deletedSuffix
	}

	if err := box.Rename(p+".md.json", newPath); nil != err {
		return err
	}
	box.RemoveTree(p)

	// 如果存在 md 文件的话也进行重命名
	exist, err = box.Exist(p + ".md")
	if nil != err {
		return err
	}
	if exist {
		return box.Rename(p+".md", p+".md"+deletedSuffix)
	}
	return nil
}
