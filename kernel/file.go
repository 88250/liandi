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
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/88250/gowebdav"
	"github.com/88250/gulu"
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
	ret.Size = f.Size()
	ret.Mtime = f.ModTime().Unix()
	return
}

func isMarkdown(fileInfo os.FileInfo) bool {
	fname := strings.ToLower(filepath.Ext(fileInfo.Name()))
	return ".md" == fname || ".markdown" == fname || ".txt" == fname
}

func Ls(url, path string) (ret []*File, err error) {
	ret = []*File{}

	dir := Conf.dir(url)
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

		if isMarkdown(f) {
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

func Lsd(url, path string) (ret []*File, err error) {
	ret = []*File{}

	dir := Conf.dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	files, err := dir.Ls(path)
	if nil != err {
		return nil, err
	}

	for _, f := range files {
		if strings.HasPrefix(f.Name(), ".") || dir.isSkipDir(f.Name()) {
			continue
		}

		if !f.IsDir() {
			continue
		}

		file := fromFileInfo(f)
		ret = append(ret, file)
	}

	sort.Slice(ret, func(i, j int) bool { return ret[i].Name < ret[j].Name })

	return
}

func Get(url, path string) (ret string, err error) {
	dir := Conf.dir(url)
	if nil == dir {
		return "", errors.New(Conf.lang(0))
	}
	ret, err = dir.Get(path)
	return
}

func Put(url, path string, content []byte) error {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	if err := dir.Put(path, content); nil != err {
		return err
	}

	doc := newDoc(url, path, gulu.Str.FromBytes(content))
	dir.IndexDoc(doc)
	return nil
}

func Create(url, path string) error {
	exist, err := Exist(url, path)
	if nil != err {
		return err
	}
	if exist {
		return errors.New(Conf.lang(1))
	}
	return Put(url, path, []byte(""))
}

func Exist(url, path string) (bool, error) {
	dir := Conf.dir(url)
	if nil == dir {
		return false, errors.New(Conf.lang(0))
	}

	return dir.Exist(path)
}

func Stat(url, path string) (ret *File, err error) {
	dir := Conf.dir(url)
	if nil == dir {
		return nil, errors.New(Conf.lang(0))
	}

	var f os.FileInfo
	if f, err = dir.Stat(path); nil != err {
		return nil, err
	}
	ret = fromFileInfo(f)
	return
}

func Rename(url, oldPath, newPath string) error {
	dir := Conf.dir(url)
	if nil == dir {
		return errors.New(Conf.lang(0))
	}
	if err := dir.Rename(oldPath, newPath); nil != err {
		return err
	}

	dir.RemoveIndexDoc(url, oldPath)
	return nil
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
	dir.RemoveIndexDoc(url, path)
	return dir.Remove(path)
}
