import { NextRequest, NextResponse } from 'next/server'
import { ContextItem } from '@/lib/context-types'
import fs from 'fs/promises'
import path from 'path'

const CONTEXT_FILE_PATH = path.join(process.cwd(), 'data', 'context.json')

// データディレクトリとファイルの初期化
async function ensureDataDirectory() {
  const dataDir = path.dirname(CONTEXT_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// コンテキストデータの読み込み
async function loadContextData(): Promise<ContextItem[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(CONTEXT_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// コンテキストデータの保存
async function saveContextData(data: ContextItem[]) {
  await ensureDataDirectory()
  await fs.writeFile(CONTEXT_FILE_PATH, JSON.stringify(data, null, 2))
}

// テキストファイルの解析
function parseTextFile(content: string, filename: string): string {
  // 基本的なテキスト解析
  const lines = content.split('\n')
  const paragraphs = lines.filter(line => line.trim().length > 0)
  return paragraphs.join('\n\n')
}

// Markdownファイルの解析
function parseMarkdownFile(content: string, filename: string): string {
  // Markdownからテキストを抽出
  const textContent = content
    .replace(/^#+\s+/gm, '') // 見出しを削除
    .replace(/\*\*(.*?)\*\*/g, '$1') // 太字を削除
    .replace(/\*(.*?)\*/g, '$1') // 斜体を削除
    .replace(/`(.*?)`/g, '$1') // インラインコードを削除
    .replace(/```[\s\S]*?```/g, '') // コードブロックを削除
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクを削除
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 画像を削除
    .trim()
  
  return textContent
}

// JSONファイルの解析
function parseJsonFile(content: string, filename: string): string {
  try {
    const json = JSON.parse(content)
    return JSON.stringify(json, null, 2)
  } catch {
    return content
  }
}

// ファイルタイプに応じた解析
function parseFileContent(content: string, filename: string): string {
  const extension = path.extname(filename).toLowerCase()
  
  switch (extension) {
    case '.md':
    case '.markdown':
      return parseMarkdownFile(content, filename)
    case '.json':
      return parseJsonFile(content, filename)
    case '.txt':
    case '.log':
    default:
      return parseTextFile(content, filename)
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string
    const url = formData.get('url') as string

    const items = await loadContextData()
    const newItems: ContextItem[] = []

    // ファイルアップロードの処理
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const content = await file.text()
          const parsedContent = parseFileContent(content, file.name)
          
          const newItem: ContextItem = {
            id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `File: ${file.name}`,
            content: parsedContent,
            type: 'documentation',
            tags: ['file-upload', file.name.split('.').pop() || 'unknown'],
            category: 'Uploaded Files',
            priority: 'medium',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relatedFiles: [file.name],
            metadata: {
              originalSize: file.size,
              fileType: file.type,
              lastModified: file.lastModified
            }
          }
          
          newItems.push(newItem)
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
        }
      }
    }

    // フォルダパスの処理
    if (folder) {
      try {
        const folderPath = path.resolve(folder)
        const files = await fs.readdir(folderPath, { withFileTypes: true })
        
        for (const file of files) {
          if (file.isFile()) {
            const filePath = path.join(folderPath, file.name)
            const content = await fs.readFile(filePath, 'utf-8')
            const parsedContent = parseFileContent(content, file.name)
            
            const newItem: ContextItem = {
              id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: `Folder: ${file.name}`,
              content: parsedContent,
              type: 'documentation',
              tags: ['folder-import', file.name.split('.').pop() || 'unknown'],
              category: 'Folder Import',
              priority: 'medium',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              relatedFiles: [filePath],
              metadata: {
                folderPath: folder,
                fileName: file.name
              }
            }
            
            newItems.push(newItem)
          }
        }
      } catch (error) {
        console.error('Error processing folder:', error)
      }
    }

    // URLの処理（既存のスクレイピング機能を使用）
    if (url) {
      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        })
        
        if (response.ok) {
          const scrapedData = await response.json()
          
          const newItem: ContextItem = {
            id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `Web: ${scrapedData.title}`,
            content: scrapedData.content,
            type: 'reference',
            tags: ['web-import', 'url'],
            category: 'Web Content',
            priority: 'medium',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relatedFiles: [url],
            metadata: {
              url: url,
              readabilityScore: scrapedData.readabilityScore,
              wordCount: scrapedData.wordCount
            }
          }
          
          newItems.push(newItem)
        }
      } catch (error) {
        console.error('Error processing URL:', error)
      }
    }

    // 新しいアイテムを保存
    items.push(...newItems)
    await saveContextData(items)

    return NextResponse.json({
      message: 'Context items created successfully',
      created: newItems.length,
      total: items.length
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
} 