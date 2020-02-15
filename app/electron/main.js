const {app, BrowserWindow, shell, ipcMain, Menu} = require('electron')
const {spawn} = require('child_process')
const path = require('path')

const createMenu = () => {
  const template = [
    {
      label: '链滴笔记',
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'togglefullscreen'},
        {role: 'minimize'},
        {role: 'close'},
        {role: 'quit'},
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const createWindow = () => {
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

  // 页面加载完成时，清空搜索
  mainWindow.webContents.on('did-finish-load', async () => {
    mainWindow.webContents.stopFindInPage('keepSelection')
  })

  // 新开页面使用浏览器打开
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // 监听 findInPage 有返回值时的处理
  mainWindow.webContents.on('found-in-page', (event, result) => {
    mainWindow.webContents.send('liandi_find_result', result)
  })

  // 监听页面搜索框输入
  ipcMain.on('liandi_find_text', (event, options) => {
    const requestId = mainWindow.webContents.findInPage(options.key, {
      forward: options.forward,
      findNext: options.findNext,
    })
    console.log(requestId, {
      forward: options.forward,
      findNext: options.findNext,
    })
  })

  // 清空搜索
  ipcMain.on('liandi_find_clear', () => {
    mainWindow.webContents.stopFindInPage('keepSelection')
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({mode: 'bottom'})
  }

  createMenu()
}

const startKernel = () => {
  let fileName = 'kernel.exe'
  if (process.platform === 'darwin') {
    fileName = 'kernel-darwin'
  } else if (process.platform === 'linux') {
    fileName = 'kernel-linux'
  }

  let kernelPath = path.join(path.dirname(app.getAppPath()), fileName)
  if (process.env.NODE_ENV === 'development') {
    kernelPath = path.join('..', 'kernel', fileName)
  }
  spawn(kernelPath)
}

app.whenReady().then(() => {
  createWindow()
  startKernel()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
