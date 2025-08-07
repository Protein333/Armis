#!/bin/bash

# ComfyUIセットアップスクリプト
echo "ComfyUIのセットアップを開始します..."

# ComfyUIディレクトリを作成
COMFYUI_DIR="comfyui"
if [ ! -d "$COMFYUI_DIR" ]; then
    echo "ComfyUIディレクトリを作成中..."
    mkdir -p "$COMFYUI_DIR"
fi

cd "$COMFYUI_DIR"

# Gitリポジトリをクローン（存在しない場合）
if [ ! -d ".git" ]; then
    echo "ComfyUIリポジトリをクローン中..."
    git clone https://github.com/comfyanonymous/ComfyUI.git .
fi

# Python仮想環境を作成
if [ ! -d "venv" ]; then
    echo "Python仮想環境を作成中..."
    python3 -m venv venv
fi

# 仮想環境をアクティベート
echo "仮想環境をアクティベート中..."
source venv/bin/activate

# 依存関係をインストール
echo "依存関係をインストール中..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt

# モデルディレクトリを作成
mkdir -p models/checkpoints
mkdir -p models/loras
mkdir -p models/controlnet
mkdir -p models/vae
mkdir -p models/upscale_models
mkdir -p models/embeddings

echo "ComfyUIのセットアップが完了しました！"
echo "使用方法:"
echo "1. cd comfyui"
echo "2. source venv/bin/activate"
echo "3. python main.py"
echo ""
echo "または、Armisアプリ内のComfyUIパネルから起動できます。" 