# Mulmocast CLI Integration

このドキュメントでは、armisプロジェクトでmulmocast-cliの機能を内部で使用する方法について説明します。

## 概要

mulmocast-cliは、AIを活用したマルチモーダルプレゼンテーション生成ツールです。armisプロジェクトでは、このツールの機能をAPIエンドポイントを通じて利用できます。

## 利用可能な機能

### 1. コンテンツ生成

#### 音声生成
```typescript
import { createMulmocastClient } from '@/lib/mulmocast'

const client = createMulmocastClient()
const result = await client.generateAudio('script.json', {
  outdir: './output',
  lang: 'en',
  force: true
})
```

#### 画像生成
```typescript
const result = await client.generateImages('script.json', {
  outdir: './output',
  imagedir: './images',
  presentationStyle: 'business'
})
```

#### 動画生成
```typescript
const result = await client.generateMovie('script.json', {
  outdir: './output',
  audiodir: './audio',
  imagedir: './images',
  caption: 'en'
})
```

#### PDF生成
```typescript
const result = await client.generatePDF('script.json', {
  outdir: './output',
  pdf_mode: 'slide',
  pdf_size: 'a4'
})
```

### 2. スクリプト生成

```typescript
const result = await client.generateScript({
  template: 'business',
  urls: ['https://example.com'],
  script: 'my-script',
  llm: 'openai',
  llm_model: 'gpt-4'
})
```

## APIエンドポイント

### 生成API
- `POST /api/mulmocast/generate` - コンテンツ生成
- `GET /api/mulmocast/generate` - 生成タイプの情報取得

### スクリプト生成API
- `POST /api/mulmocast/scripting` - スクリプト生成
- `GET /api/mulmocast/scripting` - 利用可能なテンプレート取得

## 利用可能なテンプレート

- `business` - ビジネスプレゼンテーション
- `coding` - コーディングチュートリアル
- `podcast_standard` - 標準ポッドキャスト
- `ghibli_comic` - ジブリ風コミック
- `children_book` - 子供向け絵本
- `comic_strips` - コミックストリップ
- その他多数

## 利用可能な生成タイプ

- `audio` - 音声ファイル生成
- `images` - 画像ファイル生成
- `movie` - 動画ファイル生成
- `pdf` - PDFファイル生成

## 設定オプション

### 生成オプション
- `outdir` - 出力ディレクトリ
- `basedir` - ベースディレクトリ
- `lang` - 言語 ('en' | 'ja')
- `force` - 強制再生成
- `presentationStyle` - プレゼンテーションスタイル
- `audiodir` - 音声出力ディレクトリ
- `imagedir` - 画像出力ディレクトリ
- `caption` - 字幕言語
- `pdf_mode` - PDFモード ('slide' | 'talk' | 'handout')
- `pdf_size` - PDFサイズ ('letter' | 'a4')

### スクリプト生成オプション
- `template` - テンプレート名
- `urls` - 参照URL配列
- `inputFile` - 入力ファイル
- `interactive` - インタラクティブモード
- `script` - スクリプトファイル名
- `llm` - LLMプロバイダー
- `llm_model` - LLMモデル名
- `cache` - キャッシュディレクトリ

## テスト

mulmocast-cliの機能をテストするには：

```bash
# 基本テスト
npm run test-mulmocast

# 完全テスト（テストスクリプト作成含む）
npm run test-mulmocast-full
```

## エラーハンドリング

すべてのAPI呼び出しは適切なエラーハンドリングを含んでいます：

```typescript
try {
  const result = await client.generateAudio('script.json')
  console.log('Success:', result)
} catch (error) {
  console.error('Error:', error.message)
}
```

## 注意事項

1. **APIキー**: mulmocast-cliを使用するには、適切なAI APIキーが必要です
2. **ファイルパス**: スクリプトファイルは絶対パスまたはプロジェクトルートからの相対パスで指定してください
3. **タイムアウト**: 生成処理には時間がかかる場合があります（最大5分のタイムアウト）
4. **出力ディレクトリ**: 出力ディレクトリが存在しない場合は自動的に作成されます

## 例

### 完全なワークフロー例

```typescript
import { createMulmocastClient } from '@/lib/mulmocast'

async function createPresentation() {
  const client = createMulmocastClient()
  
  try {
    // 1. スクリプト生成
    const scriptResult = await client.generateScript({
      template: 'business',
      urls: ['https://example.com/article'],
      script: 'presentation'
    })
    
    // 2. 音声生成
    const audioResult = await client.generateAudio('presentation.json', {
      outdir: './output',
      lang: 'en'
    })
    
    // 3. 画像生成
    const imageResult = await client.generateImages('presentation.json', {
      outdir: './output',
      imagedir: './images'
    })
    
    // 4. 動画生成
    const movieResult = await client.generateMovie('presentation.json', {
      outdir: './output',
      audiodir: './audio',
      imagedir: './images'
    })
    
    console.log('Presentation created successfully!')
    
  } catch (error) {
    console.error('Error creating presentation:', error)
  }
}
```

この統合により、armisアプリケーション内でmulmocast-cliの全機能を利用できるようになりました。 