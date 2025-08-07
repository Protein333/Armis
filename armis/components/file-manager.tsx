"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Folder, 
  File, 
  Search, 
  Settings, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  FolderOpen,
  FileText,
  Code,
  Image,
  Video,
  Music,
  Archive,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  FilePlus,
  FolderPlus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileItem[]
  isOpen?: boolean
  isEditing?: boolean
}

interface FileManagerProps {
  files?: FileItem[]
  onFileSelect?: (file: FileItem) => void
  onFileCreate?: (parentPath: string, name: string, type: 'file' | 'folder') => void
  onFileDelete?: (fileId: string) => void
  onFileRename?: (fileId: string, newName: string) => void
}

const defaultFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    isOpen: true,
    children: [
      {
        id: '1-1',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        isOpen: true,
        children: [
          { id: '1-1-1', name: 'ai-chat.tsx', type: 'file', path: '/src/components/ai-chat.tsx' },
          { id: '1-1-2', name: 'simple-editor.tsx', type: 'file', path: '/src/components/simple-editor.tsx' },
          { id: '1-1-3', name: 'file-explorer.tsx', type: 'file', path: '/src/components/file-explorer.tsx' }
        ]
      },
      {
        id: '1-2',
        name: 'pages',
        type: 'folder',
        path: '/src/pages',
        isOpen: false,
        children: [
          { id: '1-2-1', name: 'index.tsx', type: 'file', path: '/src/pages/index.tsx' }
        ]
      },
      { id: '1-3', name: 'styles.css', type: 'file', path: '/src/styles.css' }
    ]
  },
  {
    id: '2',
    name: 'public',
    type: 'folder',
    path: '/public',
    isOpen: false,
    children: [
      { id: '2-1', name: 'icon.png', type: 'file', path: '/public/icon.png' },
      { id: '2-2', name: 'favicon.ico', type: 'file', path: '/public/favicon.ico' }
    ]
  },
  { id: '3', name: 'package.json', type: 'file', path: '/package.json' },
  { id: '4', name: 'README.md', type: 'file', path: '/README.md' }
]

