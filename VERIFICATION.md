# データベースセットアップ検証ガイド

このドキュメントは、Drizzle ORMによるデータベース設計・マイグレーション・シードが正しく動作することを検証するためのガイドです。

本プロジェクトは **Cloudflare D1** を開発・本番環境の両方で使用します（D1-First Policy）。

## D1環境での検証

### 1. 依存関係のインストール

```bash
cd backend
pnpm install
```

### 2. D1データベースのセットアップ

```bash
# D1データベースへのマイグレーション実行
pnpm db:migrate

# シードデータの投入
pnpm db:seed
```

**期待される出力:**
```
🚀 D1マイグレーションを実行中...
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

### 3. D1データベースの確認

#### 方法1: Drizzle Studio（GUI）

```bash
pnpm db:studio
```

ブラウザで `https://local.drizzle.studio` が開き、D1データベースの内容を視覚的に確認できます。

#### 方法2: Wrangler D1コマンド

```bash
# ユーザー一覧の確認
npx wrangler d1 execute DB --local --command "SELECT display_name, username, role FROM users;"

# テーブル一覧の確認
npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# レコード数の確認
npx wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM users;"
```

**期待される出力（ユーザー一覧）:**
```
display_name    | username | role
管理者ユーザー  | admin    | ADMIN
上位ユーザー    | senior1  | SENIOR
一般ユーザー    | user1    | GENERAL
```

### 4. 開発サーバーの起動と確認

```bash
# Wranglerで開発サーバーを起動
pnpm dev
```

バックエンドサーバーを起動して、以下の認証情報でログインできることを確認:

- **管理者**: `username=admin`, `password=password123`
- **上位ユーザー**: `username=senior1`, `password=password123`
- **一般ユーザー**: `username=user1`, `password=password123`

### 5. D1データベースのリセット

開発環境のD1データベースをリセットする場合:

```bash
# ローカルD1データベースの削除
rm -rf .wrangler/state/v3/d1

# マイグレーションとシードを再実行
pnpm db:migrate
pnpm db:seed
```

## 検証チェックリスト

- [ ] `pnpm db:migrate` が正常に完了する
- [ ] D1データベースに6つのテーブルが作成される
  - [ ] users
  - [ ] departments
  - [ ] notification_types
  - [ ] workflow_templates
  - [ ] notifications
  - [ ] notification_history
- [ ] `pnpm db:seed` でシードデータが正しく投入される
  - [ ] 3人のユーザー（admin, senior1, user1）
  - [ ] 4つの部署（総務部、工務部、検査部、管理部）
  - [ ] 3つの届出種類（工事届、修繕届、検査依頼）
  - [ ] 1つのワークフローテンプレート
  - [ ] 2つのサンプル届出データ
- [ ] Drizzle StudioでD1データベースを閲覧できる
- [ ] `wrangler d1 execute` コマンドでデータを確認できる
- [ ] `.wrangler/` ディレクトリがGitにコミットされない（.gitignoreで除外）

## トラブルシューティング

### マイグレーションエラー

```bash
# ローカルD1データベースを削除して再実行
rm -rf .wrangler/state/v3/d1
pnpm --filter backend db:migrate
```

### シードデータの再投入

```bash
# D1データベースをリセットしてシードを再実行
rm -rf .wrangler/state/v3/d1
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

### Wranglerコマンドが動作しない

```bash
# Wranglerを再インストール
pnpm install -g wrangler

# または、プロジェクトのローカルWranglerを使用
npx wrangler --version
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

## 本番環境へのデプロイ

開発環境でのD1検証が完了したら、本番環境へデプロイします:

```bash
# 本番環境へのマイグレーション
npx wrangler d1 migrations apply DB --remote

# 本番環境へのシード投入（必要に応じて）
pnpm db:seed:prod

# Cloudflare Workersへのデプロイ
pnpm deploy
```

## 次のステップ

データベースのセットアップが完了したら、以下を実装してください:

1. 認証機能（JWT）の実装
2. API エンドポイントの実装
3. フロントエンドとの連携
4. Cloudflare Workersへのデプロイ
