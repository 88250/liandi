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
	"crypto/tls"
	"time"

	"github.com/parnurzeal/gorequest"
)

type checkupdate struct {
	*BaseCmd
}

func (cmd *checkupdate) Exec() {
	ret := NewCmdResult(cmd.Name(), cmd.id)

	var result map[string]interface{}
	request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	_, _, errs := request.Get("https://rhythm.b3log.org/version/liandi").
		Set("User-Agent", UserAgent).Timeout(7 * time.Second).EndStruct(&result)
	if nil != errs {
		Logger.Errorf("Check update failed: %s", errs)
		ret.Code = -1
		Push(ret.Bytes())
		return
	}
	Logger.Infof("检查版本结果 [%s]", result)
	latestVer := result["ver"].(string)
	if latestVer > Ver {
		ret.Code = 1
		ret.Data = map[string]interface{}{
			"dl": result["dl"].(string),
		}
	}
	Push(ret.Bytes())
}

func (cmd *checkupdate) Name() string {
	return "checkupdate"
}
