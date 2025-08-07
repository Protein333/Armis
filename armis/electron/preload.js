const { contextBridge, ipcRenderer } = require('electron')

// レンダラープロセスで使用可能なAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイルシステム関連
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // ウィンドウ関連
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // システム情報
  getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
  getVersion: () => ipcRenderer.invoke('system:getVersion'),
  
  // 通知
  showNotification: (title, body) => ipcRenderer.invoke('notification:show', title, body),
  
  // メニュー
  showContextMenu: (template) => ipcRenderer.invoke('menu:showContext', template)
})

// セキュリティのため、Node.jsのAPIは直接公開しない
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
}) 