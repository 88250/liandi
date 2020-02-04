const {app, BrowserWindow, shell} = require('electron')

function createWindow () {
  // 创建浏览器窗口
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
    // frame: false,
    // titleBarStyle: 'hidden',
  })

  // 加载index.html文件
  mainWindow.loadFile('../public/index.html')

  // 组织当前页面链接跳转
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url.endsWith('liandi/app/public/index.html')) {
      return
    }
    e.preventDefault()
    shell.openExternal(url)
  })
}

app.on('ready', createWindow)
