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

import (
	"path"
	"strings"
)

type searchget struct {
	*BaseCmd
}

func (cmd *searchget) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)
	url := cmd.param["url"].(string)
	url = NormalizeURL(url)
	p := cmd.param["path"].(string)
	ln := cmd.param["ln"].(float64)
	col := cmd.param["col"].(float64)
	Logger.Info(ln, col)
	content, err := Get(url, p)

	lines := strings.Split(content, "\n")
	hitLn := lines[ln-1]
	p0 := hitLn[:(col-1)]



	if nil != err {
		ret.Code = -1
		ret.Msg = err.Error()
		return
	} else {
		ret.Data = map[string]interface{}{
			"name":    path.Base(p),
			"content": content,
			"url":     url,
			"path":    p,
		}
	}
	Push(ret.Bytes())
}

func (cmd *searchget) Name() string {
	return "searchget"
}
