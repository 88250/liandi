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
	"sort"
	"strings"

	"github.com/88250/gowebdav"
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

	dir := Conf.Dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	files, err := dir.Ls(path)
	if nil != err {
		return nil, err
	}

	var dirs, docs []*File
	for _, f := range files {
		if strings.HasPrefix(f.Name(), ".") || dir.isSkipDir(f.Name()) {
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

func Get(url, path string) (ret string, err error) {
	dir := Conf.Dir(url)
	if nil == dir {
		return "", errors.New(Conf.lang(0))
	}

	tree := dir.Tree(path)
	if nil == tree {
		return "", errors.New(Conf.lang(13))
	}

	ret = Lute.Tree2VditorIRBlockDOM(tree)
	return
}

func Put(url, p string, domStr string) (backlinks []*BacklinkRefBlock, err error) {
	dir := Conf.Dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	// DOM 转树
	tree, err := Lute.VditorIRBlockDOM2Tree(domStr)
	if nil != err {
		msg := fmt.Sprintf(Conf.lang(12), err)
		Logger.Errorf(msg)
		return nil, errors.New(msg)
	}
	tree.URL = url
	tree.Path = p
	dir.IndexTree(tree)

	// 更新索引
	dir.IndexDoc(tree.Path, tree.Root.Text())

	// 反向链接
	backlinks = dir.IndexLink(tree)

	// 持久化数据
	if err = WriteASTJSON(tree); nil != err {
		return nil, err
	}
	return
}

func PutBlob(url, path string, data []byte) (err error) {
	dir := Conf.Dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}

	err = dir.Put(path, data)
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
	dir := Conf.Dir(url)
	if nil == dir {
		return false, errors.New(Conf.lang(0))
	}
	return dir.Exist(path)
}

func Rename(url, oldPath, newPath string) error {
	dir := Conf.Dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	if strings.HasSuffix(oldPath, "/") {
		// 重命名文件夹
		if err := dir.Rename(oldPath, newPath); nil != err {
			return err
		}
		dir.MoveIndexDocsDir(oldPath, newPath)
		dir.MoveTreeDir(oldPath, newPath)
		return nil
	}

	// 重命名文件

	if err := dir.Rename(oldPath+".md.json", newPath+".md.json"); nil != err {
		return err
	}
	dir.MoveIndexDoc(oldPath, newPath)
	dir.MoveTree(oldPath, newPath)

	// 如果存在 md 文件的话也进行重命名，否则重启时会索引生成 AST
	exist, err := dir.Exist(oldPath + ".md")
	if nil != err {
		return err
	}
	if exist {
		return dir.Rename(oldPath+".md", newPath+".md")
	}
	return nil
}

func Mkdir(url, path string) error {
	dir := Conf.Dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	exist, err := dir.Exist(path)
	if nil != err {
		return err
	}
	if exist {
		return errors.New(Conf.lang(1))
	}
	return dir.Mkdir(path)
}

// deletedSuffix 文件/文件夹删除后缀。
// 删除逻辑为了安全考虑，只是进行重命名，带上 .deleted 后缀。
const deletedSuffix = ".deleted"

func Remove(url, path string) error {
	dir := Conf.Dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}

	if strings.HasSuffix(path, "/") {
		if err := dir.Rename(path, path+deletedSuffix); nil != err {
			return err
		}
		dir.RemoveIndexDocDir(path)
		dir.RemoveTreeDir(path)
		return nil
	}

	// 删除文件

	if err := dir.Rename(path+".md.json", path+".md.json"+deletedSuffix); nil != err {
		return err
	}
	dir.RemoveIndexDoc(path)
	dir.RemoveTree(path)

	// 如果存在 md 文件的话也进行重命名
	exist, err := dir.Exist(path + ".md")
	if nil != err {
		return err
	}
	if exist {
		return dir.Rename(path+".md", path+".md"+deletedSuffix)
	}
	return nil
}
