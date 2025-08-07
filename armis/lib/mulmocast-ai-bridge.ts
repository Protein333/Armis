import { MulmocastMessage } from './mulmocast'

export interface VideoScriptData {
  title: string
  description: string
  scenes: VideoScene[]
  duration: number
  targetAudience: string
  style: 'educational' | 'promotional' | 'entertainment' | 'corporate'
}

export interface VideoScene {
  id: string
  title: string
  description: string
  duration: number
  visualElements: string[]
  audioElements: string[]
  transitions: string[]
}

export interface StoryboardData {
  id: string
  title: string
  scenes: StoryboardScene[]
  totalDuration: number
  style: string
}

export interface StoryboardScene {
  id: string
  sceneNumber: number
  title: string
  description: string
  duration: number
  visualDescription: string
  audioDescription: string
  cameraAngle: string
  lighting: string
  props: string[]
}

export interface MulmocastCommand {
  type: 'script' | 'storyboard' | 'command'
  content: string
  projectId: string
  timestamp: string
  metadata?: {
    template?: string
    style?: string
    duration?: number
    targetAudience?: string
  }
}

export interface MulmocastProgress {
  projectId: string
  progress: number
  status: 'idle' | 'processing' | 'completed' | 'error'
  message?: string
  error?: string
}

export class MulmocastAIBridge {
  private static instance: MulmocastAIBridge

  static getInstance(): MulmocastAIBridge {
    if (!MulmocastAIBridge.instance) {
      MulmocastAIBridge.instance = new MulmocastAIBridge()
    }
    return MulmocastAIBridge.instance
  }

  /**
   * AIレスポンスを動画スクリプトデータに変換
   */
  convertAIResponseToVideoScript(aiResponse: string, template?: string): VideoScriptData {
    // AIレスポンスを解析して構造化データに変換
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    const title = this.extractTitle(lines)
    const description = this.extractDescription(lines)
    const scenes = this.extractScenes(lines)
    const duration = this.calculateDuration(scenes)
    const targetAudience = this.extractTargetAudience(lines)
    const style = this.determineStyle(lines)

    return {
      title,
      description,
      scenes,
      duration,
      targetAudience,
      style
    }
  }

  /**
   * AIレスポンスをストーリーボードデータに変換
   */
  convertAIResponseToStoryboard(aiResponse: string): StoryboardData {
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    const title = this.extractTitle(lines)
    const scenes = this.extractStoryboardScenes(lines)
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0)
    const style = this.determineStyle(lines)

