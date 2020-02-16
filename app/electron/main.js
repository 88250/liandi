const {app, BrowserWindow, shell, Menu, globalShortcut, ipcMain} = require('electron')
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
  const mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      webviewTag: true,
    },
    frame: process.platform === 'darwin',
    titleBarStyle: 'hidden',
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 加载index.html文件
  mainWindow.loadFile('../public/index.html')

  // 当前页面链接使用浏览器打开
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.endsWith('public/index.html')) {
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

  // 页面加载完成时，清空搜索
  mainWindow.webContents.on('did-finish-load', async () => {
    mainWindow.webContents.stopFindInPage('keepSelection')
  })

  // editor webview 发送给主线程，再由主线程发送给主页面进行保存
  ipcMain.on('liandi-websocket-put', (event, options) => {
    mainWindow.webContents.send('liandi-websocket-put', options)
  })

  // editor webview 发送给主线程，再由主线程发送给主页面进 double shift
  ipcMain.on('liandi-search-open', () => {
    mainWindow.webContents.send('liandi-search-open')
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({mode: 'bottom'})
  } else {
    createMenu()
  }

  mainWindow.on('blur',() => {
    globalShortcut.unregisterAll()
  })

  mainWindow.on('focus',() => {
    registerShortcut(mainWindow)
  })
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

const registerShortcut = (mainWindow) => {
  globalShortcut.register('CommandOrControl+F', () => {
    mainWindow.webContents.send('liandi-find-show')
  })

  globalShortcut.register('CommandOrControl+S', () => {
    mainWindow.webContents.send('liandi-editor-save')
  })
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

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// 在编辑器内打开链接的处理
app.on('web-contents-created', (webContentsCreatedEvent, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('new-window', (newWindowEvent, url) => {
      newWindowEvent.preventDefault();
      shell.openExternal(url);
    });
  }
});