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
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/88250/gulu"
	"github.com/parnurzeal/gorequest"
)

func checkUpdatePeriodically() {
	go func() {
		for range time.Tick(time.Minute * 30) {
			checkUpdate(false)
		}
	}()
}

var checkUpdateLock = &sync.Mutex{}

func checkUpdate(now bool) {
	defer gulu.Panic.Recover(nil)
	checkUpdateLock.Lock()
	defer checkUpdateLock.Unlock()

	if !now {
		time.Sleep(16 * time.Second)
	}
	Logger.Info("开始检查更新")

	kernel := "kernel"
	newkernel := "newkernel"
	if gulu.OS.IsLinux() {
		kernel += "-linux"
		newkernel += "-linux"
	} else if gulu.OS.IsDarwin() {
		kernel += "-darwin"
		newkernel += "-darwin"
	} else {
		kernel += ".exe"
		newkernel += ".exe"
	}

	newkernel = filepath.Join(LianDiDir, newkernel)
	if gulu.File.IsExist(newkernel) {
		pushMsg(fmt.Sprintf(Conf.lang(10)))
		return
	}

	result := map[string]interface{}{}
	request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	_, _, errs := request.Get("https://rhythm.b3log.org/version/liandi").
		Set("User-Agent", UserAgent).Timeout(3 * time.Second).EndStruct(&result)
	if nil != errs {
		Logger.Errorf("检查版本更新失败：%s", errs)
		pushMsg(Conf.lang(8))
		return
	}

	ver := result["ver"].(string)
	if ver <= Ver {
		pushMsg(fmt.Sprintf(Conf.lang(10)))
		return
	}

	dl := result["dl"].(string)
	upgrade := result["upgrade"].(bool)
	if upgrade {
		Logger.Infof("需要重新下载进行升级 [dl=%s]", dl)
		pushMsg(fmt.Sprintf(Conf.lang(9), dl))
		return
	}

	dl = strings.ReplaceAll(dl, "{os}", runtime.GOOS)
	request = gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	resp, data, errs := request.Get(dl).Set("User-Agent", UserAgent).Timeout(3 * time.Minute).EndBytes()
	if nil != errs {
		Logger.Errorf("下载更新包 [%s] 失败：%s", dl, errs)
		pushMsg(Conf.lang(11))
		return
	}
	if http.StatusOK != resp.StatusCode {
		Logger.Errorf("下载更新包 [%s] 失败 [sc=%d]", dl, resp.StatusCode)
		pushMsg(Conf.lang(11))
		return
	}

	file, err := ioutil.TempFile("", "liandi-*.zip")
	if nil != err {
		Logger.Errorf("创建更新包临时文件失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	if _, err = file.Write(data); nil != err {
		Logger.Errorf("写入更新包临时文件失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}
	file.Close()

	updateDir := filepath.Join(LianDiDir, "update")
	if gulu.File.IsExist(updateDir) {
		if err = os.RemoveAll(updateDir); nil != err {
			Logger.Errorf("清空更新包解压目录失败：%s", err)
			pushMsg(Conf.lang(11))
			return
		}
	}
	if err = os.MkdirAll(updateDir, 0644); nil != err {
		Logger.Errorf("创建更新包解压目录失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	if err = gulu.Zip.Unzip(file.Name(), updateDir); nil != err {
		Logger.Errorf("解压更新包失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	if err = os.Rename(filepath.Join(updateDir, kernel), newkernel); nil != err {
		Logger.Errorf("安装新内核失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	if err = os.Rename(filepath.Join(updateDir, "ui"), filepath.Join(LianDiDir, "newui")); nil != err {
		Logger.Errorf("安装新界面失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	if err = os.RemoveAll(updateDir); nil != err {
		Logger.Errorf("清理更新包目录失败：%s", err)
		pushMsg(Conf.lang(11))
		return
	}

	Logger.Infof("安装更新包 [%s] 成功", dl)
	pushMsg(fmt.Sprintf(Conf.lang(10)))
	return
}

func pushMsg(msg string) {
	ret := NewCmdResult("msg", 0)
	ret.Msg = msg
	Push(ret.Bytes())
}
