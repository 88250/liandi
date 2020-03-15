// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package main

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

func NewCommand(cmdStr string, cmdId float64, param map[string]interface{}) (ret Cmd) {
	switch cmdStr {
	case "dirs":
		return &dirs{&BaseCmd{id: cmdId, param: param}}
	case "mount":
		return &mount{&BaseCmd{id: cmdId, param: param}}
	case "mountremote":
		return &mountremote{&BaseCmd{id: cmdId, param: param}}
	case "unmount":
		return &unmount{&BaseCmd{id: cmdId, param: param}}
	case "ls":
		return &ls{&BaseCmd{id: cmdId, param: param}}
	case "lsd":
		return &lsd{&BaseCmd{id: cmdId, param: param}}
	case "get":
		return &get{&BaseCmd{id: cmdId, param: param}}
	case "put":
		return &put{&BaseCmd{id: cmdId, param: param}}
	case "create":
		return &create{&BaseCmd{id: cmdId, param: param}}
	case "search":
		return &search{&BaseCmd{id: cmdId, param: param}}
	case "rename":
		return &rename{&BaseCmd{id: cmdId, param: param}}
	case "mkdir":
		return &mkdir{&BaseCmd{id: cmdId, param: param}}
	case "remove":
		return &remove{&BaseCmd{id: cmdId, param: param}}
	case "getconf":
		return &getconf{&BaseCmd{id: cmdId, param: param}}
	case "setlang":
		return &setlang{&BaseCmd{id: cmdId, param: param}}
	case "settheme":
		return &settheme{&BaseCmd{id: cmdId, param: param}}
	case "setmd":
		return &setmd{&BaseCmd{id: cmdId, param: param}}
	case "checkupdate":
		return &checkupdate{&BaseCmd{id: cmdId, param: param}}
	case "searchget":
		return &searchget{&BaseCmd{id: cmdId, param: param}}
	case "setimage":
		return &setimage{&BaseCmd{id:cmdId, param:param}}
	}
	return nil
}

func Exec(cmd Cmd) {
	go func() {
		defer Recover()
		cmd.Exec()
	}()
}
