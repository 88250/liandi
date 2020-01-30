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
	Id() float64
	Exec()
}

type BaseCmd struct {
	id    float64
	param map[string]interface{}
}

func (cmd *BaseCmd) Id() float64 {
	return cmd.id
}

func NewCommand(cmdStr string, param map[string]interface{}) Cmd {
	switch cmdStr {
	case "dirs":
		return &dirs{&BaseCmd{param: param}}
	case "mount":
		return &mount{&BaseCmd{param: param}}
	case "mountremote":
		return &mountremote{&BaseCmd{param: param}}
	case "unmount":
		return &unmount{&BaseCmd{param: param}}
	case "ls":
		return &ls{&BaseCmd{param: param}}
	case "lsd":
		return &lsd{&BaseCmd{param: param}}
	case "get":
		return &get{&BaseCmd{param: param}}
	case "put":
		return &put{&BaseCmd{param: param}}
	case "create":
		return &create{&BaseCmd{param: param}}
	case "search":
		return &search{&BaseCmd{param: param}}
	case "rename":
		return &rename{&BaseCmd{param: param}}
	case "mkdir":
		return &mkdir{&BaseCmd{param: param}}
	case "remove":
		return &remove{&BaseCmd{param: param}}
	}
	return nil
}

func Exec(cmd Cmd) {
	go func() {
		defer util.Recover()
		cmd.Exec()
	}()
}
