import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

// Ollamaのデフォルトホスト
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

// ヘルスチェックエンドポイント
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname

    // ヘルスチェック
    if (pathname === '/api/ollama/health') {
      return await checkOllamaHealth()
    }

    // モデル一覧取得
    if (pathname === '/api/ollama') {
      return await getOllamaModels()
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  } catch (error) {
    console.error('Ollama API error:', error)
    return NextResponse.json(
      { error: 'Ollama API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// チャットエンドポイント
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname

    // サーバー起動
    if (pathname === '/api/ollama/start') {
      return await startOllamaServer()
    }

    // チャット
    if (pathname === '/api/ollama') {
      return await handleOllamaChat(request)
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  } catch (error) {
    console.error('Ollama API error:', error)
    return NextResponse.json(
      { error: 'Ollama API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Ollamaのヘルスチェック
async function checkOllamaHealth(): Promise<NextResponse> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      return NextResponse.json({ status: 'healthy' })
    } else {
      return NextResponse.json({ status: 'unhealthy' }, { status: 503 })
    }
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 })
  }
}

// Ollamaモデル一覧を取得
async function getOllamaModels(): Promise<NextResponse> {
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

// Ollamaサーバーを起動
async function startOllamaServer(): Promise<NextResponse> {
  try {
    // まずヘルスチェックを実行
    const healthResponse = await fetch(`${OLLAMA_HOST}/api/tags`)
    if (healthResponse.ok) {
      return NextResponse.json({ status: 'already running' })
    }

    // Ollamaプロセスを起動
    const ollamaProcess = spawn('ollama', ['serve'], {
      stdio: 'pipe',
      detached: false
    })

    // プロセスが起動するまで待機
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ollamaProcess.kill()
        reject(new Error('Ollama server startup timeout'))
      }, 10000) // 10秒タイムアウト

      ollamaProcess.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })

      // 少し待ってからヘルスチェック
      setTimeout(async () => {
        try {
          const response = await fetch(`${OLLAMA_HOST}/api/tags`)
          if (response.ok) {
            clearTimeout(timeout)
            resolve(true)
          }
        } catch (error) {
          // まだ起動していない場合は継続
        }
      }, 2000)
    })

    return NextResponse.json({ status: 'started' })
  } catch (error) {
    console.error('Failed to start Ollama server:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start Ollama server', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please ensure Ollama is installed and accessible'
      },
      { status: 500 }
    )
  }
}

// Ollamaチャットを処理
async function handleOllamaChat(request: NextRequest): Promise<NextResponse> {
  try {
    const { model, messages, stream, options } = await request.json()

    if (!model || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields: model, messages' },
        { status: 400 }
      )
    }

    const chatRequest = {
      model,
      messages,
      stream: stream || false,
      options: options || {}
    }

    if (stream) {
      // ストリーミングレスポンス
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Ollama API error: ${response.statusText}, details: ${JSON.stringify(errorData)}`)
      }

      // ストリーミングレスポンスを転送
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } else {
      // 非ストリーミングレスポンス
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Ollama API error: ${response.statusText}, details: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Ollama chat error:', error)
    return NextResponse.json(
      { 
        error: 'Chat request failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 