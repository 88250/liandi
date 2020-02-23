const {app, BrowserWindow, shell, Menu, globalShortcut, screen} = require(
  'electron')
const {spawn} = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')
process.noAsar = true
const homedir = os.homedir()
const liandi = path.join(homedir, '.liandi')
const appDir = path.dirname(app.getAppPath())
const current = path.join(liandi, 'current')
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

  // 加载主界面
  if (isDevEnv) {
    mainWindow.loadFile(path.join(appDir, 'public/index.html'))
  } else {
    mainWindow.loadFile(path.join(current, 'public/index.html'))
  }

  if (isDevEnv) {
    mainWindow.webContents.openDevTools({mode: 'bottom'})
  } else {
    const productName = "链滴笔记"
    const template = [
      {
        label: productName,
        submenu: [
          {
            label: `About ${productName}`,
            role: 'about'
          },
          {type: 'separator'},
          {role: 'services'},
          {type: 'separator'},
          {
            label: `Hide ${productName}`,
            role: 'hide'
          },
          {role: 'hideOthers'},
          {role: 'unhide'},
          {type: 'separator'},
          {
            label: `Quit ${productName}`,
            role: 'quit'
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
        ]
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

  global.liandiEditor = {
    editorText: '',
    saved: true,
  }
}

const applyUpdate = () => {
  if (isDevEnv) {
    return
  }

  if (!fs.existsSync(liandi)) { // 第一次启动
    fs.mkdirSync(liandi)
    copyDir(appDir, current)
  } else {
    const update = path.join(liandi, 'update')
    if (fs.existsSync(update)) {
      removeDir(current)
      fs.renameSync(update, current)
    }
  }
}

const startKernel = () => {
  let kernelPath = path.join(current, kernelName)
  if (isDevEnv) {
    kernelPath = path.join('..', 'kernel', kernelName)
  }
  spawn(kernelPath)
}

app.whenReady().then(() => {
  applyUpdate()
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

const removeDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    return
  }

  fs.readdirSync(dirPath).forEach((file) => {
    const curPath = path.join(dirPath, file)
    if (fs.lstatSync(curPath).isDirectory()) {
      removeDir(curPath)
    } else {
      fs.unlinkSync(curPath)
    }
  })
  fs.rmdirSync(dirPath)
}

const copyDir = function (src, dest) {
  if (!fs.existsSync(src)) {
    return
  }

  if ('.asar' === path.extname(src)) {
    return
  }

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(childItemName => {
      copyDir(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}
