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

package util

import (
	"fmt"
	"github.com/88250/gulu"
	"io"
	"os"
)

var (
	Logger  *gulu.Logger
	logFile *os.File
)

func InitLog() {
	var err error
	logFile, err = os.Create(LogPath)
	if nil != err {
		fmt.Errorf("创建日志文件 [%s] 失败", LogPath)
		os.Exit(-2)
	}

	gulu.Log.SetLevel("trace")
	Logger = gulu.Log.NewLogger(io.MultiWriter(logFile, os.Stdout))
}

func CloseLog() {
	logFile.Close()
	os.Stdout.Close()
}
