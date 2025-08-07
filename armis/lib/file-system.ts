import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  language?: string
  content?: string
  isOpen?: boolean
  isModified?: boolean
  size?: number
  lastModified?: Date
  isHidden?: boolean
  isReadOnly?: boolean
}

export interface FileSystemEvent {
  type: 'create' | 'update' | 'delete' | 'rename'
  path: string
  oldPath?: string
  node?: FileNode
}

export interface FileSystemWatcher {
  id: string
  path: string
  callback: (event: FileSystemEvent) => void
}

export class FileSystemManager {
  private rootPath: string
  private fileTree: FileNode[] = []
  private watchers: FileSystemWatcher[] = []
  private openFiles: Set<string> = new Set()
  private modifiedFiles: Set<string> = new Set()

  constructor(rootPath: string = '/') {
    this.rootPath = rootPath
  }

  // ファイルツリーの構築
  async buildFileTree(directoryPath: string = this.rootPath): Promise<FileNode[]> {
    try {
      const nodes: FileNode[] = []
      const entries = await this.readDirectory(directoryPath)
      
      for (const entry of entries) {
        const fullPath = path.join(directoryPath, entry.name)
        const node: FileNode = {
          id: uuidv4(),
          name: entry.name,
          type: entry.isDirectory ? 'folder' : 'file',
          path: fullPath,
          isOpen: false,
          isModified: false,
          size: entry.size,
          lastModified: entry.mtime,
          isHidden: entry.name.startsWith('.'),
          isReadOnly: !entry.isWritable,
          language: this.getLanguageFromPath(entry.name)
        }

        if (entry.isDirectory) {
          node.children = await this.buildFileTree(fullPath)
        }

        nodes.push(node)
      }

      return nodes.sort((a, b) => {
        // フォルダーを先に、ファイルを後に
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    } catch (error) {
      console.error('Error building file tree:', error)
      return []
    }
  }

  // ファイルの作成
  async createFile(filePath: string, content: string = ''): Promise<FileNode> {
    const node: FileNode = {
      id: uuidv4(),
      name: path.basename(filePath),
      type: 'file',
      path: filePath,
      content,
      language: this.getLanguageFromPath(filePath),
      isModified: false,
      lastModified: new Date()
    }

    this.fileTree = this.addNodeToTree(this.fileTree, node, path.dirname(filePath))
    this.notifyWatchers({ type: 'create', path: filePath, node })
    
    return node
  }

  // フォルダーの作成
  async createFolder(folderPath: string): Promise<FileNode> {
    const node: FileNode = {
      id: uuidv4(),
      name: path.basename(folderPath),
      type: 'folder',
      path: folderPath,
      children: [],
      isOpen: false,
      lastModified: new Date()
    }

    this.fileTree = this.addNodeToTree(this.fileTree, node, path.dirname(folderPath))
    this.notifyWatchers({ type: 'create', path: folderPath, node })
    
    return node
  }

  // ファイルの削除
  async deleteFile(filePath: string): Promise<boolean> {
    this.fileTree = this.removeNodeFromTree(this.fileTree, filePath)
    this.openFiles.delete(filePath)
    this.modifiedFiles.delete(filePath)
    this.notifyWatchers({ type: 'delete', path: filePath })
    return true
  }

  // ファイルの名前変更
  async renameFile(oldPath: string, newPath: string): Promise<boolean> {
    const node = this.findNodeByPath(this.fileTree, oldPath)
    if (!node) return false

    const oldName = node.name
    const newName = path.basename(newPath)
    
    node.name = newName
    node.path = newPath
    node.language = this.getLanguageFromPath(newPath)

    this.notifyWatchers({ 
      type: 'rename', 
      path: newPath, 
      oldPath,
      node 
    })

    return true
  }

  // ファイルの内容更新
  async updateFileContent(filePath: string, content: string): Promise<boolean> {
    const node = this.findNodeByPath(this.fileTree, filePath)
    if (!node || node.type !== 'file') return false

    node.content = content
    node.isModified = true
    node.lastModified = new Date()
    this.modifiedFiles.add(filePath)

    this.notifyWatchers({ type: 'update', path: filePath, node })
    return true
  }

  // ファイルを開く
  openFile(filePath: string): void {
    this.openFiles.add(filePath)
  }

  // ファイルを閉じる
  closeFile(filePath: string): void {
    this.openFiles.delete(filePath)
  }

  // ファイルの保存
  async saveFile(filePath: string): Promise<boolean> {
    const node = this.findNodeByPath(this.fileTree, filePath)
    if (!node || node.type !== 'file') return false

    node.isModified = false
    this.modifiedFiles.delete(filePath)
    return true
  }

  // ファイルの検索
  searchFiles(query: string, options: {
    caseSensitive?: boolean
    includeHidden?: boolean
    fileTypes?: string[]
  } = {}): FileNode[] {
    const results: FileNode[] = []
    const searchRegex = new RegExp(
      options.caseSensitive ? query : query.toLowerCase()
    )

    const searchInTree = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (!options.includeHidden && node.isHidden) continue
        
        if (options.fileTypes && node.type === 'file') {
          const ext = path.extname(node.name).toLowerCase()
          if (!options.fileTypes.includes(ext)) continue
        }

        const searchText = options.caseSensitive ? node.name : node.name.toLowerCase()
        if (searchRegex.test(searchText)) {
          results.push(node)
        }

        if (node.children) {
          searchInTree(node.children)
        }
      }
    }

    searchInTree(this.fileTree)
    return results
  }

