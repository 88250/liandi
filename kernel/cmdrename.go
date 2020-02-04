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
	"path"
)

type rename struct {
	*BaseCmd
}

func (cmd *rename) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	url := cmd.param["url"].(string)
	url = NormalizeURL(url)
	oldPath := cmd.param["oldPath"].(string)
	newPath := cmd.param["newPath"].(string)
	err := Rename(url, oldPath, newPath)
	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		Push(ret.Bytes())
		return
	}

	ret.Data = map[string]interface{}{
		"url":     url,
		"oldPath": oldPath,
		"newPath": newPath,
		"newName": path.Base(newPath),
	}
	Push(ret.Bytes())
}

func (cmd *rename) Name() string {
	return "rename"
}
