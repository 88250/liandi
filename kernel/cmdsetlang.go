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

type setlang struct {
	*BaseCmd
}

func (cmd *setlang) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	lang := cmd.param["lang"].(string)
	Conf.Lang = lang
	Conf.Save()
	Push(ret.Bytes())
}

func (cmd *setlang) Name() string {
	return "setlang"
}
