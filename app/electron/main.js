const {app, BrowserWindow, shell, Menu, globalShortcut, screen, nativeTheme, ipcMain} = require(
  'electron')
const {spawn} = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')
process.noAsar = true
const homedir = os.homedir()
const liandi = path.join(homedir, '.liandi')
const appDir = path.dirname(app.getAppPath())
const getKernelName = () => {
  let ret = 'kernel.exe'
  if (process.platform === 'darwin') {
    ret = 'kernel-darwin'
  } else if (process.platform === 'linux') {
    ret = 'kernel-linux'
  }
  return ret
}
const kernelName = getKernelName()
const isDevEnv = process.env.NODE_ENV === 'development'

const createWindow = () => {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    show: false,
    width: screen.getPrimaryDisplay().size.width * 0.8,
    height: screen.getPrimaryDisplay().workAreaSize.height * 0.8,
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

  if (isDevEnv) {
    // 加载主界面
    mainWindow.loadFile(path.join(appDir, 'public/index.html'))
    // 打开调试器
    mainWindow.webContents.openDevTools({mode: 'bottom'})
  } else {
    // 加载主界面
    mainWindow.loadFile('../public/index.html')
    // 菜单
    const productName = '链滴笔记'
    const template = [
      {
        label: productName,
        submenu: [
          {
            label: `About ${productName}`,
            role: 'about',
          },
          {type: 'separator'},
          {role: 'services'},
          {type: 'separator'},
          {
            label: `Hide ${productName}`,
            role: 'hide',
          },
          {role: 'hideOthers'},
          {role: 'unhide'},
          {type: 'separator'},
          {
            label: `Quit ${productName}`,
            role: 'quit',
          },
        ],
      },
      {role: 'editMenu'},
      {
        role: 'windowMenu',
        submenu: [
          {role: 'minimize'},
          {role: 'zoom'},
          {role: 'togglefullscreen'},
          {role: 'close'},
          {type: 'separator'},
          {role: 'toggledevtools'},
          {type: 'separator'},
          {role: 'front'},
        ],
      },
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  // 当前页面链接使用浏览器打开
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.endsWith('public/index.html')) {
      return
    }
    event.preventDefault()
    shell.openExternal(url)
  })

  // 快捷键
  mainWindow.on('blur', () => {
    globalShortcut.unregisterAll()
  })

  mainWindow.on('focus', () => {
    globalShortcut.register('CommandOrControl+F', () => {
      mainWindow.webContents.send('liandi-find-show')
    })

    globalShortcut.register('CommandOrControl+S', () => {
      mainWindow.webContents.send('liandi-editor-save')
    })
  })

  // 全局对象
  global.liandiEditor = {
    editorText: '',
    saved: true,
  }

  // 监听主题切换
  ipcMain.on('liandi-config-theme', (event, theme) => {
    nativeTheme.themeSource = theme;
  })
}

const startKernel = () => {
  kernelPath = path.join('..', kernelName)
  if (isDevEnv) {
    kernelPath = path.join('..', 'kernel', kernelName)
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

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// 在编辑器内打开链接的处理
app.on('web-contents-created', (webContentsCreatedEvent, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('new-window', (newWindowEvent, url) => {
      newWindowEvent.preventDefault()
      shell.openExternal(url)
    })
  }
})
