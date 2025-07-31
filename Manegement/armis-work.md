# Armis: マルチモーダルIDE - 開発手順書

## 1. プロジェクト概要

### 1.1 プロジェクト名
**Armis** - マルチモーダルIDE (Multimodal IDE)

### 1.2 開発目標
- VSCode、ComfyUI、Blender、ControlNet、TTS、LTX-Video、FastVideo、llama.cpp、MLC-LLM、RecAI技術を統合
- AI駆動の直感的なマルチメディア編集環境を構築
- オフィス用途に特化した高品質動画制作プラットフォームを実現

## 2. 技術スタック

### 2.1 基盤技術
- **フロントエンド**: React + Electron
- **UI設計**: VSCode + ChatGPT x Cursor スタイル
- **バックエンド**: Node.js + TypeScript
- **データベース**: Supabase
- **AI統合**: mulmocast-cli技術

### 2.2 AI技術スタック
- **言語処理**: LLM, OpenAI, Claude
- **ローカルLLM**: llama.cpp
- **エッジLLM**: MLC-LLM
- **画像生成**: ComfyUI
- **音声合成**: Coqui TTS, Tortoise TTS
- **音声認識**: Whisper
- **3D AI編集**: blender-mcp
- **条件付き制御**: ControlNet
- **動画処理**: LTX-Video + FastVideo
- **レコメンダーシステム**: RecAI


## 3. 開発フェーズ

### 3.1 Phase 1: MVP開発 (3ヶ月)

#### 3.1.1 週1-2: プロジェクト基盤構築
```bash
# プロジェクト初期化
mkdir armis
cd armis
npm init -y

# Electron + React セットアップ
npm install electron electron-builder react react-dom
npm install --save-dev @types/react @types/react-dom typescript

# VSCode風UI基盤
npm install @radix-ui/react-* lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3.1.2 週3-4: 基本UIコンポーネント実装
```typescript
// components/layout/main-layout.tsx
import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* VSCode風レイアウト */}
      <div className="flex flex-col w-full">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </div>
  )
}
```

#### 3.1.3 週5-6: チャットパネル実装
```typescript
// components/chat/chat-panel.tsx
import React, { useState } from 'react'

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = async (message: string) => {
    // AI処理ロジック
    const response = await processAICommand(message)
    setMessages(prev => [...prev, { type: 'user', content: message }, { type: 'ai', content: response }])
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  )
}
```

#### 3.1.4 週7-8: ファイルアップロード機能
```typescript
// components/upload/file-upload.tsx
import React from 'react'

export function FileUpload() {
  const handleFileUpload = async (files: FileList) => {
    for (const file of files) {
      await uploadFile(file)
    }
  }

  return (
    <div className="p-4">
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.txt"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-gray-400">ファイルをドラッグ&ドロップまたはクリックしてアップロード</p>
        </label>
      </div>
    </div>
  )
}
```

#### 3.1.5 週9-10: Whisper音声認識統合
```typescript
// services/whisper.ts
import OpenAI from 'openai'

const openai = new OpenAI()

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.wav')
  formData.append('model', 'whisper-1')

  const response = await openai.audio.transcriptions.create({
    file: audioBlob,
    model: 'whisper-1',
  })

  return response.text
}
```

#### 3.1.6 週11-12: 基本動画編集機能
```typescript
// components/video/video-editor.tsx
import React from 'react'

export function VideoEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [edits, setEdits] = useState<Edit[]>([])

  const applyEdit = async (edit: Edit) => {
    // 動画編集ロジック
    const processedVideo = await processVideo(videoFile, edit)
    setEdits(prev => [...prev, edit])
  }

  return (
    <div className="flex flex-col h-full">
      <VideoPreview video={videoFile} />
      <Timeline edits={edits} onEdit={applyEdit} />
    </div>
  )
}
```

### 3.2 Phase 2: AI機能統合 (6ヶ月)

#### 3.2.1 月1: ComfyUIノードシステム統合
```typescript
// components/comfyui/node-graph.tsx
import React from 'react'

interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  inputs: string[]
  outputs: string[]
}

export function NodeGraph() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  const addNode = (nodeType: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: generateId(),
      type: nodeType,
      position,
      inputs: [],
      outputs: []
    }
    setNodes(prev => [...prev, newNode])
  }

  return (
    <div className="w-full h-full bg-gray-900">
      <NodeToolbar onAddNode={addNode} />
      <NodeCanvas nodes={nodes} connections={connections} />
    </div>
  )
}
```

#### 3.2.2 月2: mulmocast-cli技術統合
```typescript
// services/mulmocast.ts
import { MulmocastProcessor } from './mulmocast-processor'

export class ArmisMulmocastProcessor extends MulmocastProcessor {
  async processMultimodalInput(input: MultimodalInput): Promise<ProcessedOutput> {
    // マルチモーダル処理ロジック
    const processedText = await this.processText(input.text)
    const processedImage = await this.processImage(input.image)
    const processedAudio = await this.processAudio(input.audio)
    
    return this.combineResults(processedText, processedImage, processedAudio)
  }
}
```

#### 3.2.3 月3: Blender統合（基本機能）
```typescript
// services/blender/blender-service.ts
export class BlenderService {
  private blenderProcess: ChildProcess | null = null

  async initialize(): Promise<void> {
    // Blenderプロセス起動
    this.blenderProcess = spawn('blender', ['--background', '--python', 'blender_script.py'])
  }

  async create3DScene(sceneData: SceneData): Promise<string> {
    // 3Dシーン作成
    const script = this.generateBlenderScript(sceneData)
    await this.executeBlenderScript(script)
    return this.renderScene()
  }
}
```

#### 3.2.4 月4: ControlNet基本機能統合
```typescript
// services/controlnet/controlnet-service.ts
export class ControlNetService {
  async applyControl(controlType: ControlType, controlImage: Image, targetImage: Image): Promise<Image> {
    const controlMap = await this.generateControlMap(controlType, controlImage)
    const result = await this.processWithControl(targetImage, controlMap)
    return result
  }

  private async generateControlMap(type: ControlType, image: Image): Promise<ControlMap> {
    switch (type) {
      case 'edge':
        return this.generateEdgeMap(image)
      case 'depth':
        return this.generateDepthMap(image)
      case 'pose':
        return this.generatePoseMap(image)
      default:
        throw new Error(`Unknown control type: ${type}`)
    }
  }
}
```

#### 3.2.5 月5: TTS統合
```typescript
// services/tts/tts-service.ts
export class TTSService {
  private coquiTTS: CoquiTTS
  private tortoiseTTS: TortoiseTTS

  async synthesizeSpeech(text: string, voice: VoiceConfig): Promise<AudioBuffer> {
    switch (voice.engine) {
      case 'coqui':
        return this.coquiTTS.synthesize(text, voice)
      case 'tortoise':
        return this.tortoiseTTS.synthesize(text, voice)
      default:
        throw new Error(`Unknown TTS engine: ${voice.engine}`)
    }
  }
}
```

#### 3.2.6 月6: ローカルLLM統合（llama.cpp）
```typescript
// services/llm/llama-service.ts
export class LlamaService {
  private llamaProcess: ChildProcess | null = null

