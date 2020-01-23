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
	"os"
	"path/filepath"

	"github.com/88250/gulu"
)

const Ver = "1.0.0"

var UserAgent = "LianDi/v" + Ver

var logger = gulu.Log.NewLogger(os.Stdout)

const (
	ServerPort = 6804
	AriaPort   = 6805
)

var HomeDir, _ = gulu.OS.Home()
var LianDiDir = filepath.Join(HomeDir, ".liandi")
