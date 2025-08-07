import { NextRequest, NextResponse } from 'next/server'
import { ContextItem, ContextCategory, ContextExport } from '@/lib/context-types'
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

export async function GET() {
  try {
    const items = await loadContextData()
    
    // カテゴリの統計を計算
    const categoryStats: Record<string, number> = {}
    items.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1
    })

    const categories: ContextCategory[] = Object.entries(categoryStats).map(([name, count]) => ({
      id: name,
      name,
      description: `${count} items`,
      color: '#3b82f6',
      icon: 'folder',
      itemCount: count
    }))

    const exportData: ContextExport = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      items,
      categories
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting context data:', error)
    return NextResponse.json(
      { error: 'Failed to export context data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, categories }: ContextExport = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid export data format' },
        { status: 400 }
      )
    }

    // 既存のデータとマージ
    const existingItems = await loadContextData()
    const existingIds = new Set(existingItems.map(item => item.id))
    
    // 新しいアイテムのみを追加（ID重複を避ける）
    const newItems = items.filter(item => !existingIds.has(item.id))
    const mergedItems = [...existingItems, ...newItems]

    await saveContextData(mergedItems)

    return NextResponse.json({
      message: 'Context data imported successfully',
      imported: newItems.length,
      total: mergedItems.length
    })
  } catch (error) {
    console.error('Error importing context data:', error)
    return NextResponse.json(
      { error: 'Failed to import context data' },
      { status: 500 }
    )
  }
} 