import { AIProviderFactory, AIProvider, ChatRequest, ChatResponse, ProviderConfig } from './ai-providers'

// 型定義を再エクスポート
export type { ChatRequest, ChatResponse, AIProvider, ProviderConfig }
import { AVAILABLE_MODELS } from './models'

// 統一されたAIクライアントクラス
export class UnifiedAIClient {
  private defaultConfig: ProviderConfig

  constructor(config: ProviderConfig = {}) {
    this.defaultConfig = config
  }

  // モデルIDからプロバイダーを取得
  private getProviderForModel(modelId: string): AIProvider | null {
    return AIProviderFactory.getProviderForModel(modelId)
  }

  // チャットを送信（非ストリーミング）
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { model, messages, temperature, maxTokens } = request

    // モデルが存在するかチェック
    if (!AVAILABLE_MODELS[model]) {
      throw new Error(`Unknown model: ${model}`)
    }

    // プロバイダーを取得
    const provider = this.getProviderForModel(model)
    if (!provider) {
      throw new Error(`No provider found for model: ${model}`)
    }

    try {
      const aiProvider = AIProviderFactory.getProvider(provider, this.defaultConfig)
      return await aiProvider.chat({
        messages,
        model,
        temperature,
        maxTokens,
        stream: false
      })
    } catch (error) {
      console.error(`Unified AI Client: Failed to send chat with model ${model}:`, error)
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
    const { model, messages, temperature, maxTokens } = request

    console.log('Unified AI Client: Starting streaming chat with model:', model)
    console.log('Unified AI Client: Request:', { model, temperature, maxTokens, messageCount: messages.length })

    // モデルが存在するかチェック
    if (!AVAILABLE_MODELS[model]) {
      const error = new Error(`Unknown model: ${model}`)
      onError(error)
      return
    }

    // プロバイダーを取得
    const provider = this.getProviderForModel(model)
    if (!provider) {
      const error = new Error(`No provider found for model: ${model}`)
      onError(error)
      return
    }

    try {
      const aiProvider = AIProviderFactory.getProvider(provider, this.defaultConfig)
      await aiProvider.chatStream(
        {
          messages,
          model,
          temperature,
          maxTokens,
          stream: true
        },
        onChunk,
        onComplete,
        onError
      )
    } catch (error) {
      console.error(`Unified AI Client: Failed to send streaming chat with model ${model}:`, error)
      onError(error as Error)
    }
  }

  // プロバイダーの接続状態を確認
  async healthCheck(provider: AIProvider): Promise<boolean> {
    try {
      const aiProvider = AIProviderFactory.getProvider(provider, this.defaultConfig)
      return await aiProvider.healthCheck()
    } catch (error) {
      console.error(`Unified AI Client: Health check failed for ${provider}:`, error)
      return false
    }
  }

  // 利用可能なプロバイダーを取得
  async getAvailableProviders(): Promise<AIProvider[]> {
    const providers = AIProviderFactory.getAllProviders()
    const availableProviders: AIProvider[] = []

    for (const provider of providers) {
      try {
        console.log(`Unified AI Client: Checking health for ${provider}...`)
        const isHealthy = await this.healthCheck(provider)
        if (isHealthy) {
          availableProviders.push(provider)
          console.log(`Unified AI Client: ${provider} is available`)
        } else {
          console.log(`Unified AI Client: ${provider} is not available`)
        }
      } catch (error) {
        console.error(`Unified AI Client: Failed to check ${provider} health:`, error)
        // エラーが発生しても他のプロバイダーをチェックし続ける
      }
    }

    console.log('Unified AI Client: Available providers:', availableProviders)
    
    // 利用可能なプロバイダーがない場合のログ
    if (availableProviders.length === 0) {
      console.warn('Unified AI Client: No available providers found. Please check your API keys and network connection.')
    }
    
    return availableProviders
  }

  // 利用可能なモデルを取得
  async getAvailableModels(): Promise<string[]> {
    const availableProviders = await this.getAvailableProviders()
    const availableModels: string[] = []

    for (const provider of availableProviders) {
      try {
        const aiProvider = AIProviderFactory.getProvider(provider, this.defaultConfig)
        const supportedModels = aiProvider.getSupportedModels()
        availableModels.push(...supportedModels)
      } catch (error) {
        console.error(`Unified AI Client: Failed to get models for ${provider}:`, error)
      }
    }

    return availableModels
  }

  // モデルの詳細情報を取得
  getModelInfo(modelId: string) {
    return AVAILABLE_MODELS[modelId] || null
  }

  // プロバイダー別のモデルを取得
  getModelsByProvider(provider: AIProvider): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => {
      const model = AVAILABLE_MODELS[id]
      const modelProvider = AIProviderFactory.getProviderForModel(id)
      return modelProvider === provider
    })
  }

  // カテゴリ別のモデルを取得
  getModelsByCategory(category: string): string[] {
    return Object.keys(AVAILABLE_MODELS).filter(id => 
      AVAILABLE_MODELS[id].category === category
    )
  }

  // 有効化されたモデルのみを取得
  getEnabledModels(enabledModels: Record<string, boolean>): string[] {
    return Object.entries(enabledModels)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([modelId, _]) => modelId)
  }
}

// デフォルトの統一AIクライアントインスタンス
export const unifiedAIClientInstance = new UnifiedAIClient()

// 便利な関数
export const unifiedAIAPI = {
  // チャット（非ストリーミング）
  chat: (request: ChatRequest) => unifiedAIClientInstance.chat(request),
  
  // チャット（ストリーミング）
  chatStream: (
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => unifiedAIClientInstance.chatStream(request, onChunk, onComplete, onError),
  
  // ヘルスチェック
  healthCheck: (provider: AIProvider) => unifiedAIClientInstance.healthCheck(provider),
  
  // 利用可能なプロバイダーを取得
  getAvailableProviders: () => unifiedAIClientInstance.getAvailableProviders(),
  
  // 利用可能なモデルを取得
  getAvailableModels: () => unifiedAIClientInstance.getAvailableModels(),
  
  // モデル情報を取得
  getModelInfo: (modelId: string) => unifiedAIClientInstance.getModelInfo(modelId),
  
  // プロバイダー別のモデルを取得
  getModelsByProvider: (provider: AIProvider) => unifiedAIClientInstance.getModelsByProvider(provider),
  
  // カテゴリ別のモデルを取得
  getModelsByCategory: (category: string) => unifiedAIClientInstance.getModelsByCategory(category),
  
  // 有効化されたモデルを取得
  getEnabledModels: (enabledModels: Record<string, boolean>) => unifiedAIClientInstance.getEnabledModels(enabledModels)
} 