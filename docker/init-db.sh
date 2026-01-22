#!/bin/bash

# データベース初期化スクリプト
# Docker環境でバックエンド起動時に実行されます

set -e

echo "🔧 データベース初期化を開始します..."

# データベースファイルが存在しない場合は初期化
if [ ! -f "$DATABASE_PATH" ]; then
    echo "📦 データベースが見つかりません。新規作成します..."
    echo "📍 パス: $DATABASE_PATH"
    
    # マイグレーションとシードを実行
    cd /app/backend
    pnpm db:setup
    
    echo "✅ データベース初期化が完了しました！"
else
    echo "✓ データベースが既に存在します: $DATABASE_PATH"
fi

# 開発サーバーを起動
echo "🚀 開発サーバーを起動します..."
exec "$@"
