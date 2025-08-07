import { useState, useEffect, useCallback } from 'react'
import { useMulmocast } from './use-mulmocast'
import { MulmocastMessage } from '@/lib/mulmocast'

interface VideoScriptTemplate {
  id: string
  name: string
  prompt: string
  description: string
}

interface MulmocastAIBridge {
  // 接続状態
  isConnected: boolean
  isProcessing: boolean
  
  // プロジェクト管理
  activeProjects: VideoProject[]
  currentProject: VideoProject | null
  
  // メッセージ管理
  mulmocastMessages: MulmocastMessage[]
  aiMessages: string[]
  
  // アクション
  sendToMulmocast: (content: string, type: 'script' | 'storyboard' | 'command') => Promise<void>
  generateVideoScript: (aiResponse: string, template?: string) => Promise<string>
  processMulmocastMessage: (message: MulmocastMessage) => void
  
  // テンプレート管理
  videoTemplates: VideoScriptTemplate[]
  addTemplate: (template: Omit<VideoScriptTemplate, 'id'>) => void
  removeTemplate: (id: string) => void
}

interface VideoProject {
  id: string
  title: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  type: 'script' | 'storyboard' | 'command'
  content: string
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_VIDEO_TEMPLATES: VideoScriptTemplate[] = [
  {
    id: 'basic-video',
    name: '基本動画制作',
    prompt: '以下の内容を基に動画を制作してください：\n\n{content}\n\n動画の構成：\n1. 導入（10秒）\n2. メインコンテンツ（30秒）\n3. まとめ（10秒）',
    description: '基本的な動画制作テンプレート'
  },
  {
    id: 'storyboard',
    name: 'ストーリーボード生成',
    prompt: '以下の内容を基にストーリーボードを生成してください：\n\n{content}\n\n各シーンの詳細：\n- シーン1: 導入\n- シーン2: 展開\n- シーン3: クライマックス\n- シーン4: 結末',
    description: 'ストーリーボード生成用テンプレート'
  },
  {
    id: 'educational',
    name: '教育動画',
    prompt: '以下の内容を基に教育動画を制作してください：\n\n{content}\n\n構成：\n1. 学習目標の提示\n2. 概念の説明\n3. 具体例の提示\n4. 練習問題\n5. まとめ',
    description: '教育目的の動画制作テンプレート'
  },
  {
    id: 'promotional',
    name: 'プロモーション動画',
    prompt: '以下の内容を基にプロモーション動画を制作してください：\n\n{content}\n\n構成：\n1. 注目を引く導入\n2. 問題提起\n3. ソリューション提示\n4. メリット説明\n5. 行動喚起',
    description: 'プロモーション動画制作テンプレート'
  }
]

export function useMulmocastAI(): MulmocastAIBridge {
  const [activeProjects, setActiveProjects] = useState<VideoProject[]>([])
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiMessages, setAiMessages] = useState<string[]>([])
  const [videoTemplates, setVideoTemplates] = useState<VideoScriptTemplate[]>(DEFAULT_VIDEO_TEMPLATES)

  const {
    client,
    isConnected,
    messages: mulmocastMessages,
    sendMessage,
    connect,
    disconnect
  } = useMulmocast({
    enabled: true,
    serverUrl: 'ws://localhost:8080',
    autoConnect: true
  })

  // mulmocastメッセージの処理
  useEffect(() => {
    if (mulmocastMessages.length > 0) {
      const latestMessage = mulmocastMessages[mulmocastMessages.length - 1]
      processMulmocastMessage(latestMessage)
    }
  }, [mulmocastMessages])

  const processMulmocastMessage = useCallback((message: MulmocastMessage) => {
    try {
      // JSONメッセージの処理
      if (message.content.startsWith('{')) {
        const data = JSON.parse(message.content)
        
        // プロジェクト進捗の更新
        if (data.projectId && data.progress !== undefined) {
          setActiveProjects(prev => prev.map(project => 
            project.id === data.projectId 
              ? { 
                  ...project, 
                  progress: data.progress, 
                  status: data.status || project.status,
                  updatedAt: new Date()
                }
              : project
          ))
        }
        
        // 完了メッセージの処理
        if (data.status === 'completed') {
          setAiMessages(prev => [...prev, `プロジェクト ${data.projectId} が完了しました`])
        }
        
        // エラーメッセージの処理
        if (data.status === 'error') {
          setAiMessages(prev => [...prev, `プロジェクト ${data.projectId} でエラーが発生しました: ${data.error}`])
        }
      } else {
        // 通常のテキストメッセージ
        setAiMessages(prev => [...prev, message.content])
      }
    } catch (error) {
      console.error('Failed to process mulmocast message:', error)
      setAiMessages(prev => [...prev, `メッセージ処理エラー: ${message.content}`])
    }
  }, [])

  const sendToMulmocast = useCallback(async (content: string, type: 'script' | 'storyboard' | 'command') => {
    if (!isConnected || !content.trim()) {
      throw new Error('Mulmocastに接続されていないか、コンテンツが空です')
    }

    setIsProcessing(true)
    
    try {
      const projectId = Date.now().toString()
      const newProject: VideoProject = {
        id: projectId,
        title: `${type === 'script' ? '動画制作' : type === 'storyboard' ? 'ストーリーボード' : 'コマンド'} プロジェクト`,
        status: 'idle',
        progress: 0,
        type,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setActiveProjects(prev => [...prev, newProject])
      setCurrentProject(newProject)

      // mulmocastに送信
      const mulmocastContent = {
        type,
        content,
        projectId,
        timestamp: new Date().toISOString()
      }

      await sendMessage(JSON.stringify(mulmocastContent), 'command')
      
      // プロジェクトを処理中に更新
      setActiveProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: 'processing' }
          : project
      ))

    } catch (error) {
      console.error('Failed to send to mulmocast:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, sendMessage])

  const generateVideoScript = useCallback(async (aiResponse: string, templateId?: string): Promise<string> => {
    if (!aiResponse.trim()) {
      throw new Error('AIレスポンスが空です')
    }

    const template = templateId 
      ? videoTemplates.find(t => t.id === templateId)
      : videoTemplates[0] // デフォルトテンプレート

    if (!template) {
      throw new Error('テンプレートが見つかりません')
    }

    // テンプレートにAIレスポンスを適用
    const generatedScript = template.prompt.replace('{content}', aiResponse)
    
    return generatedScript
  }, [videoTemplates])

  const addTemplate = useCallback((template: Omit<VideoScriptTemplate, 'id'>) => {
    const newTemplate: VideoScriptTemplate = {
      ...template,
      id: Date.now().toString()
    }
    setVideoTemplates(prev => [...prev, newTemplate])
  }, [])

  const removeTemplate = useCallback((id: string) => {
    setVideoTemplates(prev => prev.filter(template => template.id !== id))
  }, [])

  return {
    isConnected,
    isProcessing,
    activeProjects,
    currentProject,
    mulmocastMessages,
    aiMessages,
    sendToMulmocast,
    generateVideoScript,
    processMulmocastMessage,
    videoTemplates,
    addTemplate,
    removeTemplate
  }
} 