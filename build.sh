#!/bin/bash

export GO111MODULE=on
export GOPROXY=https://goproxy.io
echo Building Kernel
export GOOS=windows
export GOARCH=amd64
go version
go build -v -o app/kernel.exe -ldflags "-s -w -H=windowsgui"

export GOOS=darwin
export GOARCH=amd64
go build -v -o app/kernel -ldflags "-s -w"

echo Building UI
cd app
node -v
npm -v
npm install && npm run build
cd ..
