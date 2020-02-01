echo Building Kernel

go version
set GO111MODULE=on
set GOPROXY=https://goproxy.io

set GOOS=windows
set GOARCH=amd64
go build -v -o app/kernel.exe -ldflags "-s -w -H=windowsgui" ./kernel
if "%errorlevel%" == "1" goto :errorend

set GOOS=darwin
set GOARCH=amd64
go build -v -o app/kernel-darwin -ldflags "-s -w" ./kernel
if "%errorlevel%" == "1" goto :errorend

set GOOS=linux
set GOARCH=amd64
go build -v -o app/kernel-linux -ldflags "-s -w" ./kernel
if "%errorlevel%" == "1" goto :errorend

echo Building UI
cd app
node -v
call npm -v
call npm install && npm run build
cd ..

:errorend
echo "Error in go build"