    return {
      id: Date.now().toString(),
      title,
      scenes,
      totalDuration,
      style
    }
  }

  /**
   * 動画スクリプトデータをmulmocastコマンドに変換
   */
  convertVideoScriptToMulmocastCommand(
    videoScript: VideoScriptData, 
    projectId: string,
    template?: string
  ): MulmocastCommand {
    const content = this.serializeVideoScript(videoScript)
    
    return {
      type: 'script',
      content,
      projectId,
      timestamp: new Date().toISOString(),
      metadata: {
        template,
        style: videoScript.style,
        duration: videoScript.duration,
        targetAudience: videoScript.targetAudience
      }
    }
  }

  /**
   * ストーリーボードデータをmulmocastコマンドに変換
   */
  convertStoryboardToMulmocastCommand(
    storyboard: StoryboardData,
    projectId: string
  ): MulmocastCommand {
    const content = this.serializeStoryboard(storyboard)
    
    return {
      type: 'storyboard',
      content,
      projectId,
      timestamp: new Date().toISOString(),
      metadata: {
        style: storyboard.style,
        duration: storyboard.totalDuration
      }
    }
  }

  /**
   * mulmocastメッセージをプログレスデータに変換
   */
  parseMulmocastMessage(message: MulmocastMessage): MulmocastProgress | null {
    try {
      if (message.content.startsWith('{')) {
        const data = JSON.parse(message.content)
        
        if (data.projectId && data.progress !== undefined) {
          return {
            projectId: data.projectId,
            progress: data.progress,
            status: data.status || 'processing',
            message: data.message,
            error: data.error
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to parse mulmocast message:', error)
      return null
    }
  }

  /**
   * 動画制作用のプロンプトテンプレートを生成
   */
  generateVideoPromptTemplate(aiResponse: string, templateType: string): string {
    const templates = {
      basic: `動画制作指示: ${aiResponse}\n\n動画の構成：\n1. 導入（10秒）\n2. メインコンテンツ（30秒）\n3. まとめ（10秒）`,
      educational: `教育動画制作: ${aiResponse}\n\n構成：\n1. 学習目標の提示\n2. 概念の説明\n3. 具体例の提示\n4. 練習問題\n5. まとめ`,
      promotional: `プロモーション動画制作: ${aiResponse}\n\n構成：\n1. 注目を引く導入\n2. 問題提起\n3. ソリューション提示\n4. メリット説明\n5. 行動喚起`,
      storyboard: `ストーリーボード生成: ${aiResponse}\n\n各シーンの詳細：\n- シーン1: 導入\n- シーン2: 展開\n- シーン3: クライマックス\n- シーン4: 結末`
    }

    return templates[templateType as keyof typeof templates] || templates.basic
  }

  // プライベートメソッド

  private extractTitle(lines: string[]): string {
    // 最初の行または「タイトル:」で始まる行を探す
    for (const line of lines) {
      if (line.includes('タイトル:') || line.includes('Title:')) {
        return line.split(':')[1]?.trim() || 'Untitled'
      }
    }
    return lines[0]?.trim() || 'Untitled'
  }

  private extractDescription(lines: string[]): string {
    // 説明文を探す
    for (const line of lines) {
      if (line.includes('説明:') || line.includes('Description:')) {
        return line.split(':')[1]?.trim() || ''
      }
    }
    return lines.slice(1, 3).join(' ').trim() || ''
  }

  private extractScenes(lines: string[]): VideoScene[] {
    const scenes: VideoScene[] = []
    let currentScene: Partial<VideoScene> | null = null

    for (const line of lines) {
      if (line.match(/^シーン\d+:/) || line.match(/^Scene \d+:/)) {
        if (currentScene) {
          scenes.push(currentScene as VideoScene)
        }
        
        const sceneNumber = scenes.length + 1
        currentScene = {
          id: `scene-${sceneNumber}`,
          title: line.split(':')[1]?.trim() || `Scene ${sceneNumber}`,
          description: '',
          duration: 10,
          visualElements: [],
          audioElements: [],
          transitions: []
        }
      } else if (currentScene) {
        currentScene.description += line + ' '
      }
    }

    if (currentScene) {
      scenes.push(currentScene as VideoScene)
    }

    return scenes
  }

  private extractStoryboardScenes(lines: string[]): StoryboardScene[] {
    const scenes: StoryboardScene[] = []
    let currentScene: Partial<StoryboardScene> | null = null

    for (const line of lines) {
      if (line.match(/^シーン\d+:/) || line.match(/^Scene \d+:/)) {
        if (currentScene) {
          scenes.push(currentScene as StoryboardScene)
        }
        
        const sceneNumber = scenes.length + 1
        currentScene = {
          id: `storyboard-scene-${sceneNumber}`,
          sceneNumber,
          title: line.split(':')[1]?.trim() || `Scene ${sceneNumber}`,
          description: '',
          duration: 10,
          visualDescription: '',
          audioDescription: '',
          cameraAngle: 'medium shot',
          lighting: 'natural',
          props: []
        }
      } else if (currentScene) {
        currentScene.description += line + ' '
      }
    }

    if (currentScene) {
      scenes.push(currentScene as StoryboardScene)
    }

    return scenes
  }

  private calculateDuration(scenes: VideoScene[]): number {
    return scenes.reduce((sum, scene) => sum + scene.duration, 0)
  }

  private extractTargetAudience(lines: string[]): string {
    for (const line of lines) {
      if (line.includes('対象:') || line.includes('Target:')) {
        return line.split(':')[1]?.trim() || 'General'
      }
    }
    return 'General'
  }

  private determineStyle(lines: string[]): VideoScriptData['style'] {
    const text = lines.join(' ').toLowerCase()
    
    if (text.includes('教育') || text.includes('educational')) return 'educational'
    if (text.includes('プロモーション') || text.includes('promotional')) return 'promotional'
    if (text.includes('エンターテイメント') || text.includes('entertainment')) return 'entertainment'
    if (text.includes('企業') || text.includes('corporate')) return 'corporate'
    
    return 'educational'
  }

  private serializeVideoScript(videoScript: VideoScriptData): string {
    return JSON.stringify({
      type: 'video_script',
      data: videoScript
    }, null, 2)
  }

  private serializeStoryboard(storyboard: StoryboardData): string {
    return JSON.stringify({
      type: 'storyboard',
      data: storyboard
    }, null, 2)
  }
}

// シングルトンインスタンスをエクスポート
export const mulmocastAIBridge = MulmocastAIBridge.getInstance() 