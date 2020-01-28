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

type Cmd interface {
	Name() string
	Param(map[string]interface{})
	Exec()
}

type BaseCmd struct {
	param map[string]interface{}
}

func (cmd *BaseCmd) Param(param map[string]interface{}) {
	cmd.param = param
}

var Commands = map[string]Cmd{}

func Exec(cmd Cmd) {
	go func() {
		defer util.Recover()
		cmd.Exec()
	}()
}

func init() {
	registerCommand(&mount{&BaseCmd{}})
	registerCommand(&unmount{&BaseCmd{}})
	registerCommand(&ls{&BaseCmd{}})
	registerCommand(&get{&BaseCmd{}})
	registerCommand(&put{&BaseCmd{}})
	registerCommand(&search{&BaseCmd{}})
	registerCommand(&dirs{&BaseCmd{}})
}

func registerCommand(cmd Cmd) {
	Commands[cmd.Name()] = cmd
}
