set GO111MODULE=on
set GOPROXY=https://goproxy.io
echo 构建内核
set GOOS=windows
set GOARCH=amd64
go version
go build -v -o app/kernel.exe -ldflags "-s -w -H=windowsgui"
if "%errorlevel%" == "1" goto :errorend

set GOOS=darwin
set GOARCH=amd64
go build -v -o app/kernel -ldflags "-s -w"
if "%errorlevel%" == "1" goto :errorend

echo 构建界面
cd app
node -v
call npm -v
call npm install && npm run build
cd ..

:errorend
echo "Error in go build"
