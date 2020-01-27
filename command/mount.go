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

package command

import (
	"github.com/88250/liandi/util"
)

type mount struct {
}

func (cmd *mount) Exec(param map[string]interface{}) {
	ret := util.NewCmdResult(cmd.Name())
	p := param["path"].(string)
	url := param["url"].(string)
	url = util.NormalizeURL(url)
	util.StopServeWebDAV()
	url, alreadyMount := util.Mount(url, p)
	util.StartServeWebDAV()
	if !alreadyMount {
		ret.Data = map[string]interface{}{
			"url": url,
		}
	}
	util.Push(ret.Bytes())
}

func (cmd *mount) Name() string {
	return "mount"
}
