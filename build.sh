#!/bin/bash

echo Building Kernel

go version
export GO111MODULE=on
export GOPROXY=https://goproxy.io

export GOOS=windows
export GOARCH=amd64
go build -v -o app/kernel/kernel.exe -ldflags "-s -w -H=windowsgui" ./kernel

export GOOS=darwin
export GOARCH=amd64
go build -v -o app/kernel/kernel-darwin -ldflags "-s -w" ./kernel

export GOOS=linux
export GOARCH=amd64
go build -v -o app/kernel/kernel-linux -ldflags "-s -w" ./kernel

echo Building UI
cd app
node -v
npm -v
npm install && npm run build
cd ..
