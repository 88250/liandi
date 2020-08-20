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
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/parnurzeal/gorequest"
)

var checkUpdateLock = &sync.Mutex{}

func CheckUpdate() {
	checkUpdateLock.Lock()
	defer checkUpdateLock.Unlock()

	Logger.Info("开始检查更新")

	result := map[string]interface{}{}
	request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	_, _, errs := request.Get("https://rhythm.b3log.org/version/liandi").
		Set("User-Agent", UserAgent).Timeout(3 * time.Second).EndStruct(&result)
	if nil != errs {
		Logger.Errorf("检查版本更新失败：%s", errs)
		pushMsg(Conf.lang(8), 0)
		return
	}

	ver := result["ver"].(string)
	if ver <= Ver {
		Logger.Infof(Conf.lang(10)+" v%s", Ver)
		pushMsg(Conf.lang(10), 3000)
		return
	}

	dl := result["dl"].(string)
	Logger.Infof("需要重新下载进行升级 [dl=%s]", dl)
	pushMsg(fmt.Sprintf(Conf.lang(9), "<a href=\""+dl+"\">"+dl+"</a>"), 0)
}

func pushMsg(msg string, closeTimeout int) {
	ret := NewCmdResult("msg", 0, 0)
	ret.Msg = msg
	ret.Data = map[string]interface{}{
		"closeTimeout": closeTimeout,
	}
	Broadcast(ret.Bytes())
}
