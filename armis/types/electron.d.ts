declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string | undefined>
      saveFile: (data: any) => Promise<string | undefined>
      minimize: () => void
      maximize: () => void
      close: () => void
      getPlatform: () => Promise<string>
      getVersion: () => Promise<string>
      showNotification: (title: string, body: string) => Promise<void>
      showContextMenu: (template: any[]) => Promise<void>
    }
    versions: {
      node: () => string
      chrome: () => string
      electron: () => string
    }
  }
}

export {} 