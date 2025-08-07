// Gemini APIクライアント
export interface GeminiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GeminiChatRequest {
  messages: GeminiChatMessage[]
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  topK?: number
}

export interface GeminiChatResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason: string
    index: number
    safetyRatings: Array<{
      category: string
      probability: string
    }>
  }>
  promptFeedback?: {
    safetyRatings: Array<{
      category: string
      probability: string
    }>
  }
}

export class GeminiClient {
  private apiKey: string
  private baseUrl: string
  private model: string
  private isServer: boolean

  constructor(apiKey?: string, model?: string) {
    this.isServer = typeof window === 'undefined'
    // 環境変数からAPIキーを取得（GEMINI_API_KEYを優先、次にGOOGLE_API_KEY）
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
    this.baseUrl = this.isServer 
      ? 'https://generativelanguage.googleapis.com/v1beta/models'
      : '/api/gemini'
    this.model = model || 'gemini-2.0-flash-lite-001'
    
    // デバッグ情報を出力
    console.log('GeminiClient: Constructor called')
    console.log('GeminiClient: Is server:', this.isServer)
    console.log('GeminiClient: API key provided:', !!apiKey)
    console.log('GeminiClient: GEMINI_API_KEY from env:', !!process.env.GEMINI_API_KEY)
    console.log('GeminiClient: GOOGLE_API_KEY from env:', !!process.env.GOOGLE_API_KEY)
    console.log('GeminiClient: Final API key length:', this.apiKey?.length || 0)
    console.log('GeminiClient: Base URL:', this.baseUrl)
    console.log('GeminiClient: Model:', this.model)
  }

  // APIキーの有効性を確認
  private validateApiKey(): void {
    console.log('GeminiClient: Validating API key...')
    console.log('GeminiClient: Is server:', this.isServer)
    console.log('GeminiClient: API key length:', this.apiKey?.length || 0)
    
    if (this.isServer && !this.apiKey) {
      console.error('GeminiClient: API key not set')
      throw new Error('Gemini APIキーが設定されていません。GOOGLE_API_KEY環境変数を設定してください。')
    }
    if (this.isServer && this.apiKey === 'your_google_api_key_here') {
      console.error('GeminiClient: API key is placeholder value')
      throw new Error('Gemini APIキーがプレースホルダー値のままです。実際のAPIキーを設定してください。')
    }
    if (this.isServer && this.apiKey.length < 10) {
      console.error('GeminiClient: API key too short')
      throw new Error('Gemini APIキーが無効です。正しいAPIキーを設定してください。')
    }
    
    console.log('GeminiClient: API key validation passed')
  }

  // エラーメッセージを解析
  private parseErrorMessage(errorData: any): string {
    if (errorData.error?.message) {
      const message = errorData.error.message
      if (message.includes('API key')) {
        return 'Gemini APIキーが無効です。正しいAPIキーを設定してください。'
      }
      if (message.includes('quota')) {
        return 'APIクォータを超過しました。しばらく待ってから再試行してください。'
      }
      if (message.includes('billing')) {
        return 'Gemini APIの請求が有効になっていません。Google Cloud Consoleで設定してください。'
      }
      return message
    }
    return 'Gemini APIでエラーが発生しました。'
  }

