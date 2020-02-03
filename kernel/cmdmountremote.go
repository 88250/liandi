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

package main

type mountremote struct {
	*BaseCmd
}

func (cmd *mountremote) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	url := cmd.param["url"].(string)
	url = NormalizeURL(url)
	user := cmd.param["user"].(string)
	password := cmd.param["password"].(string)
	StopServeWebDAV()
	MountRemote(url, user, password)
	StartServeWebDAV()
	data := []map[string]interface{}{}
	for _, dir := range Conf.Dirs {
		data = append(data, map[string]interface{}{
			"dir": dir,
		})
	}
	ret.Data = data
	Push(ret.Bytes())
}

func (cmd *mountremote) Name() string {
	return "mountremote"
}
