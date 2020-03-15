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
	baseCmd := &BaseCmd{id: cmdId, param: param}
	switch cmdStr {
	case "dirs":
		ret = &dirs{baseCmd}
	case "mount":
		ret = &mount{baseCmd}
	case "mountremote":
		ret = &mountremote{baseCmd}
	case "unmount":
		ret = &unmount{baseCmd}
	case "ls":
		ret = &ls{baseCmd}
	case "lsd":
		ret = &lsd{baseCmd}
	case "get":
		ret = &get{baseCmd}
	case "put":
		ret = &put{baseCmd}
	case "create":
		ret = &create{baseCmd}
	case "search":
		ret = &search{baseCmd}
	case "rename":
		ret = &rename{baseCmd}
	case "mkdir":
		ret = &mkdir{baseCmd}
	case "remove":
		ret = &remove{baseCmd}
	case "getconf":
		ret = &getconf{baseCmd}
	case "setlang":
		ret = &setlang{baseCmd}
	case "settheme":
		ret = &settheme{baseCmd}
	case "setmd":
		ret = &setmd{baseCmd}
	case "checkupdate":
		ret = &checkupdate{baseCmd}
	case "searchget":
		ret = &searchget{baseCmd}
	case "setimage":
		ret = &setimage{baseCmd}
	}
	return
}

func Exec(cmd Cmd) {
	go func() {
		defer Recover()
		cmd.Exec()
	}()
}
