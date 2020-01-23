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

const (
	Ver        = "1.0.0"
	ServerPort = 6806
	UserAgent  = "LianDi/v" + Ver
)

var (
	logger     = gulu.Log.NewLogger(os.Stdout)
	HomeDir, _ = gulu.OS.Home()
	LianDiDir  = filepath.Join(HomeDir, ".liandi")
)

// AppConf 维护应用元数据，保存在 ~/.liandi/conf.json ，记录已经打开的文件夹、各种配置项等。
type AppConf struct {
}

// DirConf 维护文件夹元数据，保存在打开文件夹下 .liandi/conf.json ，记录文件展开状态、编辑状态等。
type DirConf struct {
}
