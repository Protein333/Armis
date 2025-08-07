import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'

// Ollamaのデフォルトホスト
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

export async function POST(request: NextRequest) {
  try {
    // まずヘルスチェックを実行
    try {
      const healthResponse = await fetch(`${OLLAMA_HOST}/api/tags`)
      if (healthResponse.ok) {
        return NextResponse.json({ 
          status: 'already running',
          message: 'Ollama server is already running'
        })
      }
    } catch (error) {
      // サーバーが起動していない場合は続行
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
      }, 15000) // 15秒タイムアウト

      ollamaProcess.on('error', (error) => {
        clearTimeout(timeout)
        reject(new Error(`Failed to start Ollama process: ${error.message}`))
      })

      ollamaProcess.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout)
          reject(new Error(`Ollama process exited with code ${code}`))
        }
      })

      // 定期的にヘルスチェック
      const checkInterval = setInterval(async () => {
        try {
          const response = await fetch(`${OLLAMA_HOST}/api/tags`)
          if (response.ok) {
            clearTimeout(timeout)
            clearInterval(checkInterval)
            resolve(true)
          }
        } catch (error) {
          // まだ起動していない場合は継続
        }
      }, 1000) // 1秒ごとにチェック

      // タイムアウト時にインターバルをクリア
      setTimeout(() => {
        clearInterval(checkInterval)
      }, 15000)
    })

    return NextResponse.json({ 
      status: 'started',
      message: 'Ollama server started successfully'
    })
  } catch (error) {
    console.error('Failed to start Ollama server:', error)
    
    let errorMessage = 'Failed to start Ollama server'
    let suggestion = 'Please ensure Ollama is installed and accessible'
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        errorMessage = 'Ollama is not installed'
        suggestion = 'Please install Ollama from https://ollama.ai'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Ollama server startup timeout'
        suggestion = 'Please check if Ollama is properly installed and try again'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion
      },
      { status: 500 }
    )
  }
} 