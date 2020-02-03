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

type mount struct {
	*BaseCmd
}

func (cmd *mount) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	p := cmd.param["path"].(string)
	url := cmd.param["url"].(string)
	url = NormalizeURL(url)
	StopServeWebDAV()
	Mount(url, p)
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

func (cmd *mount) Name() string {
	return "mount"
}
