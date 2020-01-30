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

type mountremote struct {
	*BaseCmd
}

func (cmd *mountremote) Exec() {
	ret := util.NewCmdResult(cmd.Name())
	url := cmd.param["url"].(string)
	url = util.NormalizeURL(url)
	user := cmd.param["user"].(string)
	password := cmd.param["password"].(string)
	util.StopServeWebDAV()
	url, alreadyMount := util.MountRemote(url, user, password)
	util.StartServeWebDAV()
	if !alreadyMount {
		ret.Data = map[string]interface{}{
			"url":    url,
			"remote": true,
		}
		util.Push(ret.Bytes())
	}
}

func (cmd *mountremote) Name() string {
	return "mountremote"
}
