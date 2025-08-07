const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // メインウィンドウを作成
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false
  })

  // ウィンドウが準備できたときに表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 開発環境ではローカルサーバー、本番環境では静的ファイルを読み込み
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    // 開発ツールを開く
    mainWindow.webContents.openDevTools()
  } else {
    // 静的ファイルのパスを正しく設定
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('Loading static file:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    // アプリケーションを終了
    app.quit()
  })

  return mainWindow
}

// アプリケーションが準備できたときにウィンドウを作成
app.whenReady().then(() => {
  createWindow()

  // macOSでは、ドックアイコンがクリックされたときにウィンドウを再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// すべてのウィンドウが閉じられたときにアプリケーションを終了
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// セキュリティ設定
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    // 新しいウィンドウを開く代わりに、デフォルトブラウザで開く
    require('electron').shell.openExternal(navigationUrl)
  })
})

// メニューの設定
const template = [
  {
    label: 'ファイル',
    submenu: [
      {
        label: '終了',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  },
  {
    label: '編集',
    submenu: [
      { role: 'undo', label: '元に戻す' },
      { role: 'redo', label: 'やり直し' },
      { type: 'separator' },
      { role: 'cut', label: '切り取り' },
      { role: 'copy', label: 'コピー' },
      { role: 'paste', label: '貼り付け' },
      { role: 'selectall', label: 'すべて選択' }
    ]
  },
  {
    label: '表示',
    submenu: [
      { role: 'reload', label: '再読み込み' },
      { role: 'forceReload', label: '強制再読み込み' },
      { role: 'toggleDevTools', label: '開発者ツール' },
      { type: 'separator' },
      { role: 'resetZoom', label: '実際のサイズ' },
      { role: 'zoomIn', label: '拡大' },
      { role: 'zoomOut', label: '縮小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'フルスクリーン' }
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      { role: 'minimize', label: '最小化' },
      { role: 'close', label: '閉じる' }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about', label: `${app.getName()}について` },
      { type: 'separator' },
      { role: 'services', label: 'サービス' },
      { type: 'separator' },
      { role: 'hide', label: `${app.getName()}を隠す` },
      { role: 'hideothers', label: '他を隠す' },
      { role: 'unhide', label: 'すべてを表示' },
      { type: 'separator' },
      { role: 'quit', label: `${app.getName()}を終了` }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu) 