#!/bin/bash

echo Building Kernel

go version
export GO111MODULE=on
export GOPROXY=https://goproxy.io

export GOOS=windows
export GOARCH=amd64
go build -v -o kernel/kernel.exe -ldflags "-s -w -H=windowsgui -X main.Mode=prod" ./kernel

export GOOS=darwin
export GOARCH=amd64
go build -v -o kernel/kernel-darwin -ldflags "-s -w -X main.Mode=prod" ./kernel

export GOOS=linux
export GOARCH=amd64
go build -v -o kernel/kernel-linux -ldflags "-s -w -X main.Mode=prod" ./kernel

echo Building UI
cd app
node -v
npm -v
npm install && npm run build && npm run dist
cd ..