  // ファイルツリーの取得
  getFileTree(): FileNode[] {
    return this.fileTree
  }

  // 開いているファイルの取得
  getOpenFiles(): string[] {
    return Array.from(this.openFiles)
  }

  // 変更されたファイルの取得
  getModifiedFiles(): string[] {
    return Array.from(this.modifiedFiles)
  }

  // ファイルシステムの監視
  watchDirectory(dirPath: string, callback: (event: FileSystemEvent) => void): string {
    const watcherId = uuidv4()
    this.watchers.push({ id: watcherId, path: dirPath, callback })
    return watcherId
  }

  // 監視の停止
  unwatchDirectory(watcherId: string): void {
    this.watchers = this.watchers.filter(w => w.id !== watcherId)
  }

  // 言語の判定
  private getLanguageFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.json': 'json',
      '.md': 'markdown',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.sql': 'sql',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.toml': 'toml',
      '.ini': 'ini',
      '.sh': 'shell',
      '.bat': 'batch',
      '.ps1': 'powershell'
    }
    return languageMap[ext] || 'plaintext'
  }

  // ノードの検索
  private findNodeByPath(nodes: FileNode[], targetPath: string): FileNode | null {
    for (const node of nodes) {
      if (node.path === targetPath) return node
      if (node.children) {
        const found = this.findNodeByPath(node.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  // ツリーへのノード追加
  private addNodeToTree(nodes: FileNode[], newNode: FileNode, parentPath: string): FileNode[] {
    if (parentPath === this.rootPath || parentPath === '.') {
      return [...nodes, newNode]
    }

    return nodes.map(node => {
      if (node.path === parentPath && node.type === 'folder') {
        return { ...node, children: [...(node.children || []), newNode] }
      }
      if (node.children) {
        return { ...node, children: this.addNodeToTree(node.children, newNode, parentPath) }
      }
      return node
    })
  }

  // ツリーからのノード削除
  private removeNodeFromTree(nodes: FileNode[], targetPath: string): FileNode[] {
    return nodes.filter(node => {
      if (node.path === targetPath) return false
      if (node.children) {
        node.children = this.removeNodeFromTree(node.children, targetPath)
      }
      return true
    })
  }

  // ディレクトリの読み取り（モック実装）
  private async readDirectory(dirPath: string): Promise<Array<{
    name: string
    isDirectory: boolean
    size: number
    mtime: Date
    isWritable: boolean
  }>> {
    // 実際の実装では、Node.jsのfsモジュールを使用
    // ここではモックデータを返す
    return [
      { name: 'src', isDirectory: true, size: 0, mtime: new Date(), isWritable: true },
      { name: 'public', isDirectory: true, size: 0, mtime: new Date(), isWritable: true },
      { name: 'package.json', isDirectory: false, size: 1024, mtime: new Date(), isWritable: true },
      { name: 'README.md', isDirectory: false, size: 2048, mtime: new Date(), isWritable: true }
    ]
  }

  // 監視者への通知
  private notifyWatchers(event: FileSystemEvent): void {
    this.watchers.forEach(watcher => {
      if (event.path.startsWith(watcher.path)) {
        watcher.callback(event)
      }
    })
  }
} 