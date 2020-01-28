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
	"errors"
	"os"
	"path/filepath"
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
	f := fileInfo.(gowebdav.File)
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
		return nil, ErrDirNotExist
	}

	files, err := dir.Ls(path)
	if nil != err {
		return nil, err
	}

	for _, f := range files {
		if strings.HasPrefix(f.Name(), ".") || dir.isSkipDir(f.Name()) {
			continue
		}

		if !f.IsDir() && !isMarkdown(f) {
			continue
		}

		file := fromFileInfo(f)
		ret = append(ret, file)
	}
	return
}

var (
	ErrDirNotExist = errors.New("查询目录失败")
)

func Get(url, path string) (ret string, err error) {
	dir := Conf.dir(url)
	if nil == dir {
		return "", ErrDirNotExist
	}
	ret, err = dir.Get(path)
	return
}

func Put(url, path, content string) error {
	dir := Conf.dir(url)
	if nil == dir {
		return ErrDirNotExist
	}
	return dir.Put(path, content)
}
