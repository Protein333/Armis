import { useState, useEffect, useCallback } from 'react'
import { ollamaAPI, OllamaModel, OllamaChatMessage, OllamaChatRequest } from '@/lib/ollama'

interface UseOllamaOptions {
  defaultModel?: string
  temperature?: number
  maxTokens?: number
}

interface UseOllamaReturn {
  // 状態
  models: OllamaModel[]
  currentModel: string
  isLoading: boolean
  isConnected: boolean
  error: string | null
  
  // アクション
  setCurrentModel: (model: string) => void
  fetchModels: () => Promise<void>
  sendChat: (messages: OllamaChatMessage[], model?: string, stream?: boolean) => Promise<any>
  
  // ストリーミング
  sendStreamingChat: (
    messages: OllamaChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    model?: string
  ) => Promise<void>
}

export function useOllama(options: UseOllamaOptions = {}): UseOllamaReturn {
  const {
    defaultModel = 'llama3.1:8b',
    temperature = 0.7,
    maxTokens = 2048
  } = options

  // 状態
  const [models, setModels] = useState<OllamaModel[]>([])
  const [currentModel, setCurrentModel] = useState(defaultModel)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // モデル一覧を取得
  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const modelList = await ollamaAPI.listModels()
      setModels(modelList)
      setIsConnected(true)
    } catch (err) {
      console.error('Failed to fetch models:', err)
      setError('Ollamaサーバーに接続できませんでした')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // チャットを送信（非ストリーミング）
  const sendChat = useCallback(async (
    messages: OllamaChatMessage[],
    model?: string,
    stream?: boolean
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const request: OllamaChatRequest = {
        model: model || currentModel,
        messages,
        stream: stream || false,
        options: {
          temperature,
          num_predict: maxTokens
        }
      }

      return await ollamaAPI.chat(request)
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
    messages: OllamaChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    model?: string
  ) => {
    try {
      setError(null)
      
      const request: OllamaChatRequest = {
        model: model || currentModel,
        messages,
        stream: true,
        options: {
          temperature,
          num_predict: maxTokens
        }
      }

      await ollamaAPI.chatStream(request, onChunk, onComplete, onError)
    } catch (err) {
      console.error('Failed to send streaming chat:', err)
      setError('ストリーミングチャットの送信に失敗しました')
      onError(err as Error)
    }
  }, [currentModel, temperature, maxTokens])

  // 初期化時にモデル一覧を取得
  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // ヘルスチェック
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await ollamaAPI.healthCheck()
        setIsConnected(isHealthy)
        if (!isHealthy) {
          setError('Ollamaサーバーに接続できません')
        }
      } catch (err) {
        setIsConnected(false)
        setError('Ollamaサーバーに接続できません')
      }
    }

    checkConnection()
    
    // 定期的にヘルスチェック
    const interval = setInterval(checkConnection, 30000) // 30秒ごと
    
    return () => clearInterval(interval)
  }, [])

  return {
    // 状態
    models,
    currentModel,
    isLoading,
    isConnected,
    error,
    
    // アクション
    setCurrentModel,
    fetchModels,
    sendChat,
    
    // ストリーミング
    sendStreamingChat
  }
} 