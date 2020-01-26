const { app, BrowserWindow } = require('electron')
function createWindow () {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载index.html文件
  win.loadFile('../public/index.html')
}

app.on('ready', createWindow)