  async initialize(modelPath: string): Promise<void> {
    // llama.cppプロセス起動
    this.llamaProcess = spawn('./llama', [
      '--model', modelPath,
      '--ctx-size', '4096',
      '--threads', '8'
    ])
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.sendToLlama(prompt)
    return this.parseLlamaResponse(response)
  }
}
```

### 3.3 Phase 3: 高度機能統合 (9ヶ月)

#### 3.3.1 月7: blender-mcp統合
```typescript
// services/blender/blender-mcp.ts
export class BlenderMCPService {
  async executeAICommand(command: string): Promise<BlenderResult> {
    // AI駆動3D編集コマンド実行
    const parsedCommand = await this.parseAICommand(command)
    const blenderScript = this.generateBlenderScript(parsedCommand)
    return this.executeBlenderScript(blenderScript)
  }
}
```

#### 3.3.2 月8: 高速動画処理統合（LTX-Video + FastVideo）
```typescript
// services/video/fast-video-service.ts
export class FastVideoService {
  async processVideo(videoFile: File, options: VideoProcessingOptions): Promise<ProcessedVideo> {
    // 高速動画処理
    const processedFrames = await this.processFrames(videoFile, options)
    const outputVideo = await this.combineFrames(processedFrames)
    return outputVideo
  }

  async batchProcess(videos: File[]): Promise<ProcessedVideo[]> {
    // バッチ処理
    return Promise.all(videos.map(video => this.processVideo(video, {})))
  }
}
```

#### 3.3.3 月9: エッジLLM統合（MLC-LLM）
```typescript
// services/llm/mlc-llm-service.ts
export class MLCLLMService {
  async initialize(modelConfig: ModelConfig): Promise<void> {
    // MLC-LLM初期化
    await this.loadModel(modelConfig)
    await this.optimizeForDevice()
  }

  async generateResponse(prompt: string): Promise<string> {
    // エッジデバイスでのLLM処理
    const response = await this.processOnDevice(prompt)
    return response
  }
}
```

### 3.4 Phase 4: エンタープライズ機能 (11ヶ月)

#### 3.4.1 月10: RecAI統合
```typescript
// services/recommendation/recai-service.ts
export class RecAIService {
  async getRecommendations(userInput: string, context: UserContext): Promise<Recommendation[]> {
    // LLM統合レコメンダーシステム
    const recommendations = await this.intelligentRecommendation(userInput, context)
    return this.explainRecommendations(recommendations)
  }
}
```



#### 3.4.2 月11: プラグインシステム実装
```typescript
// services/plugin/plugin-manager.ts
export class PluginManager {
  async loadPlugin(pluginPath: string): Promise<Plugin> {
    // プラグイン読み込み
    const plugin = await this.loadPluginModule(pluginPath)
    await this.validatePlugin(plugin)
    await this.initializePlugin(plugin)
    return plugin
  }
}
```

## 4. 開発環境セットアップ

### 4.1 必要なソフトウェア
```bash
# Node.js 18+
node --version

# Python 3.9+
python --version

# Git
git --version

# Blender 3.0+
blender --version

# FFmpeg
ffmpeg -version

# CUDA Toolkit (GPU使用時)
nvcc --version
```

### 4.2 開発環境構築
```bash
# リポジトリクローン
git clone https://github.com/your-org/armis.git
cd armis

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# Electronアプリ起動
npm run electron:dev
```

### 4.3 環境変数設定
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
BLENDER_PATH=/path/to/blender
LLAMA_MODEL_PATH=/path/to/llama/model
```

## 5. テスト戦略

### 5.1 単体テスト
```typescript
// __tests__/services/tts.test.ts
import { TTSService } from '../services/tts/tts-service'

describe('TTSService', () => {
  let ttsService: TTSService

  beforeEach(() => {
    ttsService = new TTSService()
  })

  test('should synthesize speech with Coqui TTS', async () => {
    const audio = await ttsService.synthesizeSpeech('Hello world', {
      engine: 'coqui',
      voice: 'en_female'
    })
    expect(audio).toBeDefined()
  })
})
```

### 5.2 統合テスト
```typescript
// __tests__/integration/video-editing.test.ts
import { VideoEditor } from '../components/video/video-editor'

describe('Video Editor Integration', () => {
  test('should process video with AI commands', async () => {
    const editor = new VideoEditor()
    const result = await editor.processWithAI('Add text overlay to video')
    expect(result).toBeDefined()
  })
})
```

