#!/bin/bash

# データベース初期化スクリプト（ローカル開発用）
# Docker環境でバックエンド起動時に実行されます
#
# 注意: これはローカル開発（SQLite）専用です
# 本番環境では Cloudflare D1 + wrangler を使用してください

set -e

echo "🔧 ローカル開発環境: データベース初期化を開始します..."
echo "ℹ️  本番環境では wrangler d1 migrations apply を使用してください"
echo ""

# DATABASE_PATH環境変数が設定されているか確認
if [ -z "$DATABASE_PATH" ]; then
    echo "❌ エラー: DATABASE_PATH環境変数が設定されていません"
    exit 1
fi

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
