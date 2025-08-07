"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, AlertCircle, ChevronDown, Globe, Server, AtSign, Image, Infinity, Brain, Bot, Cpu, Sparkles as SparklesIcon, Shield, CheckCircle, Upload, X, File, FileText, FileImage, FileVideo, FileAudio, ArrowUpCircle, Video, Link, Play } from "lucide-react"
import { JumpingDots } from "@/components/ui/jumping-dots"
import { useAI } from "@/hooks/use-ai"
import { ChatMessage } from "@/lib/ai-providers"
import { aiAPI, AIProvider } from "@/lib/ai-client"
import { MulmocastIntegration } from "@/components/mulmocast-integration"
import { useMulmocastAI } from "@/hooks/use-mulmocast-ai"
import { VideoGenerationWorkflow } from "@/components/video-generation-workflow"
import { ModelSwitcher } from "@/components/model-switcher"
import { AutoModeSwitcher } from "@/components/auto-mode-switcher"
import { AddContextButton } from "@/components/add-context-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AVAILABLE_MODELS as SHARED_MODELS } from "@/lib/models"
import { processUrlsInMessage, containsUrls, ScrapedContent } from "@/lib/url-utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  preview?: string
  status: 'uploading' | 'success' | 'error'
}

interface AIChatProps {
  chatHistory: Array<{ role: string; content: string }>
  onChatSubmit: (message: string) => void
  onChatResponse: (response: string) => void
  theme?: "dark" | "light"
  onFileUpload?: (files: UploadedFile[]) => void
}

// 共通のモデル定義を使用
const AVAILABLE_MODELS = SHARED_MODELS

// 一般的なOllamaモデルのリスト
const COMMON_MODELS = [
  { name: 'qwen2.5:1.5b', description: 'Qwen2.5 1.5B - 軽量で高速' },
  { name: 'llama3.1:8b', description: 'Llama3.1 8B - バランスの取れた性能' },
  { name: 'llama3.1:3b', description: 'Llama3.1 3B - 軽量版' },
  { name: 'gemma3:2b', description: 'Gemma3 2B - Google製軽量モデル' },
  { name: 'phi3:mini', description: 'Phi3 Mini - Microsoft製軽量モデル' },
  { name: 'mistral:7b', description: 'Mistral 7B - 高性能オープンソース' },
  { name: 'codellama:7b', description: 'Code Llama 7B - コード生成特化' },
  { name: 'deepseek-coder:6.7b', description: 'DeepSeek Coder - コード生成' },
  { name: 'neural-chat:7b', description: 'Neural Chat - 会話特化' },
  { name: 'orca-mini:3b', description: 'Orca Mini - 軽量会話モデル' },
]

