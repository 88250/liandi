const {app, BrowserWindow, shell} = require('electron')

function createWindow () {
  // 创建浏览器窗口
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
    },
    frame: process.platform !== 'win32',
    titleBarStyle: 'hidden',
  })

  // 加载index.html文件
  mainWindow.loadFile('../public/index.html')

  // 组织当前页面链接跳转
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.endsWith('liandi/app/public/index.html')) {
      return
    }
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}

app.on('ready', createWindow)
