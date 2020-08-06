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

func isMarkdown(fileInfo os.FileInfo) bool {
	fname := strings.ToLower(path.Ext(fileInfo.Name()))
	return ".md" == fname || ".markdown" == fname
}

func isJSON(fileInfo os.FileInfo) bool {
	return strings.HasSuffix(fileInfo.Name(), ".md.json")
}

func Ls(url, p string) (ret []*File, err error) {
	ret = []*File{}

	dir := Conf.dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	var dirs, docs []*File

	for _, tree := range trees {
		if tree.URL != dir.URL {
			continue
		}
		treeDir := path.Dir(tree.Path)
		if p == treeDir {
			docs = append(docs, &File{Path: tree.Path, Name: path.Base(tree.Path)})
		} else if p == path.Dir(treeDir) {
			var existDir bool
			for _, dir := range dirs {
				if dir.Path == treeDir {
					existDir = true
					break
				}
			}
			if !existDir {
				dirs = append(dirs, &File{Path: treeDir, Name: path.Base(treeDir), IsDir: true})
			}
		}
	}

	sort.Slice(dirs, func(i, j int) bool { return dirs[i].Name < dirs[j].Name })
	ret = append(ret, dirs...)
	sort.Slice(docs, func(i, j int) bool { return docs[i].Name < docs[j].Name })
	ret = append(ret, docs...)
	return
}

func Get(url, path string) (ret string, err error) {
	dir := Conf.dir(url)
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
	dir := Conf.dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	// DOM 转 Markdown
	markdown := Lute.VditorIRBlockDOM2Md(domStr)
	dir.IndexDoc(p, markdown)

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

	// 构建双链
	backlinks = dir.IndexLink(tree)

	// 持久化数据
	if err = WriteASTJSON(tree); nil != err {
		return nil, err
	}
	return
}

func PutBlob(url, path string, data []byte) (err error) {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}

	err = dir.Put(path, data)
	return
}

func Create(url, path string) (err error) {
	exist, err := Exist(url, path)
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
	dir := Conf.dir(url)
	if nil == dir {
		return false, errors.New(Conf.lang(0))
	}

	return dir.Exist(path)
}

func Rename(url, oldPath, newPath string) error {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	if err := dir.Rename(oldPath+".json", newPath+".json"); nil != err {
		return err
	}

	dir.MoveIndexDoc(oldPath, newPath)
	dir.MoveTree(url, oldPath, newPath)
	return MoveASTJSON(url, oldPath, newPath)
}

func Mkdir(url, path string) error {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	return dir.Mkdir(path)
}

func Remove(url, path string) error {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	dir.RemoveIndexDoc(path)
	dir.RemoveTree(path)
	err := dir.Remove(path + ".json")
	if nil != err {
		return err
	}
	return RemoveASTJSON(url, path)
}