  // チャットを送信（非ストリーミング）
  async chat(request: GeminiChatRequest): Promise<GeminiChatResponse> {
    try {
      // APIキーが設定されていない場合はモックレスポンスを返す
      if (this.isServer && (this.apiKey === 'your_google_api_key_here' || !this.apiKey)) {
        console.log('GeminiClient: Returning mock chat response')
        return {
          candidates: [{
            content: {
              parts: [{
                text: "こんにちは！私はAIアシスタントです。現在はテストモードで動作しています。実際のGemini APIを使用するには、有効なAPIキーを設定してください。"
              }]
            },
            finishReason: "STOP",
            index: 0,
            safetyRatings: []
          }]
        }
      }
      
      this.validateApiKey()
      console.log('GeminiClient: Sending chat request:', request)
      
      if (this.isServer) {
        // サーバーサイド: 直接Gemini APIを呼び出し
        const response = await fetch(`${this.baseUrl}/${this.model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            contents: request.messages.map(msg => ({
              role: msg.role === 'system' ? 'user' : msg.role,
              parts: [{ text: msg.content }]
            })),
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxOutputTokens || 2048,
              topP: request.topP || 0.8,
              topK: request.topK || 40
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('GeminiClient: Chat server error:', errorData)
          const errorMessage = this.parseErrorMessage(errorData)
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log('GeminiClient: Chat response:', result)
        return result
      } else {
        // クライアントサイド: APIルートを使用
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: request.messages,
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            topP: request.topP,
            topK: request.topK,
            stream: false
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('GeminiClient: API route error:', errorData)
          throw new Error(errorData.error || 'Gemini APIでエラーが発生しました。')
        }

        const result = await response.json()
        console.log('GeminiClient: Chat response:', result)
        return result
      }
    } catch (error) {
      console.error('GeminiClient: Failed to send chat:', error)
      throw error
    }
  }

  // チャットを送信（ストリーミング）
  async chatStream(
    request: GeminiChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // APIキーが設定されていない場合はモックレスポンスを返す
      if (this.isServer && (this.apiKey === 'your_google_api_key_here' || !this.apiKey)) {
        console.log('GeminiClient: Returning mock streaming response')
        const mockResponse = "こんにちは！私はAIアシスタントです。現在はテストモードで動作しています。実際のGemini APIを使用するには、有効なAPIキーを設定してください。"
        const words = mockResponse.split('')
        
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 50))
          onChunk(word)
        }
        
        onComplete()
        return
      }
      
      this.validateApiKey()
      console.log('GeminiClient: Sending streaming chat request:', request)
      console.log('GeminiClient: Is server:', this.isServer)
      console.log('GeminiClient: Base URL:', this.baseUrl)
      
      if (this.isServer) {
        // サーバーサイド: 直接Gemini APIを呼び出し
        console.log('GeminiClient: Making direct API call to Gemini')
        const response = await fetch(`${this.baseUrl}/${this.model}:streamGenerateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            contents: request.messages.map(msg => ({
              role: msg.role === 'system' ? 'user' : msg.role,
              parts: [{ text: msg.content }]
            })),
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxOutputTokens || 2048,
              topP: request.topP || 0.8,
              topK: request.topK || 40
            }
          })
        })

        console.log('GeminiClient: Direct API response status:', response.status)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('GeminiClient: Streaming chat server error:', errorData)
          const errorMessage = this.parseErrorMessage(errorData)
          throw new Error(errorMessage)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('レスポンスボディがありません')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let chunkCount = 0
        let hasReceivedText = false

        console.log('GeminiClient: Starting to read streaming response from direct API')
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('GeminiClient: Direct API stream reading completed')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          console.log('GeminiClient: Received raw chunk from direct API:', chunk)
          
          // バッファに追加
          buffer += chunk
          
          // 完全なJSONオブジェクトを探す
          let braceCount = 0
          let startIndex = -1
          let endIndex = -1
          
          for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === '{') {
              if (braceCount === 0) {
                startIndex = i
              }
              braceCount++
            } else if (buffer[i] === '}') {
              braceCount--
              if (braceCount === 0 && startIndex !== -1) {
                endIndex = i
                break
              }
            }
          }
          
          // 完全なJSONオブジェクトが見つかった場合
          if (startIndex !== -1 && endIndex !== -1) {
            const jsonString = buffer.substring(startIndex, endIndex + 1)
            buffer = buffer.substring(endIndex + 1)
            
            try {
              const data = JSON.parse(jsonString)
              console.log('GeminiClient: Parsed complete JSON object:', data)
              
              // テキストがあればonChunk
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text
              if (text && typeof text === 'string' && text.length > 0) {
                console.log('GeminiClient: Calling onChunk with text from direct API:', text)
                onChunk(text)
                chunkCount++
                hasReceivedText = true
              }
              
              // 終了判定
              if (data.candidates?.[0]?.finishReason === 'STOP') {
                console.log('GeminiClient: Direct API stream done, calling onComplete')
                onComplete()
                return
              }
            } catch (e) {
              console.error('GeminiClient: Failed to parse JSON object:', jsonString, e)
            }
          }
        }

        console.log('GeminiClient: Direct API stream ended, total chunks:', chunkCount)
        // テキストを受信していない場合はonCompleteを呼ぶ
        if (!hasReceivedText) {
          console.log('GeminiClient: No text received, calling onComplete')
        }
        onComplete()
      } else {
        // クライアントサイド: APIルートを使用
        console.log('GeminiClient: Making request to API route:', this.baseUrl)
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: request.messages,
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            topP: request.topP,
            topK: request.topK,
            stream: true
          })
        })

        console.log('GeminiClient: API route response status:', response.status)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('GeminiClient: Streaming API route error:', errorData)
          const errorMessage = errorData.error || errorData.details || 'Gemini APIでエラーが発生しました。'
          throw new Error(errorMessage)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('レスポンスボディがありません')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let chunkCount = 0

        console.log('GeminiClient: Starting to read streaming response from API route')
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('GeminiClient: API route stream reading completed')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          console.log('GeminiClient: Received raw chunk from API route:', chunk)
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            console.log('GeminiClient: Processing line from API route:', line)
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log('GeminiClient: Parsed data from API route:', data)
                
                // API routeから送信されたデータ形式を処理
                if (data.content && typeof data.content === 'string' && data.content.length > 0) {
                  console.log('GeminiClient: Calling onChunk with content from API route:', data.content)
                  onChunk(data.content)
                  chunkCount++
                }
                
                // 完了フラグをチェック
                if (data.done === true) {
                  console.log('GeminiClient: API route stream done, calling onComplete')
                  onComplete()
                  return
                }
              } catch (e) {
                console.error('GeminiClient: Failed to parse SSE data from API route:', e)
              }
            }
          }
        }

        console.log('GeminiClient: API route stream ended, total chunks:', chunkCount)
        onComplete()
      }
    } catch (error) {
      console.error('GeminiClient: Failed to send streaming chat:', error)
      onError(error as Error)
    }
  }

  // APIキーの有効性を確認
  async healthCheck(): Promise<boolean> {
    try {
      console.log('GeminiClient: Health check')
      
      // APIキーが設定されていない場合は無効として扱う
      if (this.isServer && (this.apiKey === 'your_google_api_key_here' || !this.apiKey)) {
        console.log('GeminiClient: Health check failed - API key not set')
        return false
      }
      
      this.validateApiKey()
      
      if (this.isServer) {
        // サーバーサイド: 直接Gemini APIを呼び出し
        console.log('GeminiClient: Making direct API call to Gemini')
        const response = await fetch(`${this.baseUrl}/${this.model}`, {
          headers: {
            'x-goog-api-key': this.apiKey
          }
        })
        const isHealthy = response.ok
        console.log('GeminiClient: Health check result:', isHealthy, 'Status:', response.status)
        if (!isHealthy) {
          const errorText = await response.text()
          console.error('GeminiClient: API error response:', errorText)
        }
        return isHealthy
      } else {
        // クライアントサイド: APIルートを使用
        console.log('GeminiClient: Making API route call')
        const response = await fetch(this.baseUrl, {
          method: 'GET'
        })
        const isHealthy = response.ok
        console.log('GeminiClient: Health check result:', isHealthy, 'Status:', response.status)
        if (!isHealthy) {
          const errorText = await response.text()
          console.error('GeminiClient: API route error response:', errorText)
        }
        return isHealthy
      }
    } catch (error) {
      console.error('GeminiClient: Health check failed:', error)
      return false
    }
  }
}

// デフォルトのGeminiクライアントインスタンス
export const geminiClientInstance = new GeminiClient()

// 便利な関数
export const geminiAPI = {
  // チャット（非ストリーミング）
  chat: (request: GeminiChatRequest) => geminiClientInstance.chat(request),
  
  // チャット（ストリーミング）
  chatStream: (
    request: GeminiChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => geminiClientInstance.chatStream(request, onChunk, onComplete, onError),
  
  // ヘルスチェック
  healthCheck: () => geminiClientInstance.healthCheck()
} 