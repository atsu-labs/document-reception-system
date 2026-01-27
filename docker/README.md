# Docker環境でのセットアップ（ローカル開発用のみ）

⚠️ **重要な注意事項**:
- このDocker環境は**ローカル開発用途のみ**です
- 本番デプロイには **Cloudflare Workers + D1** を使用してください
- Docker/SQLite による本番デプロイは**現時点では未サポート**です

## 開発方針（D1-First Policy）

本プロジェクトは Cloudflare D1 を第一優先のデータベースとして開発しています。

- **推奨本番環境**: Cloudflare Workers + Cloudflare D1
- **ローカル開発**: Node.js + SQLite（このDocker環境）
- **Docker/SQLite 本番デプロイ**: 未実装・未サポート（将来の拡張余地のみ確保）

### 将来のDocker本番デプロイ対応について（暫定案）

将来的にDocker/SQLiteによる本番デプロイをサポートする場合、以下の対応が必要になります：

**必要な実装項目**:
1. データベースアダプター層の実装（D1/SQLite切り替え）
2. 環境変数による明示的なDB選択機構
3. 本番用Dockerイメージの作成（現在は開発用のみ）
4. ヘルスチェック・監視機構の実装
5. バックアップ・リストア手順の整備
6. パフォーマンスチューニング（接続プーリング等）
7. セキュリティ強化（シークレット管理、アクセス制御）

**拡張ポイント**:
- `backend/src/db/client.ts` - getDB関数の環境分岐
- `backend/src/db/migrate.ts` - マイグレーション戦略の分岐
- `docker/Dockerfile.backend` - 本番用イメージ設定
- `docker/docker-compose.yml` - 本番用設定の追加

**現状**: これらは未実装で、コードコメントとして将来の拡張ポイントを残すに留めています。

---

## ローカル開発環境のセットアップ

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

Docker/SQLiteでの開発環境から本番環境（Cloudflare Workers + D1）への移行については、
プロジェクトルートの [README.md](../README.md) を参照してください。

### Cloudflare Workers + D1 デプロイ手順

```bash
cd backend

# 1. D1データベースの作成
wrangler d1 create document-reception-db

# 2. wrangler.tomlにデータベースIDを設定

# 3. マイグレーションの適用
wrangler d1 migrations apply document-reception-db --remote

# 4. Workers のデプロイ
pnpm deploy
```

⚠️ **Docker/SQLite による本番デプロイは現在未サポートです**  
将来的な対応が必要な場合は、上記「将来のDocker本番デプロイ対応について」を参照してください。