export function AIChat({ chatHistory, onChatSubmit, onChatResponse, theme = "light", onFileUpload }: AIChatProps) {
  const [message, setMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [mounted, setMounted] = useState(false)
  const [userFriendlyError, setUserFriendlyError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState("auto")
  const [autoMode, setAutoMode] = useState("auto")
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showMulmocastIntegration, setShowMulmocastIntegration] = useState(false)
  const [showVideoWorkflow, setShowVideoWorkflow] = useState(false)
  const [lastAiResponse, setLastAiResponse] = useState<string>("")
  const [isProcessingUrls, setIsProcessingUrls] = useState(false)
  const [scrapedContents, setScrapedContents] = useState<ScrapedContent[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 設定から有効なモデルを読み込む
  const [enabledModels, setEnabledModels] = useState<{[key: string]: boolean}>({})
  
  const {
    isLoading,
    error,
    currentProvider,
    availableProviders,
    ollamaModels,
    currentModel,
    setCurrentProvider,
    setCurrentModel,
    fetchOllamaModels,
    sendStreamingChat,
    isConnected,
    ollamaServerStatus,
    startOllamaServer,
  } = useAI({
    defaultProvider: 'google',
    defaultModel: 'gemini-2.0-flash-lite',
    temperature: 0.7,
    maxTokens: 2048,
  })

  // mulmocast連携フック
  const {
    isConnected: mulmocastConnected,
    isProcessing: mulmocastProcessing,
    activeProjects,
    sendToMulmocast,
    generateVideoScript,
    videoTemplates
  } = useMulmocastAI()

  // 有効なモデルのみをフィルタリング
  const getEnabledModels = () => {
    const enabled = Object.entries(enabledModels)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([modelId, _]) => modelId)
    
    // デフォルトで有効なモデルを追加（設定がない場合）
    if (enabled.length === 0) {
      return ['gemini-2.0-flash-lite', 'qwen2.5:1.5b']
    }
    
    return enabled
  }

  // 現在のプロバイダーで利用可能なモデルを取得（Settingsで有効化されたもののみ）
  const getAvailableModelsForProvider = (provider: string) => {
    const enabledModelIds = getEnabledModels()
    console.log('Enabled models from settings:', enabledModelIds)
    
    if (provider === 'ollama') {
      // Ollamaモデルの場合、Settingsで有効なもののみを表示
      const enabledOllamaModels = enabledModelIds.filter(id => 
        AVAILABLE_MODELS[id]?.provider === 'Ollama'
      )
      console.log('Enabled Ollama models:', enabledOllamaModels)
      
      // ローカルで利用可能なOllamaモデルと、Settingsで有効化されたモデルを組み合わせ
      const availableModels = ollamaModels.filter(model => 
        enabledOllamaModels.includes(model.name) || 
        enabledOllamaModels.includes(model.name.split(':')[0])
      )
      
      console.log('Available Ollama models after filtering:', availableModels)
      return availableModels
    } else if (provider === 'google') {
      // Geminiモデルの場合、Settingsで有効なもののみを表示
      const availableGeminiModels = enabledModelIds
        .filter(id => AVAILABLE_MODELS[id]?.provider === 'Google')
        .map(id => ({ 
          name: id, 
          description: AVAILABLE_MODELS[id]?.description || '',
          category: AVAILABLE_MODELS[id]?.category || 'Standard',
          icon: AVAILABLE_MODELS[id]?.icon || Globe
        }))
      
      console.log('Available Gemini models after filtering:', availableGeminiModels)
      return availableGeminiModels
    }
    
    return []
  }

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  // 設定から有効なモデルを読み込む
  useEffect(() => {
    if (mounted) {
      try {
        const settings = localStorage.getItem('armis-editor-settings')
        if (settings) {
          const parsedSettings = JSON.parse(settings)
          if (parsedSettings.models) {
            setEnabledModels(parsedSettings.models)
          }
        }
      } catch (error) {
        console.error('Failed to load model settings:', error)
      }
    }
  }, [mounted])

  // 設定の変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'armis-editor-settings' && e.newValue) {
        try {
          const parsedSettings = JSON.parse(e.newValue)
          if (parsedSettings.models) {
            setEnabledModels(parsedSettings.models)
          }
        } catch (error) {
          console.error('Failed to parse updated settings:', error)
        }
      }
    }

    // カスタムイベントでSettingsの変更を監視
    const handleSettingsChange = (e: CustomEvent) => {
      if (e.detail && e.detail.models) {
        console.log('Settings changed via custom event:', e.detail.models)
        setEnabledModels(e.detail.models)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('armis-settings-changed', handleSettingsChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('armis-settings-changed', handleSettingsChange as EventListener)
    }
  }, [])

  // Ollamaモデル一覧を取得
  useEffect(() => {
    if (mounted && currentProvider === 'ollama' && availableProviders.includes('ollama')) {
      fetchOllamaModels()
    }
  }, [mounted, currentProvider, availableProviders, fetchOllamaModels])

  // 現在選択されているモデルが有効化されていない場合の処理
  useEffect(() => {
    if (mounted && enabledModels) {
      console.log('Checking model availability:', { currentProvider, currentModel, enabledModels })
      
      // 現在のプロバイダーで利用可能なモデルを確認
      let availableModels = getAvailableModelsForProvider(currentProvider)
      let currentModelIsAvailable = availableModels.some(model => model.name === currentModel)
      
      console.log('Available models for current provider:', availableModels)
      console.log('Current model available:', currentModelIsAvailable)
      
      // 現在のプロバイダーで利用可能なモデルがない場合、他のプロバイダーを試す
      if (availableModels.length === 0) {
        const otherProvider = currentProvider === 'google' ? 'ollama' : 'google'
        availableModels = getAvailableModelsForProvider(otherProvider)
        
        if (availableModels.length > 0) {
          console.log(`No models available for ${currentProvider}, switching to ${otherProvider}`)
          setCurrentProvider(otherProvider)
          setCurrentModel(availableModels[0].name)
          return
        }
      }
      
      // 現在のモデルが利用できない場合、最初の利用可能なモデルに切り替え
      if (!currentModelIsAvailable && availableModels.length > 0) {
        console.log('Current model not available, switching to first available model')
        setCurrentModel(availableModels[0].name)
      }
    }
  }, [mounted, enabledModels, currentProvider, currentModel])

  // エラーメッセージをユーザーフレンドリーに変換
  useEffect(() => {
    if (error) {
      let friendlyMessage = error
      
      if (error.includes('APIキーが設定されていません')) {
        friendlyMessage = 'Gemini APIキーが設定されていません。環境変数GOOGLE_API_KEYを設定してください。'
      } else if (error.includes('APIキーが無効')) {
        friendlyMessage = 'Gemini APIキーが無効です。正しいAPIキーを設定してください。'
      } else if (error.includes('クォータを超過')) {
        friendlyMessage = 'APIクォータを超過しました。しばらく待ってから再試行してください。'
      } else if (error.includes('請求が有効')) {
        friendlyMessage = 'Gemini APIの請求が有効になっていません。Google Cloud Consoleで設定してください。'
      } else if (error.includes('Failed to fetch') || error.includes('Ollamaサーバー')) {
        friendlyMessage = 'Ollamaサーバーに接続できません。Ollamaを起動してください。'
      }
      
      setUserFriendlyError(friendlyMessage)
    } else {
      setUserFriendlyError(null)
    }
  }, [error])

  // AIプロバイダーが利用可能になった時にチェックマークポップアップを表示
  useEffect(() => {
    console.log('Success popup effect:', { 
      mounted, 
      availableProvidersLength: availableProviders.length, 
      isConnected, 
      showSuccessPopup 
    })
    
    if (mounted && availableProviders.length > 0 && isConnected && !showSuccessPopup) {
      console.log('Showing success popup')
      setShowSuccessPopup(true)
      // 3秒後にポップアップを非表示にする
      const timer = setTimeout(() => {
        console.log('Hiding success popup after timeout')
        setShowSuccessPopup(false)
      }, 3000)
      
      return () => {
        console.log('Clearing success popup timer')
        clearTimeout(timer)
      }
    }
  }, [mounted, availableProviders.length, isConnected])

  // 接続状態に応じたメッセージを取得
  const getConnectionMessage = () => {
    // 接続成功メッセージは非表示にする
    if (isConnected) {
      return null
    }
    
    if (error) {
      return {
        type: 'error' as const,
        message: error,
        showPopup: false
      }
    }
    
    if (isLoading) {
      return {
        type: 'loading' as const,
        message: 'AIプロバイダーに接続中...',
        showPopup: false
      }
    }
    
    // 利用可能なプロバイダーがない場合のヘルプメッセージ
    if (availableProviders.length === 0) {
      return {
        type: 'warning' as const,
        message: 'AIプロバイダーに接続できません。以下のいずれかの方法で設定してください：\n\n1. Gemini APIキーを設定する：\n   export GOOGLE_API_KEY="your_api_key_here"\n\n2. Ollamaをインストールしてローカルサーバーを起動する：\n   curl -fsSL https://ollama.ai/install.sh | sh\n   ollama serve\n\n3. その他のAIプロバイダーのAPIキーを設定する',
        showPopup: false
      }
    }
    
    return {
      type: 'info' as const,
      message: 'AIプロバイダーに接続中...',
      showPopup: false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit conditions:', {
      messageTrimmed: message.trim(),
      isLoading,
      isStreaming,
      mounted,
      availableProviders: availableProviders.length
    })
    
    if (message.trim() && !isLoading && !isStreaming && mounted) {
      const userMessage = message.trim()
      console.log('Submitting message:', userMessage)
      setMessage("")
      setUserFriendlyError(null)
      
      // URLが含まれているかチェック
      const hasUrls = containsUrls(userMessage)
      
      if (hasUrls) {
        setIsProcessingUrls(true)
        try {
          console.log('Processing URLs in message...')
          const { processedMessage, scrapedContents: newScrapedContents } = await processUrlsInMessage(userMessage)
          setScrapedContents(newScrapedContents)
          
          if (newScrapedContents.length > 0) {
            console.log(`Successfully scraped ${newScrapedContents.length} URLs`)
            // 成功メッセージを表示
            setUserFriendlyError(null)
            // 処理されたメッセージでチャットを続行
            await processChatMessage(processedMessage, userMessage)
          } else {
            console.log('No URLs were successfully scraped, proceeding with original message')
            setUserFriendlyError('URLの処理に失敗しました。元のメッセージでチャットを続行します。')
            await processChatMessage(userMessage, userMessage)
          }
        } catch (error) {
          console.error('Error processing URLs:', error)
          // URL処理に失敗した場合は、元のメッセージでチャットを続行
          await processChatMessage(userMessage, userMessage)
          // エラーメッセージを表示
          setUserFriendlyError('URLの処理中にエラーが発生しました。元のメッセージでチャットを続行します。')
        } finally {
          setIsProcessingUrls(false)
        }
      } else {
        // URLが含まれていない場合は、通常のチャット処理
        await processChatMessage(userMessage, userMessage)
      }
    }
  }

  const processChatMessage = async (processedMessage: string, originalMessage: string) => {
    // ユーザーメッセージを追加
    onChatSubmit(originalMessage)
    
    // URL処理の状態をリセット（次のメッセージのため）
    setTimeout(() => {
      setScrapedContents([])
    }, 5000)
      
      // AIレスポンスを生成
      try {
        console.log('Starting AI response generation...')
        console.log('Current provider:', currentProvider)
        console.log('Available providers:', availableProviders)
        console.log('Is connected:', isConnected)
        
        setIsStreaming(true)
        setStreamingResponse("")
        
        const messages: ChatMessage[] = [
          ...chatHistory.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })),
          { role: 'user', content: processedMessage }
        ]

        console.log('Sending messages to AI:', messages)

        // 利用可能なプロバイダーがない場合のフォールバック
        if (availableProviders.length === 0) {
          console.log('No available providers, attempting to start Ollama server...')
          
          // Ollamaサーバーの起動を試行
          try {
            const serverStarted = await startOllamaServer()
            if (serverStarted) {
              console.log('Ollama server started successfully, retrying chat...')
              // サーバーが起動したら、再度チャットを試行
              setTimeout(() => {
                handleSubmit(e)
              }, 1000)
              return
            }
          } catch (error) {
            console.error('Failed to start Ollama server:', error)
          }
          
          console.log('No available providers, using fallback response')
          console.log('Available providers array:', availableProviders)
          console.log('Is connected:', isConnected)
          console.log('Current provider:', currentProvider)
          
          const fallbackResponse = "申し訳ございませんが、現在AIプロバイダーに接続できません。以下のいずれかの方法で設定してください：\n\n1. Gemini APIキーを設定する（環境変数GOOGLE_API_KEY）\n2. Ollamaをインストールしてローカルサーバーを起動する\n3. その他のAIプロバイダーのAPIキーを設定する"
          
          // フォールバックレスポンスをシミュレート
          setIsStreaming(true)
          let response = ""
          const words = fallbackResponse.split(' ')
          
          for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100))
            response += words[i] + ' '
            setStreamingResponse(response)
          }
          
          setIsStreaming(false)
          setStreamingResponse("")
          onChatResponse(response.trim())
          return
        }

        // ストリーミングレスポンスを取得
        let finalResponse = ""
        console.log('AI Chat: Starting streaming chat request')
        
        // aiAPIを直接使用
        await aiAPI.chatStream(
          {
            messages,
            provider: currentProvider as AIProvider,
            model: currentModel,
            temperature: 0.7,
            maxTokens: 2048,
            stream: true
          },
          (chunk) => {
            console.log('AI Chat: Received chunk:', chunk)
            finalResponse += chunk
            setStreamingResponse(finalResponse)
          },
          () => {
            console.log('AI Chat: Streaming completed')
                    setIsStreaming(false)
        setStreamingResponse("")
        setLastAiResponse(finalResponse)
        onChatResponse(finalResponse)
      },
      (error) => {
        console.error('AI Chat: Streaming error:', error)
        setIsStreaming(false)
        setStreamingResponse("")
        
        // エラーメッセージを改善
        let errorMessage = error.message
        if (error.message.includes('APIキー')) {
          errorMessage = 'Gemini APIキーが設定されていません。環境変数GOOGLE_API_KEYを設定してください。'
        } else if (error.message.includes('quota')) {
          errorMessage = 'APIクォータを超過しました。しばらく待ってから再試行してください。'
        } else if (error.message.includes('billing')) {
          errorMessage = 'Gemini APIの請求が有効になっていません。Google Cloud Consoleで設定してください。'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'AIプロバイダーに接続できませんでした。ネットワーク接続を確認してください。'
        }
        
        setUserFriendlyError(errorMessage)
      }
    )
      } catch (error) {
        console.error('Chat error:', error)
        setIsStreaming(false)
        let errorMessage = 'チャットでエラーが発生しました'
        
        if (error instanceof Error) {
          errorMessage = error.message
          // APIキー関連のエラーメッセージを改善
          if (error.message.includes('APIキー')) {
            errorMessage = 'Gemini APIキーが設定されていません。環境変数GOOGLE_API_KEYを設定してください。'
          } else if (error.message.includes('quota')) {
            errorMessage = 'APIクォータを超過しました。しばらく待ってから再試行してください。'
          } else if (error.message.includes('billing')) {
            errorMessage = 'Gemini APIの請求が有効になっていません。Google Cloud Consoleで設定してください。'
          }
        }
        
        setUserFriendlyError(errorMessage)
      }
    }
  }

  // メッセージが更新されたときに自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingResponse])

  // テキストエリアの高さを自動調整する関数
  const adjustTextareaHeight = useCallback((textarea: HTMLTextAreaElement) => {
    const currentHeight = parseInt(textarea.style.height || '60')
    textarea.style.height = 'auto'
    const scrollHeight = Math.min(textarea.scrollHeight, 12 * 20) // 最大12行（1行約20px）
    textarea.style.height = `${scrollHeight}px`
    
    // 高さが変わった場合、上方向に移動
    const heightDiff = scrollHeight - currentHeight
    if (heightDiff > 0) {
      textarea.style.transform = `translateY(-${heightDiff}px)`
    } else if (heightDiff < 0) {
      textarea.style.transform = 'translateY(0)'
    }
  }, [])



  // ファイルサイズを人間が読みやすい形式に変換
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ファイルタイプに応じたアイコンを取得
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <FileVideo className="h-4 w-4" />
    if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />
    if (fileType.startsWith('text/')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // ファイルアップロード処理
  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    const newFiles: UploadedFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = Date.now().toString() + i
      
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading'
      }

      newFiles.push(uploadedFile)
      setUploadedFiles(prev => [...prev, uploadedFile])

      try {
        // ファイルのプレビュー生成（画像の場合）
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, preview: e.target?.result as string, status: 'success' } : f
            ))
          }
          reader.readAsDataURL(file)
        } else {
          // 画像以外のファイルは直接成功状態に
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'success' } : f
          ))
        }

        // 実際のアップロード処理（ここではローカルストレージに保存）
        const fileUrl = URL.createObjectURL(file)
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, url: fileUrl, status: 'success' } : f
        ))

      } catch (error) {
        console.error('File upload error:', error)
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error' } : f
        ))
      }
    }

    setIsUploading(false)
    onFileUpload?.(newFiles)
  }

  // ファイル削除
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const isDark = theme === "dark"
  const bgColor = isDark ? "bg-zinc-900" : "bg-white"
  const textColor = isDark ? "text-zinc-100" : "text-gray-900"
  const textMuted = isDark ? "text-zinc-400" : "text-gray-600"
  const borderColor = isDark ? "border-zinc-800" : "border-gray-200"
  const inputBg = isDark ? "bg-zinc-800" : "bg-gray-50"
  const messageBg = isDark ? "bg-zinc-800" : "bg-gray-100"

  if (!mounted) {
    return (
      <div className={`h-full ${bgColor} ${textColor} flex items-center justify-center`}>
        <JumpingDots size="lg" color={isDark ? "#3b82f6" : "#3b82f6"} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
          <img src="/icon.png" alt="armis" className="w-16 h-16" />
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
          <div className="flex items-center space-x-2 p-3 rounded-lg border shadow-lg bg-green-900/20 border-green-600 text-green-400">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">AIプロバイダーに接続しました</span>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="ml-2 text-sm hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-4xl">
        {/* Connection Status Message */}
        {(() => {
          const connectionMessage = getConnectionMessage()
          if (connectionMessage) {
            return (
              <div className="p-4 border-b border-neutral-700">
                <div className={`flex items-start space-x-2 p-3 rounded-lg border ${
                  connectionMessage.type === 'error'
                    ? 'bg-red-900/20 border-red-600 text-red-400'
                    : connectionMessage.type === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-600 text-yellow-400'
                    : 'bg-blue-900/20 border-blue-600 text-blue-400'
                }`}>
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium whitespace-pre-wrap">{connectionMessage.message}</p>
                  </div>
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* URL処理中のローディングインジケーター */}
        {isProcessingUrls && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700">
              <JumpingDots size="md" color="#3b82f6" />
            </div>
          </div>
        )}

        {(() => {
          console.log('AI Chat: Rendering chat history, length:', chatHistory.length)
          return chatHistory.map((msg, index) => {
            console.log('AI Chat: Rendering message:', { index, role: msg.role, content: msg.content })
            return (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? `bg-neutral-800 text-white border border-neutral-700`
                      : `bg-[#389F70] text-white`
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* URL処理の結果を表示 */}
                  {msg.role === 'user' && scrapedContents.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-700">
                      <div className="flex items-center space-x-1 text-xs text-blue-400 mb-1">
                        <Link className="h-3 w-3" />
                        <span>Webreaderで抽出されたコンテンツ:</span>
                      </div>
                      {scrapedContents.map((content, contentIndex) => (
                        <div key={contentIndex} className="text-xs bg-neutral-800 p-2 rounded border border-neutral-700 mb-1">
                          <div className="font-medium text-blue-300 mb-1">
                            {content.title}
                          </div>
                          <div className="text-blue-200 text-xs mb-1">
                            {content.description}
                          </div>
                          <div className="text-blue-100 text-xs">
                            {content.content.substring(0, 100)}...
                          </div>
                          <div className="text-blue-300 text-xs mt-1">
                            {content.message || `読みやすさスコア: ${content.readabilityScore}%`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        })()}
        
        {/* AI回答待機時のローディング */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-[#389F70] text-white">
              <JumpingDots size="md" color="white" />
            </div>
          </div>
        )}
        
        {isStreaming && streamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-[#389F70] text-white">
              <p className="text-sm whitespace-pre-wrap">
                {streamingResponse}
                <span className="animate-pulse">▌</span>
              </p>
            </div>
          </div>
        )}
        
        {/* デバッグ情報 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2">
            <div>Streaming: {isStreaming ? 'true' : 'false'}</div>
            <div>Response length: {streamingResponse.length}</div>
            <div>Chat history length: {chatHistory.length}</div>
            <div>Available providers: {availableProviders.join(', ') || 'none'}</div>
            <div>Current provider: {currentProvider}</div>
            <div>Is connected: {isConnected ? 'true' : 'false'}</div>
            <div>Is loading: {isLoading ? 'true' : 'false'}</div>
            <div>Error: {error || 'none'}</div>
            <div>Ollama server: {ollamaServerStatus.isRunning ? 'running' : ollamaServerStatus.isStarting ? 'starting' : 'stopped'}</div>
            <div>Ollama error: {ollamaServerStatus.error || 'none'}</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {userFriendlyError && (
        <div className={`p-4 border-t ${borderColor} ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            <AlertCircle className="h-4 w-4" />
            <span>{userFriendlyError}</span>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <Card className="w-full max-w-3xl p-4 bg-neutral-900 rounded-t-3xl">
        <CardContent className="flex items-center gap-2">
          {/* Context Button */}
          <AddContextButton
            onAddContext={(type) => {
              console.log('Adding context:', type)
              // コンテキスト追加の処理を実装
            }}
            className="h-8 px-3 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
          />

          {/* Main Input */}
          <Input
            className="flex-1 bg-neutral-800 text-white placeholder:text-neutral-400 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Send a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading || isStreaming || isProcessingUrls}
          />

          {/* Model Switcher */}
          <ModelSwitcher
            currentProvider={currentProvider}
            currentModel={currentModel}
            availableProviders={availableProviders}
            onProviderChange={async (provider) => {
              setCurrentProvider(provider)
              const models = getAvailableModelsForProvider(provider)
              if (models.length > 0) {
                setCurrentModel(models[0].name)
              }
              // Ollamaプロバイダーが選択された場合、サーバーを自動起動
              if (provider === 'ollama' && !ollamaServerStatus.isRunning) {
                try {
                  await startOllamaServer()
                } catch (error) {
                  console.error('Error starting Ollama server:', error)
                }
              }
            }}
            onModelChange={async (model) => {
              setCurrentModel(model)
              // Ollamaモデルが選択された場合、サーバーを自動起動
              const modelInfo = AVAILABLE_MODELS[model]
              if (modelInfo?.provider === 'Ollama' && !ollamaServerStatus.isRunning) {
                try {
                  await startOllamaServer()
                } catch (error) {
                  console.error('Error starting Ollama server:', error)
                }
              }
            }}
            getAvailableModelsForProvider={getAvailableModelsForProvider}
            className="h-8 px-3 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
          />

          {/* Auto Mode Switcher */}
          <AutoModeSwitcher
            currentMode={autoMode}
            onModeChange={setAutoMode}
            className="h-8 px-3 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
          />

          {/* File Upload Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openFileDialog}
            disabled={isLoading || isStreaming || isProcessingUrls}
            className="text-white"
            title="ファイルをアップロード"
          >
            <Image className="w-5 h-5" />
          </Button>

          {/* Send Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading || isStreaming || isProcessingUrls}
            className="text-white"
          >
            {isLoading || isStreaming || isProcessingUrls ? (
              <JumpingDots size="xxs" color="white" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
          </Button>
        </CardContent>
      </Card>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files)
              }
              // 同じファイルを再度選択できるようにリセット
              e.target.value = ''
            }}
            className="hidden"
            aria-label="ファイルをアップロード"
          />

        {/* Mulmocast Integration Panel */}
        {showMulmocastIntegration && lastAiResponse && (
          <div className="mt-4 p-4 border-t border-neutral-700 bg-neutral-800 rounded-lg">
            <MulmocastIntegration
              aiResponse={lastAiResponse}
              onSendToMulmocast={async (content, type) => {
                try {
                  await sendToMulmocast(content, type)
                } catch (error) {
                  console.error('Failed to send to mulmocast:', error)
                  setUserFriendlyError('Mulmocastへの送信に失敗しました')
                }
              }}
              onReceiveFromMulmocast={(message) => {
                // mulmocastからのメッセージをチャットに追加
                onChatResponse(`Mulmocast: ${message.content}`)
              }}
              isConnected={mulmocastConnected}
            />
          </div>
        )}

        {/* Video Generation Workflow Panel */}
        {showVideoWorkflow && (
          <div className="mt-4 p-4 border-t border-neutral-700 bg-neutral-800 rounded-lg">
            <VideoGenerationWorkflow
              onVideoGenerated={(videoData) => {
                console.log('Video generated:', videoData)
                // 生成された動画データをチャットに追加
                onChatResponse(`動画生成完了: ${videoData.recipe.title}の動画が生成されました`)
              }}
            />
          </div>
        )}

        {!userFriendlyError && error && (
          <div className="flex items-center space-x-1 text-xs text-red-400 mt-2">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
