import { NextRequest, NextResponse } from 'next/server'

// Ollamaのデフォルトホスト
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

// モデル一覧取得
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// モデルプル
export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json()

    if (!model) {
      return NextResponse.json(
        { error: 'Missing required field: model' },
        { status: 400 }
      )
    }

    console.log(`Pulling Ollama model: ${model}`)

    // モデルプルリクエストを送信
    const response = await fetch(`${OLLAMA_HOST}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Ollama API error: ${response.statusText}, details: ${JSON.stringify(errorData)}`)
    }

    // プルが完了するまで待機
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.error) {
              throw new Error(data.error)
            }
            if (data.done) {
              return NextResponse.json({ 
                status: 'success',
                message: `Model ${model} pulled successfully`
              })
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }

    return NextResponse.json({ 
      status: 'success',
      message: `Model ${model} pulled successfully`
    })
  } catch (error) {
    console.error('Failed to pull Ollama model:', error)
    return NextResponse.json(
      { 
        error: 'Failed to pull model', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// モデル削除
export async function DELETE(request: NextRequest) {
  try {
    const { model } = await request.json()

    if (!model) {
      return NextResponse.json(
        { error: 'Missing required field: model' },
        { status: 400 }
      )
    }

    console.log(`Deleting Ollama model: ${model}`)

    // モデル削除リクエストを送信
    const response = await fetch(`${OLLAMA_HOST}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Ollama API error: ${response.statusText}, details: ${JSON.stringify(errorData)}`)
    }

    return NextResponse.json({ 
      status: 'success',
      message: `Model ${model} deleted successfully`
    })
  } catch (error) {
    console.error('Failed to delete Ollama model:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete model', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 