import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'

interface ComfyUIServer {
  process: any
  port: number
  isRunning: boolean
}

let comfyUIServer: ComfyUIServer | null = null

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'status':
      return NextResponse.json({
        isRunning: comfyUIServer?.isRunning || false,
        port: comfyUIServer?.port || 8188
      })

    case 'start':
      if (comfyUIServer?.isRunning) {
        return NextResponse.json({ 
          success: false, 
          message: 'ComfyUIサーバーは既に実行中です' 
        })
      }

      try {
        const comfyUIPath = path.join(process.cwd(), 'comfyui')
        
        // ComfyUIディレクトリが存在しない場合は作成
        if (!fs.existsSync(comfyUIPath)) {
          await fs.mkdirp(comfyUIPath)
        }

        // ComfyUIサーバーを起動
        const serverProcess = spawn('python', ['main.py'], {
          cwd: comfyUIPath,
          stdio: ['pipe', 'pipe', 'pipe']
        })

        comfyUIServer = {
          process: serverProcess,
          port: 8188,
          isRunning: true
        }

        // プロセス終了時の処理
        serverProcess.on('exit', (code) => {
          if (comfyUIServer) {
            comfyUIServer.isRunning = false
          }
        })

        return NextResponse.json({ 
          success: true, 
          message: 'ComfyUIサーバーを起動しました',
          port: 8188
        })
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          message: 'ComfyUIサーバーの起動に失敗しました',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }

    case 'stop':
      if (!comfyUIServer?.isRunning) {
        return NextResponse.json({ 
          success: false, 
          message: 'ComfyUIサーバーは実行されていません' 
        })
      }

      try {
        comfyUIServer.process.kill('SIGTERM')
        comfyUIServer.isRunning = false
        comfyUIServer = null

        return NextResponse.json({ 
          success: true, 
          message: 'ComfyUIサーバーを停止しました' 
        })
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          message: 'ComfyUIサーバーの停止に失敗しました',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }

    default:
      return NextResponse.json({ 
        success: false, 
        message: '無効なアクションです' 
      }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflow, action } = body

    if (action === 'queue') {
      // ComfyUIサーバーにワークフローを送信
      const response = await fetch(`http://localhost:8188/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: workflow })
      })

      if (!response.ok) {
        throw new Error(`ComfyUIサーバーエラー: ${response.status}`)
      }

      const result = await response.json()
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json({ 
      success: false, 
      message: '無効なアクションです' 
    }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'リクエストの処理に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 