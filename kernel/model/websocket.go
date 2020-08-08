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
	"github.com/88250/gulu"
	"gopkg.in/olahol/melody.v1"
)

var sessions map[string]*melody.Session

func InitSessions() {
	sessions = map[string]*melody.Session{}
}

func AddPushChan(session *melody.Session) {
	id := gulu.Rand.String(7)
	session.Set("id", id)
	sessions[id] = session
}

func RemovePushChan(session *melody.Session) {
	id, _ := session.Get("id")
	delete(sessions, id.(string))
}

func Broadcast(msg []byte) {
	for _, session := range sessions {
		session.Write(msg)
	}
}
