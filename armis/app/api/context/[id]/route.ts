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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await loadContextData()
    const item = items.find(item => item.id === params.id)

    if (!item) {
      return NextResponse.json(
        { error: 'Context item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error loading context item:', error)
    return NextResponse.json(
      { error: 'Failed to load context item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const items = await loadContextData()
    const itemIndex = items.findIndex(item => item.id === params.id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Context item not found' },
        { status: 404 }
      )
    }

    const updatedItem: ContextItem = {
      ...items[itemIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    items[itemIndex] = updatedItem
    await saveContextData(items)

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating context item:', error)
    return NextResponse.json(
      { error: 'Failed to update context item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await loadContextData()
    const itemIndex = items.findIndex(item => item.id === params.id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Context item not found' },
        { status: 404 }
      )
    }

    const deletedItem = items[itemIndex]
    items.splice(itemIndex, 1)
    await saveContextData(items)

    return NextResponse.json({ message: 'Context item deleted successfully' })
  } catch (error) {
    console.error('Error deleting context item:', error)
    return NextResponse.json(
      { error: 'Failed to delete context item' },
      { status: 500 }
    )
  }
} 