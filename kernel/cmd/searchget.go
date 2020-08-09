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

type searchget struct {
	*BaseCmd
}

func (cmd *searchget) Exec() {
	ret := model.NewCmdResult(cmd.Name(), cmd.id)
	url := cmd.param["url"].(string)
	url = model.NormalizeURL(url)
	p := cmd.param["path"].(string)
	content, err := model.Get(url, p)
	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
	} else {
		ret.Data = map[string]interface{}{
			"name":    path.Base(p),
			"content": content,
			"url":     url,
			"path":    p,
			"index":   cmd.param["index"],
			"key":     cmd.param["key"],
		}
	}
	cmd.Push(ret.Bytes())
}

func (cmd *searchget) Name() string {
	return "searchget"
}
