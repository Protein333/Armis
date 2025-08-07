import { AVAILABLE_MODELS, AIModel } from './models'

// 統一されたAIプロバイダーの型定義
export type AIProvider = 'anthropic' | 'openai' | 'google' | 'xai' | 'deepseek' | 'moonshot' | 'cursor' | 'fireworks' | 'ollama'

// 統一されたチャットメッセージの型定義
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 統一されたチャットリクエストの型定義
export interface ChatRequest {
  messages: ChatMessage[]
  model: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// 統一されたチャットレスポンスの型定義
export interface ChatResponse {
  content: string
  model: string
  provider: AIProvider
}

// プロバイダー固有の設定
export interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
}

// AIプロバイダーの抽象クラス
export abstract class BaseAIProvider {
  protected config: ProviderConfig

  constructor(config: ProviderConfig = {}) {
    this.config = config
  }

  abstract chat(request: ChatRequest): Promise<ChatResponse>
  abstract chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void>
  abstract healthCheck(): Promise<boolean>
  abstract getSupportedModels(): string[]
}

// Anthropicプロバイダー
export class AnthropicProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'anthropic'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/anthropic/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'Anthropic'
    )
  }
}

// OpenAIプロバイダー
export class OpenAIProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'openai'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/openai/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'OpenAI'
    )
  }
}

// Googleプロバイダー
export class GoogleProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'google'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      console.log('GoogleProvider: Checking health...')
      const response = await fetch('/api/gemini')
      
      if (!response.ok) {
        console.log('GoogleProvider: Health check failed with status:', response.status)
        return false
      }
      
      const data = await response.json()
      const isHealthy = data.healthy === true
      console.log('GoogleProvider: Health check result:', isHealthy)
      return isHealthy
    } catch (error) {
      console.error('GoogleProvider: Health check error:', error)
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'Google'
    )
  }
}

// xAIプロバイダー
export class XAIProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/xai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'xai'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/xai/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'xAI'
    )
  }
}

// DeepSeekプロバイダー
export class DeepSeekProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'deepseek'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/deepseek/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'DeepSeek'
    )
  }
}

// Moonshotプロバイダー
export class MoonshotProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/moonshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Moonshot API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'moonshot'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/moonshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Moonshot API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/moonshot/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'Moonshot'
    )
  }
}

// Cursorプロバイダー
export class CursorProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/cursor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Cursor API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'cursor'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/cursor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Cursor API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onComplete()
              return
            } else {
              onChunk(data.content)
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/cursor/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].provider === 'Cursor'
    )
  }
}



// Fireworks AIプロバイダー
export class FireworksProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/fireworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Fireworks API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'fireworks'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/fireworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Fireworks API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete()
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                onChunk(parsed.choices[0].delta.content)
              }
            } catch (e) {
              // 無効なJSONは無視
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/fireworks/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return ['llama-3.1-8b-instruct', 'llama-3.1-70b-instruct', 'llama-3.1-405b-instruct']
  }
}

// Ollamaプロバイダー
export class OllamaProvider extends BaseAIProvider {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content,
      model: request.model,
      provider: 'ollama'
    }
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line)
              if (parsed.response) {
                onChunk(parsed.response)
              }
              if (parsed.done) {
                onComplete()
                return
              }
            } catch (e) {
              // 無効なJSONは無視
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/ollama/health')
      return response.ok
    } catch {
      return false
    }
  }

  getSupportedModels(): string[] {
    return ['llama3.1:8b', 'llama3.1:70b', 'llama3.1:405b', 'mistral:7b', 'codellama:7b']
  }
}

// プロバイダーファクトリー
export class AIProviderFactory {
  private static providers: Map<AIProvider, BaseAIProvider> = new Map()

  static getProvider(provider: AIProvider, config?: ProviderConfig): BaseAIProvider {
    if (!this.providers.has(provider)) {
      let instance: BaseAIProvider

      switch (provider) {
        case 'anthropic':
          instance = new AnthropicProvider(config)
          break
        case 'openai':
          instance = new OpenAIProvider(config)
          break
        case 'google':
          instance = new GoogleProvider(config)
          break
        case 'xai':
          instance = new XAIProvider(config)
          break
        case 'deepseek':
          instance = new DeepSeekProvider(config)
          break
        case 'moonshot':
          instance = new MoonshotProvider(config)
          break
        case 'cursor':
          instance = new CursorProvider(config)
          break
        case 'fireworks':
          instance = new FireworksProvider(config)
          break
        case 'ollama':
          instance = new OllamaProvider(config)
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }

      this.providers.set(provider, instance)
    }

    return this.providers.get(provider)!
  }

  static getProviderForModel(modelId: string): AIProvider | null {
    // Ollamaモデルの場合は直接判定
    if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('codellama')) {
      return 'ollama'
    }

    const model = AVAILABLE_MODELS[modelId]
    if (!model) return null

    switch (model.provider) {
      case 'Anthropic':
        return 'anthropic'
      case 'OpenAI':
        return 'openai'
      case 'Google':
        return 'google'
      case 'xAI':
        return 'xai'
      case 'DeepSeek':
        return 'deepseek'
      case 'Moonshot':
        return 'moonshot'
      case 'Cursor':
        return 'cursor'
      case 'Fireworks':
        return 'fireworks'
      default:
        return null
    }
  }

  static getAllProviders(): AIProvider[] {
    return ['anthropic', 'openai', 'google', 'xai', 'deepseek', 'moonshot', 'cursor', 'fireworks', 'ollama']
  }
} 