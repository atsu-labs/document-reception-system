# Docker環境でのセットアップ

このディレクトリには、Document Reception SystemをDocker環境で実行するための設定が含まれています。

## 前提条件

- Docker Engine 20.10以上
- Docker Compose v2.0以上

## 環境変数の設定

1. `.env.example`をコピーして`.env`を作成します：

```bash
cp .env.example .env
```

2. 必要に応じて環境変数を編集します（デフォルト値で動作します）。

## サービスの起動

### 初回起動

```bash
# Docker Composeでサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f backend
```

初回起動時、バックエンドコンテナは自動的に以下を実行します：
1. SQLiteデータベースの作成（マイグレーション実行）
2. Seedデータの投入
3. データベースの検証

これにより、すぐに開発を開始できる状態になります。

### サービスの確認

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:8787
- **ヘルスチェック**: http://localhost:8787/health

### ログの確認

```bash
# 全サービスのログを表示
docker-compose logs -f

# バックエンドのみ
docker-compose logs -f backend

# フロントエンドのみ
docker-compose logs -f frontend
```

## データベース操作

### コンテナ内でのデータベース操作

```bash
# データベースのリセット
docker-compose exec backend pnpm db:reset

# Seedデータの再投入
docker-compose exec backend pnpm db:seed

# データベースの検証
docker-compose exec backend pnpm db:verify

# SQLiteコンソールを開く
docker-compose exec backend sqlite3 /app/backend/data/local.db
```

### データベースファイルの場所

データベースファイルは永続化ボリューム `backend-db` に保存されます。
コンテナ内のパス: `/app/backend/data/local.db`

### データベースの完全リセット

ボリュームを含めてデータベースを完全にリセットする場合：

```bash
# サービスを停止してボリュームを削除
docker-compose down -v

# サービスを再起動（データベースが再作成されます）
docker-compose up -d
```

## 開発時の運用

### コードの変更

バックエンドとフロントエンドのコードはホストマシンからマウントされているため、
コードを変更すると自動的にリロードされます。

### コンテナの再ビルド

依存関係を更新した場合や、Dockerfileを変更した場合：

```bash
# イメージを再ビルド
docker-compose build

# または、起動時に再ビルド
docker-compose up -d --build
```

### コンテナの停止と削除

```bash
# サービスを停止
docker-compose stop

# サービスを停止して削除
docker-compose down

# ボリュームも含めて削除
docker-compose down -v
```

## トラブルシューティング

### データベースが作成されない

1. ログを確認：
   ```bash
   docker-compose logs backend
   ```

2. 手動でデータベースをセットアップ：
   ```bash
   docker-compose exec backend pnpm db:setup
   ```

### ポートが既に使用されている

docker-compose.ymlのポート設定を変更してください：

```yaml
services:
  backend:
    ports:
      - "8788:8787"  # ホスト側のポートを変更
  frontend:
    ports:
      - "5174:5173"  # ホスト側のポートを変更
```

### パーミッションエラー

ボリュームのパーミッション問題が発生した場合：

```bash
# ボリュームを削除して再作成
docker-compose down -v
docker-compose up -d
```

## 本番環境への移行

Dockerでの開発環境から本番環境（Cloudflare Workers + D1）への移行については、
プロジェクトルートの [README.md](../README.md) を参照してください。
