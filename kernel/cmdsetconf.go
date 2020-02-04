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

import "encoding/json"

type setconf struct {
	*BaseCmd
}

func (cmd *setconf) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	data, err := json.MarshalIndent(cmd.param, "", "   ")
	if nil != err {
		ret.Code = -1
		ret.Msg = "设置配置参数异常"
		Push(ret.Bytes())
	}
	if err = json.Unmarshal(data, Conf); nil != err {
		ret.Code = -1
		ret.Msg = "设置配置参数异常"
		Push(ret.Bytes())
	}
	Conf.Save()
	Push(ret.Bytes())
}

func (cmd *setconf) Name() string {
	return "setconf"
}
