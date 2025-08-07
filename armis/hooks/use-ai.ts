import { useState, useEffect, useCallback } from 'react'
import { unifiedAIAPI } from '@/lib/unified-ai-client'
import { AIProvider, ChatMessage, ChatRequest } from '@/lib/ai-providers'
import { OllamaModel } from '@/lib/ollama'
import { ollamaServerManager, ensureOllamaServer } from '@/lib/ollama-server'

interface UseAIOptions {
  defaultProvider?: AIProvider
  defaultModel?: string
  temperature?: number
  maxTokens?: number
}

interface UseAIReturn {
  // 状態
  currentProvider: AIProvider
  availableProviders: AIProvider[]
  ollamaModels: OllamaModel[]
  currentModel: string
  isLoading: boolean
  isConnected: boolean
  error: string | null
  ollamaServerStatus: any
  
  // アクション
  setCurrentProvider: (provider: AIProvider) => void
  setCurrentModel: (model: string) => void
  fetchOllamaModels: () => Promise<void>
  sendChat: (messages: ChatMessage[], provider?: AIProvider, model?: string, stream?: boolean) => Promise<any>
  startOllamaServer: () => Promise<boolean>
  
  // ストリーミング
  sendStreamingChat: (
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    provider?: AIProvider,
    model?: string
  ) => Promise<void>
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const {
    defaultProvider = 'google',
    defaultModel = 'gemini-2.0-flash-lite',
    temperature = 0.7,
    maxTokens = 2048
  } = options

  // 状態
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(defaultProvider)
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([])
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [currentModel, setCurrentModel] = useState(defaultModel)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ollamaServerStatus, setOllamaServerStatus] = useState(ollamaServerManager.getStatus())

  // 利用可能なプロバイダーを取得
  const fetchAvailableProviders = useCallback(async () => {
    try {
      console.log('useAI: Fetching available providers...')
      const providers = await unifiedAIAPI.getAvailableProviders()
      console.log('useAI: Available providers:', providers)
      setAvailableProviders(providers)
      setIsConnected(providers.length > 0)
      
      // デフォルトプロバイダーが利用できない場合、最初の利用可能なプロバイダーを使用
      if (providers.length > 0 && !providers.includes(currentProvider)) {
        console.log('useAI: Switching to available provider:', providers[0])
        setCurrentProvider(providers[0])
      }
      
      // エラーをクリア
      setError(null)
    } catch (err) {
      console.error('useAI: Failed to fetch available providers:', err)
      setError('AIプロバイダーに接続できませんでした')
      setIsConnected(false)
      setAvailableProviders([])
    }
  }, [currentProvider])

  // Ollamaモデル一覧を取得
  const fetchOllamaModels = useCallback(async () => {
    try {
      if (availableProviders.includes('ollama')) {
        const { ollamaAPI } = await import('@/lib/ollama')
        const modelList = await ollamaAPI.listModels()
        setOllamaModels(modelList)
      }
    } catch (err) {
      console.error('Failed to fetch Ollama models:', err)
    }
  }, [availableProviders])

  // Ollamaサーバーを起動
  const startOllamaServer = useCallback(async (): Promise<boolean> => {
    try {
      console.log('useAI: Starting Ollama server...')
      console.log('useAI: Current available providers:', availableProviders)
      
      const success = await ensureOllamaServer()
      console.log('useAI: Ollama server start result:', success)
      
      if (success) {
        // サーバーが起動したら、利用可能なプロバイダーを再取得
        console.log('useAI: Ollama server started, fetching available providers...')
        await fetchAvailableProviders()
        // Ollamaモデルも再取得
        await fetchOllamaModels()
        console.log('useAI: Updated available providers:', availableProviders)
      } else {
        console.log('useAI: Failed to start Ollama server')
      }
      return success
    } catch (error) {
      console.error('useAI: Failed to start Ollama server:', error)
      setError('Ollamaサーバーの起動に失敗しました。Ollamaがインストールされているか確認してください。')
      return false
    }
  }, [fetchAvailableProviders, fetchOllamaModels, availableProviders])

  // チャットを送信（非ストリーミング）
  const sendChat = useCallback(async (
    messages: ChatMessage[],
    provider?: AIProvider,
    model?: string,
    stream?: boolean
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const request: ChatRequest = {
        messages,
        model: model || currentModel,
        temperature,
        maxTokens,
        stream: stream || false
      }

      return await unifiedAIAPI.chat(request)
    } catch (err) {
      console.error('Failed to send chat:', err)
      setError('チャットの送信に失敗しました')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentModel, temperature, maxTokens])

  // ストリーミングチャットを送信
  const sendStreamingChat = useCallback(async (
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    provider?: AIProvider,
    model?: string
  ) => {
    try {
      setError(null)
      
      const request: ChatRequest = {
        messages,
        model: model || currentModel,
        temperature,
        maxTokens,
        stream: true
      }

      await unifiedAIAPI.chatStream(request, onChunk, onComplete, onError)
    } catch (err) {
      console.error('Failed to send streaming chat:', err)
      setError('ストリーミングチャットの送信に失敗しました')
      onError(err as Error)
    }
  }, [currentModel, temperature, maxTokens])

  // 初期化時に利用可能なプロバイダーを取得
  useEffect(() => {
    console.log('useAI: Initializing, fetching available providers...')
    fetchAvailableProviders()
  }, [fetchAvailableProviders])

  // プロバイダーが変更されたときにOllamaモデルを取得
  useEffect(() => {
    if (currentProvider === 'ollama') {
      fetchOllamaModels()
    }
  }, [currentProvider, fetchOllamaModels])

  // Ollamaサーバーのステータスを監視
  useEffect(() => {
    const handleStatusChange = (status: any) => {
      setOllamaServerStatus(status)
    }

    ollamaServerManager.addStatusListener(handleStatusChange)
    
    return () => {
      ollamaServerManager.removeStatusListener(handleStatusChange)
    }
  }, [])

  // 定期的にヘルスチェック
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('useAI: Periodic health check...')
        const providers = await unifiedAIAPI.getAvailableProviders()
        setAvailableProviders(providers)
        setIsConnected(providers.length > 0)
        
        if (providers.length > 0 && !providers.includes(currentProvider)) {
          console.log('useAI: Switching provider during health check:', providers[0])
          setCurrentProvider(providers[0])
        }
        
        // エラーをクリア
        setError(null)
      } catch (err) {
        console.warn('useAI: Periodic health check failed:', err)
        setIsConnected(false)
        // エラーメッセージを設定しない - 利用可能なプロバイダーがない場合でもアプリケーションは動作可能
        setAvailableProviders([])
      }
    }

    checkConnection()
    
    // 定期的にヘルスチェック（30秒ごと）
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [currentProvider])

  return {
    // 状態
    currentProvider,
    availableProviders,
    ollamaModels,
    currentModel,
    isLoading,
    isConnected,
    error,
    ollamaServerStatus,
    
    // アクション
    setCurrentProvider,
    setCurrentModel,
    fetchOllamaModels,
    sendChat,
    startOllamaServer,
    
    // ストリーミング
    sendStreamingChat
  }
} 