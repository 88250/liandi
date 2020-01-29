#!/bin/bash

export GO111MODULE=on
export GOPROXY=https://goproxy.io
echo Building Kernel
export GOOS=windows
export GOARCH=amd64
go version
go build -v -o electron/kernel.exe -ldflags "-s -w -H=windowsgui"

export GOOS=darwin
export GOARCH=amd64
go build -v -o electron/kernel -ldflags "-s -w"

echo Building UI
cd electron
node -v
npm -v
npm install && npm run build
cd ..
