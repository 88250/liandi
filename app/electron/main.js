const {app, BrowserWindow, shell, ipcMain} = require('electron')
const {spawn} = require('child_process')
const path = require('path')

app.on('ready', () => {
  // 创建浏览器窗口
  let mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
    },
    frame: process.platform !== 'win32',
    titleBarStyle: 'hidden',
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 加载index.html文件
  mainWindow.loadFile('../public/index.html')

  // 当前页面链接使用浏览器打开
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.endsWith('liandi/app/public/index.html')) {
      return
    }
    event.preventDefault()
    shell.openExternal(url)
  })

  // 新开页面使用浏览器打开
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // 监听页面搜索框输入
  ipcMain.on('liandi_find_text', (event, options) => {
    const requestId = mainWindow.webContents.findInPage(options.key, {
      forward: options.forward,
      findNext: options.findNext
    })
    console.log(requestId, {
      forward: options.forward,
      findNext: options.findNext
    })
  })

  // 清空搜索
  ipcMain.on('liandi_find_clear', () => {
    mainWindow.webContents.stopFindInPage('keepSelection')
  })

  // 监听 findInPage 有返回值时的处理
  mainWindow.webContents.on('found-in-page', (event, result) => {
    mainWindow.webContents.send('liandi_find_result', result)
  })

  startKernel()
})


const startKernel = () => {
  let fileName = 'kernel.exe'
  if (process.platform === 'darwin') {
    fileName = 'kernel-darwin'
  } else if (process.platform === 'linux') {
    fileName = 'kernel-linux'
  }

  const kernel = spawn(path.join(path.dirname(app.getAppPath()), fileName))
  kernel.stdout.setEncoding('utf8');
  kernel.stderr.setEncoding('utf8');
  kernel.stdout.on('data', (data) => {
    console.log(`kernel stdout: ${data.toString()}`)
  })
  kernel.stderr.on('data', (data) => {
    console.log(`kernel stderr: ${data.toString()}`)
  })
  kernel.on('close', (code) => {
    console.log(`kernel close: child process exited with code ${code}`)
  })
}