### 5.3 E2Eテスト
```typescript
// __tests__/e2e/workflow.test.ts
import { test, expect } from '@playwright/test'

test('complete video editing workflow', async ({ page }) => {
  await page.goto('/')
  
  // ファイルアップロード
  await page.setInputFiles('input[type="file"]', 'test-video.mp4')
  
  // AI指示入力
  await page.fill('[data-testid="chat-input"]', 'Add background music')
  await page.click('[data-testid="send-button"]')
  
  // 結果確認
  await expect(page.locator('[data-testid="processed-video"]')).toBeVisible()
})
```

## 6. デプロイメント

### 6.1 開発環境
```bash
# 開発ビルド
npm run build:dev

# 開発サーバー起動
npm run start:dev
```

### 6.2 本番環境
```bash
# 本番ビルド
npm run build:prod

# Electronアプリパッケージング
npm run electron:build

# Dockerイメージビルド
docker build -t armis .
```

### 6.3 CI/CD設定
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 7. パフォーマンス最適化

### 7.1 フロントエンド最適化
```typescript
// 遅延読み込み
const VideoEditor = lazy(() => import('./components/video/video-editor'))

// メモ化
const MemoizedNodeGraph = memo(NodeGraph)

// 仮想化
const VirtualizedTimeline = ({ items }: { items: TimelineItem[] }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {TimelineItem}
    </FixedSizeList>
  )
}
```

### 7.2 バックエンド最適化
```typescript
// キャッシュ戦略
const cache = new Map()

export async function getCachedResult(key: string, fn: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const result = await fn()
  cache.set(key, result)
  return result
}

// 並列処理
export async function processMultipleVideos(videos: File[]) {
  const chunks = chunk(videos, 4) // 4つずつ処理
  const results = await Promise.all(
    chunks.map(chunk => Promise.all(chunk.map(processVideo)))
  )
  return results.flat()
}
```

## 8. セキュリティ対策

### 8.1 入力検証
```typescript
// 入力サニタイゼーション
import { z } from 'zod'

const UserInputSchema = z.object({
  text: z.string().max(1000),
  file: z.instanceof(File).optional(),
  url: z.string().url().optional()
})

export function validateUserInput(input: unknown) {
  return UserInputSchema.parse(input)
}
```

### 8.2 ファイル処理セキュリティ
```typescript
// ファイルタイプ検証
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// ファイルサイズ制限
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}
```

## 9. 監視・ログ

### 9.1 ログ設定
```typescript
// services/logging/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### 9.2 パフォーマンス監視
```typescript
// services/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || []
    return values.reduce((a, b) => a + b, 0) / values.length
  }
}
```

## 10. ドキュメント

### 10.1 API ドキュメント
```typescript
/**
 * 動画編集サービス
 * @param videoFile - 編集対象の動画ファイル
 * @param options - 編集オプション
 * @returns 編集済み動画ファイル
 */
export async function editVideo(
  videoFile: File,
  options: VideoEditOptions
): Promise<File> {
  // 実装
}
```

### 10.2 ユーザーガイド
```markdown
# Armis ユーザーガイド

## 基本的な使い方

1. ファイルをアップロード
2. チャットで編集指示を入力
3. AIが自動で編集を実行
4. 結果を確認・ダウンロード

## 高度な機能

- 3D動画編集
- 音声合成
- 条件付き制御
- ローカルLLM実行
```

## 11. 今後の拡張計画

### 11.1 短期目標（3ヶ月後）
- [ ] モバイルアプリ版開発
- [ ] クラウド同期機能
- [ ] チーム協業機能

### 11.2 中期目標（6ヶ月後）
- [ ] API提供開始
- [ ] サードパーティ連携
- [ ] 国際化対応

### 11.3 長期目標（11ヶ月後）
- [ ] エンタープライズ版開発
- [ ] AIモデルカスタマイズ機能
- [ ] 高度な分析機能

この開発手順書に従って、段階的にArmisの開発を進めることで、革新的なマルチモーダルIDEの実現が可能になります。 