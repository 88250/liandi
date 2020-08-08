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
	"encoding/json"

	"github.com/88250/liandi/kernel/model"
)

type setimage struct {
	*BaseCmd
}

func (cmd *setimage) Exec() {
	ret := model.NewCmdResult(cmd.Name(), cmd.id)

	param, err := json.Marshal(cmd.param)
	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		cmd.Push(ret.Bytes())
		return
	}

	image := &model.Image{}
	if err = json.Unmarshal(param, image); nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		cmd.Push(ret.Bytes())
		return
	}

	model.Conf.Image = image
	model.Conf.Save()

	ret.Data = model.Conf.Image
	cmd.Push(ret.Bytes())
}

func (cmd *setimage) Name() string {
	return "setimage"
}