export function FileManager({ 
  files = defaultFiles, 
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename 
}: FileManagerProps) {
  const [fileTree, setFileTree] = useState<FileItem[]>(files)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [contextMenuFile, setContextMenuFile] = useState<FileItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<'file' | 'folder'>('file')
  const [createName, setCreateName] = useState("")
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // ファイルツリーの更新関数
  const updateFileTree = (items: FileItem[], updater: (item: FileItem) => FileItem): FileItem[] => {
    return items.map(item => {
      const updatedItem = updater(item)
      if (updatedItem.children) {
        updatedItem.children = updateFileTree(updatedItem.children, updater)
      }
      return updatedItem
    })
  }

  // ファイルツリー内のアイテムを検索
  const findFileById = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findFileById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  // フォルダの開閉
  const toggleFolder = (fileId: string) => {
    setFileTree(prev => updateFileTree(prev, item => 
      item.id === fileId ? { ...item, isOpen: !item.isOpen } : item
    ))
  }

  // ファイルアイコンの取得
  const getFileIcon = (fileName: string, type: 'file' | 'folder') => {
    if (type === 'folder') {
      return <Folder className="h-4 w-4 text-blue-600" />
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return <Code className="h-4 w-4 text-blue-500" />
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="h-4 w-4 text-pink-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4 text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-4 w-4 text-purple-500" />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="h-4 w-4 text-yellow-500" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-4 w-4 text-orange-500" />
      default:
        return <File className="h-4 w-4 text-gray-600" />
    }
  }

  // ファイル作成
  const handleCreateFile = () => {
    if (!createName.trim()) return

    const newId = Date.now().toString()
    const parentPath = contextMenuFile?.path || '/'
    const newPath = `${parentPath}/${createName}`
    
    const newItem: FileItem = {
      id: newId,
      name: createName,
      type: createType,
      path: newPath,
      children: createType === 'folder' ? [] : undefined
    }

    if (contextMenuFile) {
      // 特定のフォルダ内に作成
      setFileTree(prev => updateFileTree(prev, item => {
        if (item.id === contextMenuFile.id) {
          return {
            ...item,
            children: [...(item.children || []), newItem],
            isOpen: true
          }
        }
        return item
      }))
    } else {
      // ルートに作成
      setFileTree(prev => [...prev, newItem])
    }

    onFileCreate?.(parentPath, createName, createType)
    setIsCreateDialogOpen(false)
    setCreateName("")
    setContextMenuFile(null)
  }

  // ファイル削除
  const handleDeleteFile = (fileId: string) => {
    setFileTree(prev => prev.filter(item => item.id !== fileId))
    onFileDelete?.(fileId)
    if (selectedFile === fileId) {
      setSelectedFile(null)
    }
  }

  // ファイルリネーム開始
  const startRename = (fileId: string, currentName: string) => {
    setEditingFile(fileId)
    setEditName(currentName)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // ファイルリネーム完了
  const finishRename = () => {
    if (!editingFile || !editName.trim()) return

    setFileTree(prev => updateFileTree(prev, item => 
      item.id === editingFile ? { ...item, name: editName } : item
    ))
    
    onFileRename?.(editingFile, editName)
    setEditingFile(null)
    setEditName("")
  }

  // リフレッシュ
  const handleRefresh = () => {
    // 実際のアプリケーションでは、ファイルシステムから最新の状態を取得
    console.log('Refreshing file tree...')
  }

  // ファイルツリーのレンダリング
  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(item => (
      <ContextMenu key={item.id}>
        <ContextMenuTrigger>
          <div
            className={`flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer text-gray-900 ${
              selectedFile === item.id ? 'bg-blue-100' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id)
              } else {
                setSelectedFile(item.id)
                onFileSelect?.(item)
              }
            }}
            onDoubleClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id)
              } else {
                setSelectedFile(item.id)
                onFileSelect?.(item)
              }
            }}
          >
            {item.type === 'folder' ? (
              <div className="flex items-center">
                {item.isOpen ? (
                  <ChevronDown className="h-3 w-3 text-gray-600 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-600 mr-1" />
                )}
                {item.isOpen ? (
                  <FolderOpen className="h-4 w-4 text-blue-600 mr-2" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-600 mr-2" />
                )}
              </div>
            ) : (
              <div className="w-6 mr-2 flex justify-center">
                {getFileIcon(item.name, item.type)}
              </div>
            )}
            
            {editingFile === item.id ? (
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename()
                  if (e.key === 'Escape') {
                    setEditingFile(null)
                    setEditName("")
                  }
                }}
                className="h-6 text-sm text-gray-900"
                autoFocus
              />
            ) : (
              <span className="text-sm truncate flex-1 text-gray-900">{item.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onFileSelect?.(item)}>
            Open
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => startRename(item.id, item.name)}>
            <Edit className="h-4 w-4 mr-2 text-gray-700" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => {
              setContextMenuFile(item)
              setCreateType('file')
              setIsCreateDialogOpen(true)
            }}
          >
            <FilePlus className="h-4 w-4 mr-2 text-gray-700" />
            New File
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => {
              setContextMenuFile(item)
              setCreateType('folder')
              setIsCreateDialogOpen(true)
            }}
          >
            <FolderPlus className="h-4 w-4 mr-2 text-gray-700" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => handleDeleteFile(item.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ))
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="New File/Folder"
              >
                <Plus className="h-3 w-3 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => {
                  setContextMenuFile(null)
                  setCreateType('file')
                  setIsCreateDialogOpen(true)
                }}
              >
                <FilePlus className="h-4 w-4 mr-2 text-gray-700" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setContextMenuFile(null)
                  setCreateType('folder')
                  setIsCreateDialogOpen(true)
                }}
              >
                <FolderPlus className="h-4 w-4 mr-2 text-gray-700" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Refresh"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3 w-3 text-gray-700" />
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              title="More Options"
            >
              <MoreHorizontal className="h-3 w-3 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2 text-gray-700" />
              Refresh
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2 text-gray-700" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-8 h-8 text-xs text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-xs text-gray-700">
          <span>Files: {fileTree.length}</span>
          <span>{selectedFile ? 'Selected' : 'No selection'}</span>
        </div>
      </div>

      {/* Create File/Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {createType === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
            <DialogDescription>
              {contextMenuFile 
                ? `Create a new ${createType} in "${contextMenuFile.name}"`
                : `Create a new ${createType} in the root directory`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`Enter ${createType} name...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setIsCreateDialogOpen(false)
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!createName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 