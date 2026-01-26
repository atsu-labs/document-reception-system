# データベースセットアップ検証ガイド

このドキュメントは、Drizzle ORMによるデータベース設計・マイグレーション・シードが正しく動作することを検証するためのガイドです。

## ローカル環境での検証

### 1. 依存関係のインストール

```bash
cd backend
pnpm install
```

### 2. データベースのセットアップ

```bash
# マイグレーションとシードを一括実行
pnpm db:setup
```

**期待される出力:**
```
🚀 マイグレーションを実行中...
📍 データベースパス: ./data/local.db
✅ マイグレーションが完了しました！

🌱 データベースのシード処理を開始します...
📋 ワークフローテンプレートを作成中...
🏢 部署データを作成中...
👤 ユーザーデータを作成中...
📄 届出種類データを作成中...
📝 サンプル届出データを作成中...
📊 届出履歴データを作成中...
✅ シード処理が完了しました！
```

### 3. データベースの確認

#### 方法1: Drizzle Studio（GUI）

```bash
pnpm db:studio
```

ブラウザで `https://local.drizzle.studio` が開き、データベースの内容を視覚的に確認できます。

#### 方法2: SQLiteコマンド

```bash
sqlite3 data/local.db "SELECT display_name, username, role FROM users;"
```

**期待される出力:**
```
管理者ユーザー|admin|ADMIN
上位ユーザー|senior1|SENIOR
一般ユーザー|user1|GENERAL
```

### 4. テストユーザーでのログイン確認

バックエンドサーバーを起動して、以下の認証情報でログインできることを確認:

- **管理者**: `username=admin`, `password=password123`
- **上位ユーザー**: `username=senior1`, `password=password123`
- **一般ユーザー**: `username=user1`, `password=password123`

## Docker環境での検証

### 1. Docker Composeで起動

```bash
cd docker
cp .env.example .env
docker-compose up -d
```

### 2. ログの確認

```bash
docker-compose logs backend
```

**期待される出力:**
```
backend_1  | 🔧 データベース初期化を開始します...
backend_1  | 📦 データベースが見つかりません。新規作成します...
backend_1  | 🚀 マイグレーションを実行中...
backend_1  | ✅ マイグレーションが完了しました！
backend_1  | 🌱 データベースのシード処理を開始します...
backend_1  | ✅ シード処理が完了しました！
backend_1  | 🚀 開発サーバーを起動します...
```

### 3. データベースの確認

```bash
docker-compose exec backend sqlite3 /app/backend/data/local.db "SELECT COUNT(*) FROM users;"
```

**期待される出力:**
```
3
```

### 4. データベースのリセット

```bash
# ボリュームを削除して再作成
docker-compose down -v
docker-compose up -d
```

再起動後、再度データベースが初期化されることを確認してください。

## 検証チェックリスト

- [ ] `pnpm db:setup` が正常に完了する
- [ ] `backend/data/local.db` ファイルが作成される
- [ ] データベースに6つのテーブルが作成される
  - [ ] users
  - [ ] departments
  - [ ] notification_types
  - [ ] workflow_templates
  - [ ] notifications
  - [ ] notification_history
- [ ] シードデータが正しく投入される
  - [ ] 3人のユーザー（admin, senior1, user1）
  - [ ] 4つの部署（総務部、工務部、検査部、管理部）
  - [ ] 3つの届出種類（工事届、修繕届、検査依頼）
  - [ ] 1つのワークフローテンプレート
  - [ ] 2つのサンプル届出データ
- [ ] Docker Composeで起動時に自動初期化される
- [ ] `data/` ディレクトリがGitにコミットされない（.gitignoreで除外）
- [ ] Drizzle Studioでデータベースを閲覧できる

## トラブルシューティング

### マイグレーションエラー

```bash
# データベースファイルを削除して再実行
rm -rf backend/data/
pnpm --filter backend db:setup
```

### Docker環境でデータベースが初期化されない

```bash
# ボリュームを完全に削除
docker-compose down -v
docker volume rm docker_backend-db

# 再起動
docker-compose up -d
```

### シードデータの再投入

```bash
# 既存データを削除してシードを再実行
rm backend/data/local.db
pnpm --filter backend db:setup
```

## データベーススキーマ

### テーブル構造

1. **users**: ユーザー情報
   - id, username, password_hash, display_name, role, department_id, is_active, created_at, updated_at

2. **departments**: 部署マスター
   - id, code, name, parent_id, is_active, sort_order, created_at, updated_at

3. **notification_types**: 届出種類マスター
   - id, code, name, description, has_inspection, has_content_field, workflow_template_id, is_active, sort_order, created_at, updated_at

4. **workflow_templates**: ワークフロー定義
   - id, name, statuses (JSON), created_at, updated_at

5. **notifications**: 届出データ
   - id, notification_type_id, notification_date, receiving_department_id, processing_department_id, property_name, content, inspection_date, inspection_department_id, completion_date, current_status, created_by, created_at, updated_at, updated_by

6. **notification_history**: 届出履歴
   - id, notification_id, status_from, status_to, changed_by, comment, changed_at

### インデックス

- `users.username` (UNIQUE)
- `departments.code` (UNIQUE)
- `notification_types.code` (UNIQUE)

## 次のステップ

データベースのセットアップが完了したら、以下を実装してください:

1. 認証機能（JWT）の実装
2. API エンドポイントの実装
3. フロントエンドとの連携
4. 本番環境（Cloudflare D1）へのマイグレーション
