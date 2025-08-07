# Armis - AI-Powered Content Creation Platform

## 概要

Armisは、AIを活用したコンテンツ作成プラットフォームです。チャット機能、動画生成、Mulmocast連携など、多様なコンテンツ作成ツールを提供します。

## 主な機能

### 🤖 AIチャット機能
- 複数のAIプロバイダー（Google Gemini、Ollama、Anthropic、OpenAI等）をサポート
- ストリーミングレスポンス
- リアルタイムチャット履歴

### 🌐 Webreader連携
- **URL自動検出**: チャット欄にURLを入力すると自動的に検出
- **Webreader Extract Text**: Webreader APIを使用してURLからテキストを抽出
- **フォールバック機能**: Webreaderが失敗した場合は既存のscrape APIを使用
- **進捗表示**: URL処理中のローディングインジケーター
- **結果表示**: 抽出されたコンテンツのタイトル、説明、内容を表示

#### Webreader機能の使用方法
1. チャット欄にURLを含むメッセージを入力
2. システムが自動的にURLを検出
3. Webreaderでテキスト抽出を実行
4. 抽出されたコンテンツがAIに送信され、分析結果を取得

例：
```
https://ja.wikipedia.org/wiki/ヴァイキング について教えてください
```

### 🎬 動画生成機能
- Mulmocast連携による動画スクリプト生成
- 動画生成ワークフロー
- テンプレートベースの動画作成

### 📁 ファイル管理
- ファイルアップロード機能
- 複数ファイル形式対応
- ドラッグ&ドロップ対応

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **AI**: Google Gemini, Ollama, Anthropic, OpenAI
- **Webreader**: Webreader API統合
- **データベース**: Supabase
- **認証**: Supabase Auth

## セットアップ

### 前提条件
- Node.js 18以上
- npm または pnpm

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
```

### 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```env
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key_here

# その他のAIプロバイダー（オプション）
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
MOONSHOT_API_KEY=your_moonshot_api_key_here
XAI_API_KEY=your_xai_api_key_here
CURSOR_API_KEY=your_cursor_api_key_here
FIREWORKS_API_KEY=your_fireworks_api_key_here

# Ollama設定（オプション）
OLLAMA_HOST=http://localhost:11434

# Supabase設定（オプション）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Ollamaのセットアップ

ArmisはローカルOllamaサーバーをサポートしています。

#### 1. Ollamaのインストール

[ollama.ai](https://ollama.ai)からOllamaをダウンロードしてインストールしてください。

#### 2. モデルのダウンロード

```bash
# 推奨モデルをダウンロード
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull gemma3:2b
```

#### 3. サーバーの起動

```bash
# Ollamaサーバーを起動
ollama serve
```

#### 4. Armisでの使用

1. Armisアプリケーションを起動
2. 設定画面で「Ollama」タブを選択
3. チャット画面でOllamaプロバイダーを選択
4. ダウンロードしたモデルを使用してチャット開始

### 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## Webreader機能の詳細

### URL検出
- 正規表現を使用してURLを自動検出
- 複数のURLを同時に処理可能
- 無効なURLは自動的に除外

### テキスト抽出プロセス
1. **Webreader API優先**: まずWebreader APIを使用してテキスト抽出を試行
2. **フォールバック**: Webreaderが失敗した場合は既存のscrape APIを使用
3. **エラーハンドリング**: 両方のAPIが失敗した場合はエラーメッセージを表示

### 抽出されたコンテンツの表示
- タイトル
- 説明（最初の200文字）
- コンテンツ（最初の100文字）
- 読みやすさスコア
- 処理状況メッセージ

### AIへの送信形式
抽出されたコンテンツは以下の形式でAIに送信されます：

```
[Web Content from https://example.com]
Title: ページタイトル
Description: ページの説明
Content: 抽出されたテキストコンテンツ

User Message: ユーザーの元のメッセージ

Please analyze the web content and respond to the user's message.
```

## 開発

### プロジェクト構造

```
armis/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/          # チャットAPI
│   │   ├── scrape/        # スクレイピングAPI
│   │   └── webreader/     # Webreader API
│   └── page.tsx           # メインページ
├── components/             # Reactコンポーネント
│   ├── ai-chat.tsx        # AIチャットコンポーネント
│   └── ui/                # UIコンポーネント
├── lib/                    # ユーティリティ
│   ├── ai-providers.ts    # AIプロバイダー
│   ├── webreader-client.ts # Webreaderクライアント
│   └── url-utils.ts       # URL処理ユーティリティ
└── hooks/                  # React Hooks
    └── use-ai.ts          # AIフック
```

### 新しいAIプロバイダーの追加

1. `lib/ai-providers.ts`に新しいプロバイダークラスを追加
2. `AIProvider`型に新しいプロバイダーを追加
3. `AIProviderFactory`に新しいプロバイダーを登録

### Webreader機能の拡張

1. `lib/webreader-client.ts`でWebreader APIクライアントを拡張
2. `lib/url-utils.ts`でURL処理ロジックをカスタマイズ
3. `components/ai-chat.tsx`でUI表示を調整

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。 