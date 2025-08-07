#!/bin/bash

# Ollamaセットアップスクリプト
# Armisプロジェクト用

set -e

echo "🚀 Ollamaセットアップを開始します..."

# OS判定
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    echo "❌ サポートされていないOSです: $OSTYPE"
    exit 1
fi

echo "📋 検出されたOS: $OS"

# Ollamaのインストール
install_ollama() {
    echo "📦 Ollamaをインストールしています..."
    
    if command -v ollama &> /dev/null; then
        echo "✅ Ollamaは既にインストールされています"
        return 0
    fi
    
    case $OS in
        "linux")
            curl -fsSL https://ollama.ai/install.sh | sh
            ;;
        "macos")
            # Homebrewを使用
            if command -v brew &> /dev/null; then
                brew install ollama
            else
                echo "❌ Homebrewがインストールされていません"
                echo "https://brew.sh からHomebrewをインストールしてください"
                exit 1
            fi
            ;;
        "windows")
            echo "❌ Windowsでは手動でOllamaをインストールしてください"
            echo "https://ollama.ai/download からダウンロードしてください"
            exit 1
            ;;
    esac
    
    echo "✅ Ollamaのインストールが完了しました"
}

# 推奨モデルのダウンロード
download_models() {
    echo "📥 推奨モデルをダウンロードしています..."
    
    # サーバーが起動しているかチェック
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo "⚠️  Ollamaサーバーが起動していません"
        echo "以下のコマンドでサーバーを起動してください:"
        echo "ollama serve"
        echo ""
        echo "サーバーを起動した後、このスクリプトを再実行してください"
        exit 1
    fi
    
    # 推奨モデルリスト
    models=(
        "llama3.1:8b"
        "mistral:7b"
        "gemma3:2b"
        "codellama:7b"
        "phi3:mini"
        "qwen2.5:1.5b"
    )
    
    for model in "${models[@]}"; do
        echo "📥 $model をダウンロード中..."
        if ollama pull "$model"; then
            echo "✅ $model のダウンロードが完了しました"
        else
            echo "❌ $model のダウンロードに失敗しました"
        fi
    done
}

# 設定の確認
check_config() {
    echo "🔧 設定を確認しています..."
    
    # 環境変数の確認
    if [[ -z "$OLLAMA_HOST" ]]; then
        echo "ℹ️  OLLAMA_HOST環境変数が設定されていません"
        echo "デフォルトの http://localhost:11434 を使用します"
    else
        echo "✅ OLLAMA_HOST: $OLLAMA_HOST"
    fi
    
    # サーバーの状態確認
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo "✅ Ollamaサーバーが正常に動作しています"
        
        # 利用可能なモデルを表示
        echo "📋 利用可能なモデル:"
        ollama list | grep -E "^NAME" -A 100 | tail -n +2 | while read line; do
            if [[ -n "$line" ]]; then
                echo "  - $line"
            fi
        done
    else
        echo "❌ Ollamaサーバーに接続できません"
        echo "以下のコマンドでサーバーを起動してください:"
        echo "ollama serve"
    fi
}

# メイン処理
main() {
    echo "🎯 Armis Ollamaセットアップ"
    echo "================================"
    
    install_ollama
    
    echo ""
    echo "🔄 Ollamaサーバーを起動しています..."
    echo "注意: このスクリプトはサーバーを起動しません"
    echo "以下のコマンドでサーバーを起動してください:"
    echo "ollama serve"
    echo ""
    
    read -p "サーバーを起動しましたか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        download_models
        check_config
    else
        echo "⚠️  サーバーを起動してから再度実行してください"
        exit 1
    fi
    
    echo ""
    echo "🎉 Ollamaセットアップが完了しました！"
    echo ""
    echo "次のステップ:"
    echo "1. Armisアプリケーションを起動"
    echo "2. 設定画面で「Ollama」タブを確認"
    echo "3. チャット画面でOllamaプロバイダーを選択"
    echo "4. ダウンロードしたモデルでチャット開始"
    echo ""
    echo "詳細は README.md を参照してください"
}

# スクリプト実行
main "$@" 