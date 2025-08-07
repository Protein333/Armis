// モデル情報の型定義
export interface OllamaModel {
  name: string
  modified_at: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

// チャットメッセージの型定義
export interface OllamaChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// チャットリクエストの型定義
export interface OllamaChatRequest {
  model: string
  messages: OllamaChatMessage[]
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
    stop?: string[]
    seed?: number
    tfs_z?: number
    typical_p?: number
    repeat_last_n?: number
    repeat_penalty?: number
    presence_penalty?: number
    frequency_penalty?: number
    mirostat?: number
    mirostat_tau?: number
    mirostat_eta?: number
    num_ctx?: number
    num_gpu?: number
    num_thread?: number
    num_batch?: number
    num_keep?: number
  }
}

// チャットレスポンスの型定義
export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: 'assistant'
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

// クライアントサイドのOllama API
export class OllamaClient {
  private baseUrl: string

  constructor(host?: string) {
    this.baseUrl = host || '/api/ollama'
  }

  // モデル一覧を取得
  async listModels(): Promise<OllamaModel[]> {
    try {
      console.log('OllamaClient: Fetching models from:', this.baseUrl)
      
      const response = await fetch(this.baseUrl)
      console.log('OllamaClient: Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OllamaClient: Server error:', errorData)
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`)
      }
      
      const data = await response.json()
      console.log('OllamaClient: Received models:', data)
      
      return data.models || []
    } catch (error) {
      console.error('OllamaClient: Failed to list models:', error)
      throw error
    }
  }

  // チャットを送信（非ストリーミング）
  async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    try {
      console.log('OllamaClient: Sending chat request:', request)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: false,
          options: request.options
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OllamaClient: Chat server error:', errorData)
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log('OllamaClient: Chat response:', result)
      return result
    } catch (error) {
      console.error('OllamaClient: Failed to send chat:', error)
      throw error
    }
  }

  // チャットを送信（ストリーミング）
  async chatStream(
    request: OllamaChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('OllamaClient: Sending streaming chat request:', request)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
          options: request.options
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OllamaClient: Streaming chat server error:', errorData)
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`)
      }

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
              if (data.content) {
                onChunk(data.content)
              }
              if (data.done) {
                onComplete()
                return
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }

      onComplete()
    } catch (error) {
      console.error('OllamaClient: Failed to send streaming chat:', error)
      onError(error as Error)
    }
  }

  // サーバーの状態を確認
  async healthCheck(): Promise<boolean> {
    try {
      console.log('OllamaClient: Health check for:', this.baseUrl)
      
      // タイムアウトを設定してリクエスト
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒タイムアウト
      
      const response = await fetch(this.baseUrl, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const isHealthy = response.ok
      console.log('OllamaClient: Health check result:', isHealthy)
      return isHealthy
    } catch (error) {
      console.error('OllamaClient: Health check failed:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('OllamaClient: Health check timed out')
      }
      return false
    }
  }
}

// デフォルトのOllamaクライアントインスタンス
export const ollamaClientInstance = new OllamaClient()

// 便利な関数
export const ollamaAPI = {
  // モデル一覧を取得
  listModels: () => ollamaClientInstance.listModels(),
  
  // チャット（非ストリーミング）
  chat: (request: OllamaChatRequest) => ollamaClientInstance.chat(request),
  
  // チャット（ストリーミング）
  chatStream: (
    request: OllamaChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => ollamaClientInstance.chatStream(request, onChunk, onComplete, onError),
  
  // ヘルスチェック
  healthCheck: () => ollamaClientInstance.healthCheck()
} 