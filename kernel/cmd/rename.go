// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package cmd

import (
	"path"

	"github.com/88250/liandi/kernel/model"
)

type rename struct {
	*BaseCmd
}

func (cmd *rename) Exec() {
	ret := cmd.PushPayload
	url := cmd.param["url"].(string)
	url = model.NormalizeURL(url)
	oldPath := cmd.param["oldPath"].(string)
	newPath := cmd.param["newPath"].(string)
	err := model.Rename(url, oldPath, newPath)
	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		cmd.Push()
		return
	}

	ret.Data = map[string]interface{}{
		"url":     url,
		"oldPath": oldPath,
		"newPath": newPath,
		"newName": path.Base(newPath),
	}
	cmd.Push()

	pushReloadEvent(cmd.PushPayload, map[string]interface{}{
		"url":     url,
		"oldPath": oldPath,
		"newPath": newPath,
	})
}

func (cmd *rename) Name() string {
	return "rename"
}
