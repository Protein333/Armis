import { ollamaAPI, OllamaChatMessage, OllamaChatRequest } from './ollama'
import { geminiAPI, GeminiChatMessage, GeminiChatRequest } from './gemini'

// AIプロバイダーの型定義
export type AIProvider = 'gemini' | 'ollama'

// 統一されたチャットメッセージの型定義
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 統一されたチャットリクエストの型定義
export interface ChatRequest {
  messages: ChatMessage[]
  provider: AIProvider
  model?: string // Ollama用
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// 統一されたチャットレスポンスの型定義
export interface ChatResponse {
  content: string
  provider: AIProvider
  model?: string
}

// AIクライアントクラス
export class AIClient {
  private defaultProvider: AIProvider

  constructor(defaultProvider: AIProvider = 'gemini') {
    this.defaultProvider = defaultProvider
  }

  // メッセージを変換（統一形式 ↔ プロバイダー固有形式）
  private convertMessages(messages: ChatMessage[], provider: AIProvider): OllamaChatMessage[] | GeminiChatMessage[] {
    if (provider === 'ollama') {
      return messages as OllamaChatMessage[]
    } else {
      return messages as GeminiChatMessage[]
    }
  }

  // チャットを送信（非ストリーミング）
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { messages, provider, model, temperature, maxTokens } = request

    try {
      if (provider === 'ollama') {
        const ollamaRequest: OllamaChatRequest = {
          model: model || 'llama3.1:8b',
          messages: this.convertMessages(messages, 'ollama') as OllamaChatMessage[],
          stream: false,
          options: {
            temperature: temperature || 0.7,
            num_predict: maxTokens || 2048
          }
        }

        const response = await ollamaAPI.chat(ollamaRequest)
        return {
          content: response.message.content,
          provider: 'ollama',
          model: response.model
        }
      } else {
        const geminiRequest: GeminiChatRequest = {
          messages: this.convertMessages(messages, 'gemini') as GeminiChatMessage[],
          temperature: temperature || 0.7,
          maxOutputTokens: maxTokens || 2048
        }

        const response = await geminiAPI.chat(geminiRequest)
        return {
          content: response.candidates[0].content.parts[0].text,
          provider: 'gemini',
          model: model || 'gemini-2.0-flash-lite-001'
        }
      }
    } catch (error) {
      console.error(`AI Client: Failed to send chat with ${provider}:`, error)
      throw error
    }
  }

  // ストリーミングチャットを送信
  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const { messages, provider, model, temperature, maxTokens } = request

    console.log('AI Client: Starting streaming chat with provider:', provider)
    console.log('AI Client: Request:', { provider, model, temperature, maxTokens, messageCount: messages.length })

    try {
      if (provider === 'ollama') {
        console.log('AI Client: Using Ollama provider')
        const ollamaRequest: OllamaChatRequest = {
          model: model || 'llama3.1:8b',
          messages: this.convertMessages(messages, 'ollama') as OllamaChatMessage[],
          stream: true,
          options: {
            temperature: temperature || 0.7,
            num_predict: maxTokens || 2048
          }
        }

        console.log('AI Client: Ollama request:', ollamaRequest)
        await ollamaAPI.chatStream(ollamaRequest, onChunk, onComplete, onError)
      } else {
        console.log('AI Client: Using Gemini provider')
        const geminiRequest: GeminiChatRequest = {
          messages: this.convertMessages(messages, 'gemini') as GeminiChatMessage[],
          temperature: temperature || 0.7,
          maxOutputTokens: maxTokens || 2048
        }

        console.log('AI Client: Gemini request:', geminiRequest)
        await geminiAPI.chatStream(geminiRequest, onChunk, onComplete, onError)
      }
    } catch (error) {
      console.error(`AI Client: Failed to send streaming chat with ${provider}:`, error)
      onError(error as Error)
    }
  }

  // プロバイダーの接続状態を確認
  async healthCheck(provider: AIProvider): Promise<boolean> {
    try {
      if (provider === 'ollama') {
        return await ollamaAPI.healthCheck()
      } else {
        return await geminiAPI.healthCheck()
      }
    } catch (error) {
      console.error(`AI Client: Health check failed for ${provider}:`, error)
      return false
    }
  }

  // 利用可能なプロバイダーを確認
  async getAvailableProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = []
    
    try {
      const geminiHealthy = await this.healthCheck('gemini')
      if (geminiHealthy) {
        providers.push('gemini')
        console.log('AI Client: Gemini is available')
      } else {
        console.log('AI Client: Gemini is not available')
      }
    } catch (error) {
      console.error('AI Client: Failed to check Gemini health:', error)
    }

    try {
      const ollamaHealthy = await this.healthCheck('ollama')
      if (ollamaHealthy) {
        providers.push('ollama')
        console.log('AI Client: Ollama is available')
      } else {
        console.log('AI Client: Ollama is not available (server may not be running)')
      }
    } catch (error) {
      console.error('AI Client: Failed to check Ollama health:', error)
    }

    console.log('AI Client: Available providers:', providers)
    return providers
  }
}

// デフォルトのAIクライアントインスタンス
export const aiClientInstance = new AIClient()

// 便利な関数
export const aiAPI = {
  // チャット（非ストリーミング）
  chat: (request: ChatRequest) => aiClientInstance.chat(request),
  
  // チャット（ストリーミング）
  chatStream: (
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => aiClientInstance.chatStream(request, onChunk, onComplete, onError),
  
  // ヘルスチェック
  healthCheck: (provider: AIProvider) => aiClientInstance.healthCheck(provider),
  
  // 利用可能なプロバイダーを取得
  getAvailableProviders: () => aiClientInstance.getAvailableProviders()
} 