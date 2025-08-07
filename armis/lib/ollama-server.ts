// Ollamaサーバー管理ユーティリティ

export interface OllamaServerStatus {
  isRunning: boolean
  isStarting: boolean
  error: string | null
  models: string[]
}

class OllamaServerManager {
  private static instance: OllamaServerManager
  private status: OllamaServerStatus = {
    isRunning: false,
    isStarting: false,
    error: null,
    models: []
  }
  private listeners: Set<(status: OllamaServerStatus) => void> = new Set()

  static getInstance(): OllamaServerManager {
    if (!OllamaServerManager.instance) {
      OllamaServerManager.instance = new OllamaServerManager()
    }
    return OllamaServerManager.instance
  }

  // ステータスリスナーを追加
  addStatusListener(listener: (status: OllamaServerStatus) => void) {
    this.listeners.add(listener)
    // 即座に現在のステータスを通知
    listener(this.status)
  }

  // ステータスリスナーを削除
  removeStatusListener(listener: (status: OllamaServerStatus) => void) {
    this.listeners.delete(listener)
  }

  // ステータスを更新してリスナーに通知
  private updateStatus(updates: Partial<OllamaServerStatus>) {
    this.status = { ...this.status, ...updates }
    this.listeners.forEach(listener => listener(this.status))
  }

  // Ollamaサーバーの状態をチェック
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch('/api/ollama/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const isRunning = response.ok
      this.updateStatus({ 
        isRunning, 
        isStarting: false,
        error: isRunning ? null : 'サーバーに接続できません'
      })
      
      return isRunning
    } catch (error) {
      console.error('Ollama server health check failed:', error)
      this.updateStatus({ 
        isRunning: false, 
        isStarting: false,
        error: 'サーバーに接続できません'
      })
      return false
    }
  }

  // Ollamaサーバーを起動
  async startServer(): Promise<boolean> {
    if (this.status.isRunning || this.status.isStarting) {
      return this.status.isRunning
    }

    this.updateStatus({ isStarting: true, error: null })

    try {
      console.log('Starting Ollama server...')
      
      // サーバー起動APIを呼び出し
      const response = await fetch('/api/ollama/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || response.statusText
        throw new Error(`Failed to start server: ${errorMessage}`)
      }

      // サーバーが起動するまで待機
      let attempts = 0
      const maxAttempts = 30 // 30秒待機
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (await this.checkServerStatus()) {
          console.log('Ollama server started successfully')
          this.updateStatus({ 
            isRunning: true, 
            isStarting: false,
            error: null
          })
          return true
        }
        
        attempts++
      }

      throw new Error('サーバーの起動がタイムアウトしました。Ollamaがインストールされているか確認してください。')
    } catch (error) {
      console.error('Failed to start Ollama server:', error)
      
      // より詳細なエラーメッセージを提供
      let errorMessage = 'サーバーの起動に失敗しました'
      if (error instanceof Error) {
        if (error.message.includes('APIキー')) {
          errorMessage = 'Gemini APIキーが設定されていません。環境変数GOOGLE_API_KEYを設定してください。'
        } else if (error.message.includes('quota')) {
          errorMessage = 'APIクォータを超過しました。しばらく待ってから再試行してください。'
        } else if (error.message.includes('billing')) {
          errorMessage = 'Gemini APIの請求が有効になっていません。Google Cloud Consoleで設定してください。'
        } else if (error.message.includes('Ollama')) {
          errorMessage = 'Ollamaがインストールされていません。https://ollama.ai からダウンロードしてください。'
        } else {
          errorMessage = error.message
        }
      }
      
      this.updateStatus({ 
        isRunning: false, 
        isStarting: false,
        error: errorMessage
      })
      return false
    }
  }

  // 利用可能なモデルを取得
  async fetchModels(): Promise<string[]> {
    try {
      const response = await fetch('/api/ollama')
      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }
      
      const data = await response.json()
      const models = data.models?.map((model: any) => model.name) || []
      
      this.updateStatus({ models })
      return models
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error)
      this.updateStatus({ models: [] })
      return []
    }
  }

  // 現在のステータスを取得
  getStatus(): OllamaServerStatus {
    return { ...this.status }
  }
}

// シングルトンインスタンスをエクスポート
export const ollamaServerManager = OllamaServerManager.getInstance()

// 便利な関数
export async function ensureOllamaServer(): Promise<boolean> {
  const manager = OllamaServerManager.getInstance()
  
  // まず現在の状態をチェック
  if (await manager.checkServerStatus()) {
    return true
  }
  
  // サーバーが起動していない場合は起動を試行
  return await manager.startServer()
}

export async function checkOllamaConnection(): Promise<boolean> {
  const manager = OllamaServerManager.getInstance()
  return await manager.checkServerStatus()
} 