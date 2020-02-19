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
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/88250/gulu"
	"github.com/parnurzeal/gorequest"
)

func checkUpdatePeriodically() {
	go checkUpdate()

	go func() {
		for range time.Tick(time.Minute * 30) {
			checkUpdate()
		}
	}()
}

func checkUpdate() {
	defer gulu.Panic.Recover(nil)

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
		return
	}

	result := map[string]interface{}{}
	request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	_, _, errs := request.Get("https://rhythm.b3log.org/version/liandi").
		Set("User-Agent", UserAgent).Timeout(3 * time.Second).EndStruct(&result)
	if nil != errs {
		Logger.Errorf("检查版本更新失败：%s", errs)
		return
	}

	ver := result["ver"].(string)
	if ver <= Ver {
		return
	}

	dl := result["dl"].(string)
	dl = strings.ReplaceAll(dl, "{os}", runtime.GOOS)
	request = gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	resp, data, errs := request.Get(dl).Set("User-Agent", UserAgent).Timeout(3 * time.Minute).EndBytes()
	if nil != errs {
		Logger.Errorf("下载更新包 [%s] 失败：%s", dl, errs)
		return
	}
	if http.StatusOK != resp.StatusCode {
		Logger.Errorf("下载更新包 [%s] 失败 [sc=%d]", dl, resp.StatusCode)
		return
	}

	file, err := ioutil.TempFile("", "liandi-*.zip")
	if nil != err {
		Logger.Errorf("创建更新包临时文件失败：%s", err)
		return
	}

	if _, err = file.Write(data); nil != err {
		Logger.Errorf("写入更新包临时文件失败：%s", err)
		return
	}
	file.Close()

	updateDir := filepath.Join(LianDiDir, "update")
	if gulu.File.IsExist(updateDir) {
		if err = os.RemoveAll(updateDir); nil != err {
			Logger.Errorf("清空更新包解压目录失败：%s", err)
			return
		}
	}
	if err = os.MkdirAll(updateDir, 0644); nil != err {
		Logger.Errorf("创建更新包解压目录失败：%s", err)
		return
	}

	if err = gulu.Zip.Unzip(file.Name(), updateDir); nil != err {
		Logger.Errorf("解压更新包失败：%s", err)
		return
	}

	if err = os.Rename(filepath.Join(updateDir, kernel), newkernel); nil != err {
		Logger.Errorf("安装新内核失败：%s", err)
		return
	}

	if err = os.Rename(filepath.Join(updateDir, "ui"), filepath.Join(LianDiDir, "newui")); nil != err {
		Logger.Errorf("安装新界面失败：%s", err)
		return
	}

	if err = os.RemoveAll(updateDir); nil != err {
		Logger.Errorf("清理更新包目录失败：%s", err)
		return
	}

	Logger.Infof("安装更新包 [%s] 成功", dl)
}
