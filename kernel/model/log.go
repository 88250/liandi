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
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"runtime"

	"github.com/88250/gowebdav"
	"github.com/88250/gulu"
)

var (
	Logger  *gulu.Logger
	logFile *os.File
)

func InitLog() {
	if !gulu.File.IsExist(LianDiDir) {
		if err := os.Mkdir(LianDiDir, 0755); nil != err && !os.IsExist(err) {
			Logger.Fatalf("创建配置笔记本 [%s] 失败：%s", LianDiDir, err)
		}
	}

	if size := gulu.File.GetFileSize(LogPath); 1024*1024*8 <= size {
		// 日志文件大于 8M 的话删了重建
		if err := os.Remove(LogPath); nil != err {
			fmt.Errorf("删除日志文件 [%s] 失败：%s", LogPath, err)
			os.Exit(-2)
		}
	}

	var err error
	logFile, err = os.Create(LogPath)
	if nil != err {
		fmt.Errorf("创建日志文件 [%s] 失败：%s", LogPath, err)
		os.Exit(-2)
	}

	gulu.Log.SetLevel("trace")
	if "dev" == Mode {
		Logger = gulu.Log.NewLogger(io.MultiWriter(logFile, os.Stdout))
	} else {
		Logger = gulu.Log.NewLogger(logFile)
	}
	Logger.Infof("运行模式 [%s]", Mode)
	gowebdav.Logger = Logger
}

func CloseLog() {
	logFile.Close()
	os.Stdout.Close()
}

func Recover() {
	if e := recover(); nil != e {
		stack := stack()
		msg := fmt.Sprintf("PANIC RECOVERED: %v\n\t%s\n", e, stack)
		Logger.Errorf(msg)
	}
}

var (
	dunno     = []byte("???")
	centerDot = []byte("·")
	dot       = []byte(".")
	slash     = []byte("/")
)

// stack implements Stack, skipping 2 frames.
func stack() []byte {
	buf := &bytes.Buffer{} // the returned data
	// As we loop, we open files and read them. These variables record the currently
	// loaded file.
	var lines [][]byte
	var lastFile string
	for i := 2; ; i++ { // Caller we care about is the user, 2 frames up
		pc, file, line, ok := runtime.Caller(i)
		if !ok {
			break
		}
		// Print this much at least.  If we can't find the source, it won't show.
		fmt.Fprintf(buf, "%s:%d (0x%x)\n", file, line, pc)
		if file != lastFile {
			data, err := ioutil.ReadFile(file)
			if err != nil {
				continue
			}
			lines = bytes.Split(data, []byte{'\n'})
			lastFile = file
		}
		line-- // in stack trace, lines are 1-indexed but our array is 0-indexed
		fmt.Fprintf(buf, "\t%s: %s\n", function(pc), source(lines, line))
	}
	return buf.Bytes()
}

// source returns a space-trimmed slice of the n'th line.
func source(lines [][]byte, n int) []byte {
	if n < 0 || n >= len(lines) {
		return dunno
	}
	return bytes.Trim(lines[n], " \t")
}

// function returns, if possible, the name of the function containing the PC.
func function(pc uintptr) []byte {
	fn := runtime.FuncForPC(pc)
	if fn == nil {
		return dunno
	}
	name := []byte(fn.Name())
	// The name includes the path name to the package, which is unnecessary
	// since the file name is already included.  Plus, it has center dots.
	// That is, we see
	//	runtime/debug.*T·ptrmethod
	// and want
	//	*T.ptrmethod
	// Since the package path might contains dots (e.g. code.google.com/...),
	// we first remove the path prefix if there is one.
	if lastslash := bytes.LastIndex(name, slash); lastslash >= 0 {
		name = name[lastslash+1:]
	}
	if period := bytes.Index(name, dot); period >= 0 {
		name = name[period+1:]
	}
	name = bytes.Replace(name, centerDot, dot, -1)
	return name
}
