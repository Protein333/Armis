import { NextRequest, NextResponse } from 'next/server'
import { ContextItem, ContextSearchFilters } from '@/lib/context-types'
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
    // ファイルが存在しない場合は空の配列を返す
    return []
  }
}

// コンテキストデータの保存
async function saveContextData(data: ContextItem[]) {
  await ensureDataDirectory()
  await fs.writeFile(CONTEXT_FILE_PATH, JSON.stringify(data, null, 2))
}

// コンテキストアイテムの検索
function filterContextItems(items: ContextItem[], filters: ContextSearchFilters): ContextItem[] {
  return items.filter(item => {
    // タイプフィルター
    if (filters.type && filters.type.length > 0 && !filters.type.includes(item.type)) {
      return false
    }

    // カテゴリフィルター
    if (filters.category && filters.category.length > 0 && !filters.category.includes(item.category)) {
      return false
    }

    // タグフィルター
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => item.tags.includes(tag))
      if (!hasMatchingTag) return false
    }

    // 優先度フィルター
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(item.priority)) {
      return false
    }

    // アクティブ状態フィルター
    if (filters.isActive !== undefined && item.isActive !== filters.isActive) {
      return false
    }

    // 検索語フィルター
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(searchTerm)
      const matchesContent = item.content.toLowerCase().includes(searchTerm)
      const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      
      if (!matchesTitle && !matchesContent && !matchesTags) {
        return false
      }
    }

    return true
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: ContextSearchFilters = {
      type: searchParams.get('type')?.split(',').filter(Boolean),
      category: searchParams.get('category')?.split(',').filter(Boolean),
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      priority: searchParams.get('priority')?.split(',').filter(Boolean),
      isActive: searchParams.get('isActive') === 'true' ? true : 
                searchParams.get('isActive') === 'false' ? false : undefined,
      searchTerm: searchParams.get('search') || undefined
    }

    const items = await loadContextData()
    const filteredItems = filterContextItems(items, filters)

    return NextResponse.json({
      items: filteredItems,
      total: filteredItems.length,
      allItems: items.length
    })
  } catch (error) {
    console.error('Error loading context data:', error)
    return NextResponse.json(
      { error: 'Failed to load context data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, tags, category, priority, relatedFiles, metadata } = body

    if (!title || !content || !type || !category || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const items = await loadContextData()
    const newItem: ContextItem = {
      id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      type,
      tags: tags || [],
      category,
      priority,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedFiles: relatedFiles || [],
      metadata: metadata || {}
    }

    items.push(newItem)
    await saveContextData(items)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating context item:', error)
    return NextResponse.json(
      { error: 'Failed to create context item' },
      { status: 500 }
    )
  }
} 