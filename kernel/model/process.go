// LianDi - 链滴笔记，连接点滴
// Copyright (c) 2020-present, b3log.org
//
// LianDi is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//         http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

package model

import (
	"os"
	"time"

	"github.com/mitchellh/go-ps"
)

var ppid = os.Getppid()
var childProcess map[int]*os.Process

func InitProcess() {
	childProcess = map[int]*os.Process{}
}

func ParentExited() {
	for range time.Tick(2 * time.Second) {
		pids := []int{ppid}
		for childPid, _ := range childProcess {
			pids = append(pids, childPid)
		}

		emptyProcess := true
		for _, pid := range pids {
			process, _ := ps.FindProcess(pid)
			if nil != process {
				emptyProcess = false
				break
			}
		}
		if emptyProcess {
			Logger.Infof("UI 进程已经退出，现在退出内核进程")
			Close()
			os.Exit(0)
		}
	}
}

func AddChildProcess(process *os.Process) {
	childProcess[process.Pid] = process
}

func RemoveChildProcess(process *os.Process) {
	delete(childProcess, process.Pid)
}
