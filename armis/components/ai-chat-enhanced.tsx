"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, AlertCircle, ChevronDown, Globe, Server, AtSign, Image, Infinity, Brain, Bot, Cpu, Sparkles as SparklesIcon, Shield, CheckCircle, Upload, X, File, FileText, FileImage, FileVideo, FileAudio, ArrowUpCircle, Video, Link, Play } from "lucide-react"
import { useAI } from "@/hooks/use-ai"
import { ChatMessage } from "@/lib/ai-providers"
import { aiAPI, AIProvider } from "@/lib/ai-client"
import { MulmocastIntegration } from "@/components/mulmocast-integration"
import { useMulmocastAI } from "@/hooks/use-mulmocast-ai"
import { VideoGenerationWorkflow } from "@/components/video-generation-workflow"
import { ModelSwitcher } from "@/components/model-switcher"
import { AutoModeSwitcher } from "@/components/auto-mode-switcher"
import { AddContextButton } from "@/components/add-context-button"
import { EnhancedChat, Message } from "@/components/ui/enhanced-chat"
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
import { cn } from "@/lib/utils"
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

interface AIChatEnhancedProps {
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

export function AIChatEnhanced({ chatHistory, onChatSubmit, onChatResponse, theme = "light", onFileUpload }: AIChatEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
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
      
      // ローカルで利用可能なOllamaモデルを取得
      return ollamaModels.filter(model => 
        enabledOllamaModels.includes(model.name)
      )
    }
    
    // その他のプロバイダーの場合
    return Object.entries(AVAILABLE_MODELS)
      .filter(([modelId, model]) => 
        model.provider === provider && enabledModelIds.includes(modelId)
      )
      .map(([modelId, model]) => ({
        name: modelId,
        description: model.description || modelId
      }))
  }

  // 設定の変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'armis-settings') {
        try {
          const settings = JSON.parse(e.newValue || '{}')
          setEnabledModels(settings.enabledModels || {})
        } catch (error) {
          console.error('Failed to parse settings:', error)
        }
      }
    }

    const handleSettingsChange = (e: CustomEvent) => {
      if (e.detail?.enabledModels) {
        setEnabledModels(e.detail.enabledModels)
      }
    }

    // 初期設定を読み込み
    try {
      const settings = localStorage.getItem('armis-settings')
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        setEnabledModels(parsedSettings.enabledModels || {})
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('settings-changed', handleSettingsChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('settings-changed', handleSettingsChange as EventListener)
    }
  }, [])

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    setMounted(true)
  }, [])

  // 接続状態メッセージを取得
  const getConnectionMessage = () => {
    if (!mounted) return "初期化中..."
    
    if (currentProvider === 'ollama') {
      if (!isConnected) {
        return "Ollamaサーバーに接続できません"
      }
      return `Ollama接続済み (${currentModel})`
    }
    
    if (currentProvider === 'google') {
      return `Google AI接続済み (${currentModel})`
    }
    
    if (currentProvider === 'openai') {
      return `OpenAI接続済み (${currentModel})`
    }
    
    return "AIプロバイダーに接続中..."
  }

  // メッセージ送信処理
  const handleSubmit = async (message: string, attachments?: File[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return

    setIsGenerating(true)
    setUserFriendlyError(null)

    try {
      // ユーザーメッセージを追加
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        createdAt: new Date(),
        attachments: attachments
      }
      
      setMessages(prev => [...prev, userMessage])

      // URL処理
      let processedMessage = message
      if (containsUrls(message)) {
        setIsProcessingUrls(true)
        try {
          const processed = await processUrlsInMessage(message)
          processedMessage = processed.processedMessage
          setScrapedContents(processed.scrapedContents)
        } catch (error) {
          console.error('URL processing failed:', error)
        } finally {
          setIsProcessingUrls(false)
        }
      }

      // AIレスポンスを取得
      const response = await sendStreamingChat(
        [...chatHistory, { role: "user", content: processedMessage }],
        (chunk) => {
          // ストリーミングレスポンスを処理
          setLastAiResponse(prev => prev + chunk)
        },
        () => {
          // ストリーミング完了
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: lastAiResponse,
            createdAt: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
          setLastAiResponse("")
          setIsGenerating(false)
        },
        (error) => {
          // エラー処理
          console.error('Chat error:', error)
          setUserFriendlyError(error.message || "メッセージの送信に失敗しました")
          setIsGenerating(false)
        },
        currentModel
      )

      onChatSubmit(message)
      if (response) {
        onChatResponse(response)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setUserFriendlyError("メッセージの送信に失敗しました")
      setIsGenerating(false)
    }
  }

  // レスポンス評価
  const handleRateResponse = (messageId: string, rating: "thumbs-up" | "thumbs-down") => {
    console.log(`Rating message ${messageId}: ${rating}`)
    // ここで評価を保存する処理を追加できます
  }

  // 提案メッセージ
  const suggestions = [
    "こんにちは！何かお手伝いできることはありますか？",
    "コードの説明をお願いします",
    "バグの修正方法を教えてください",
    "新しい機能のアイデアを聞かせてください"
  ]

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">初期化中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI チャット</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <ModelSwitcher
            currentProvider={currentProvider}
            currentModel={currentModel}
            onProviderChange={setCurrentProvider}
            onModelChange={setCurrentModel}
            availableModels={getAvailableModelsForProvider(currentProvider)}
          />
          
          <AutoModeSwitcher
            autoMode={autoMode}
            onAutoModeChange={setAutoMode}
          />
          
          <AddContextButton />
        </div>
      </div>

      {/* 接続状態 */}
      <div className="px-4 py-2 bg-muted/50">
        <div className="flex items-center space-x-2 text-sm">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-muted-foreground">{getConnectionMessage()}</span>
        </div>
      </div>

      {/* エラーメッセージ */}
      {userFriendlyError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{userFriendlyError}</span>
          </div>
        </div>
      )}

      {/* チャットエリア */}
      <div className="flex-1">
        <EnhancedChat
          messages={messages}
          input={input}
          handleInputChange={setInput}
          handleSubmit={handleSubmit}
          isGenerating={isGenerating}
          suggestions={suggestions}
          onRateResponse={handleRateResponse}
          placeholder="メッセージを入力してください..."
        />
      </div>

      {/* 統合パネル */}
      {showMulmocastIntegration && (
        <MulmocastIntegration
          isOpen={showMulmocastIntegration}
          onClose={() => setShowMulmocastIntegration(false)}
        />
      )}

      {showVideoWorkflow && (
        <VideoGenerationWorkflow
          isOpen={showVideoWorkflow}
          onClose={() => setShowVideoWorkflow(false)}
        />
      )}
    </div>
  )
}
