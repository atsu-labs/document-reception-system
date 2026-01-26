# document-reception-system

届出管理システム - Document Reception Management System

## 概要

組織内部で使用する申請・届出データの管理システム。一般ユーザーによる受付データの登録・進捗確認と、管理ユーザーによるマスターデータ管理を実現します。

## 技術スタック

### バックエンド
- **フレームワーク**: Hono v4
- **ORM**: Drizzle ORM v0.30
- **データベース**: Cloudflare D1 (本番) / SQLite (開発)
- **ランタイム**: Cloudflare Workers / Node.js (Docker)
- **言語**: TypeScript v5

### フロントエンド
- **ライブラリ**: React v18
- **ビルドツール**: Vite
- **ルーティング**: React Router v7
- **状態管理**: TanStack Query, Zustand
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **言語**: TypeScript v5

## プロジェクト構成

```
document-reception-system/
├── backend/              # バックエンド (Hono + Drizzle + Wrangler)
│   ├── src/
│   │   ├── index.ts     # エントリーポイント
│   │   ├── routes/      # APIルート
│   │   ├── middleware/  # ミドルウェア
│   │   ├── services/    # ビジネスロジック
│   │   ├── db/          # データベース設定・スキーマ
│   │   └── utils/       # ユーティリティ
│   ├── drizzle/         # マイグレーションファイル
│   ├── wrangler.toml    # Cloudflare Workers設定
│   └── package.json
├── frontend/             # フロントエンド (React + Vite + shadcn/ui)
│   ├── src/
│   │   ├── main.tsx     # エントリーポイント
│   │   ├── App.tsx
│   │   ├── pages/       # ページコンポーネント
│   │   ├── components/  # 共通コンポーネント
│   │   ├── lib/         # ライブラリ・ユーティリティ
│   │   ├── hooks/       # カスタムフック
│   │   ├── stores/      # 状態管理
│   │   └── types/       # 型定義
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docker/               # Docker設定
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── package.json          # ワークスペースルート
└── pnpm-workspace.yaml   # pnpmワークスペース設定
```

## 開発環境のセットアップ

### 前提条件

- **Node.js**: v20以上
- **pnpm**: v8以上
- **Docker & Docker Compose**: (オプション) Docker経由での開発を行う場合

### 1. リポジトリのクローン

```bash
git clone https://github.com/atsu-labs/document-reception-system.git
cd document-reception-system
```

### 2. pnpmのインストール

```bash
npm install -g pnpm
```

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 環境変数の設定

#### バックエンド

```bash
cd backend
cp .dev.vars.example .dev.vars
# .dev.vars を編集して、必要な環境変数を設定
```

#### フロントエンド

```bash
cd frontend
cp .env.example .env
# .env を編集して、必要な環境変数を設定
```

### 5. ローカル開発サーバーの起動

#### 方法1: 直接起動（推奨）

**ターミナル1 - バックエンド:**
```bash
pnpm --filter backend dev:local
```

**ターミナル2 - フロントエンド:**
```bash
pnpm --filter frontend dev
```

#### 方法2: Docker Composeを使用

```bash
cd docker
cp .env.example .env
# .env を編集して、必要な環境変数を設定

# サービスの起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# サービスの停止
docker-compose down
```

### 6. アプリケーションへのアクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:8787
- **ヘルスチェック**: http://localhost:8787/health

## 開発コマンド

### ワークスペースルート

```bash
# すべてのパッケージの開発サーバーを並列起動
pnpm dev

# すべてのパッケージをビルド
pnpm build

# すべてのパッケージでlintを実行
pnpm lint

# すべてのパッケージでテストを実行
pnpm test
```

### バックエンド

```bash
# 開発サーバー起動（Cloudflare Workers環境）
pnpm --filter backend dev

# ローカル開発サーバー起動（SQLite使用）
pnpm --filter backend dev:local

# デプロイ（Cloudflare Workers）
pnpm --filter backend deploy

# ビルド
pnpm --filter backend build

# データベースマイグレーション生成（スキーマ変更時）
pnpm --filter backend db:generate

# データベースマイグレーション実行
pnpm --filter backend db:migrate

# Seedデータ投入
pnpm --filter backend db:seed

# データベース検証
pnpm --filter backend db:verify

# データベースセットアップ（migrate + seed + verify）
pnpm --filter backend db:setup

# データベースリセット（削除 + migrate + seed）
pnpm --filter backend db:reset

# Drizzle Studio起動（GUI管理ツール）
pnpm --filter backend db:studio
```

### フロントエンド

```bash
# 開発サーバー起動
pnpm --filter frontend dev

# プロダクションビルド
pnpm --filter frontend build

# ビルドのプレビュー
pnpm --filter frontend preview

# lint実行
pnpm --filter frontend lint
```

## デプロイ

### Cloudflare Workers + Cloudflare Pages

**バックエンド:**
```bash
cd backend
pnpm deploy
```

**フロントエンド:**
```bash
cd frontend
pnpm build
# Cloudflare Pagesにデプロイ（手動またはGitHub Actions経由）
```

## データベース

### 開発環境（SQLite）

ローカル開発では、SQLiteデータベース（`backend/data/local.db`）を使用します。

#### データベースのセットアップ

初回のデータベース作成とシードデータの投入:

```bash
cd backend

# マイグレーションとシードを一括実行
pnpm db:setup

# または個別に実行
pnpm db:migrate  # マイグレーションのみ
pnpm db:seed     # シードデータのみ
```

#### 初期ユーザー情報

シード処理により以下のテストユーザーが作成されます:

- **管理者**: `username=admin`, `password=password123`
- **上位ユーザー**: `username=senior1`, `password=password123`
- **一般ユーザー**: `username=user1`, `password=password123`

#### データベース管理コマンド

```bash
# マイグレーションファイルの生成
pnpm --filter backend db:generate

# マイグレーションの実行
pnpm --filter backend db:migrate

# シードデータの投入
pnpm --filter backend db:seed

# Drizzle Studio（GUI）の起動
pnpm --filter backend db:studio
```

### Docker環境

Docker Compose経由で起動する場合、データベースは自動的に初期化されます:

```bash
cd docker
docker-compose up -d
```

初回起動時に以下が自動実行されます:
1. マイグレーションの適用
2. シードデータの投入

データベースファイルは名前付きボリューム `backend-db` に永続化されます。

#### データベースのリセット（Docker）

```bash
# ボリュームを削除して再作成
docker-compose down -v
docker-compose up -d
```

#### 初回マイグレーション実行手順

1. **マイグレーションファイルの生成**（スキーマ変更時のみ）

   ```bash
   cd backend
   pnpm db:generate
   ```

2. **マイグレーションの実行**

   ```bash
   pnpm db:migrate
   ```

   データベースファイル `local.db` が作成され、テーブルが作成されます。

3. **Seedデータの投入**

   ```bash
   pnpm db:seed
   ```

   以下のサンプルデータが投入されます：
   - 4つの部署（総務部、人事部、経理部、営業部）
   - 2つのワークフローテンプレート（標準、簡易）
   - 3人のユーザー：
     - `admin` / `admin123` - 管理者
     - `senior` / `senior123` - 上級ユーザー
     - `general` / `general123` - 一般ユーザー
   - 3つの届出種別（休暇申請、経費精算、物品購入申請）
   - 2件のサンプル届出データ
   - 2件の履歴レコード

4. **データベースの検証**

   ```bash
   pnpm db:verify
   ```

   データベースの内容を確認し、各種クエリが正常に動作することを検証します。

#### データベースセットアップの一括実行

上記の手順を一度に実行する場合：

```bash
cd backend
pnpm db:setup
```

このコマンドは `db:migrate` → `db:seed` → `db:verify` を順に実行します。

#### データベースのリセット

データベースをリセットして最初からやり直す場合：

```bash
cd backend
pnpm db:reset
```

このコマンドは既存の `local.db` を削除し、マイグレーションとシードを再実行します。

#### 確認用の簡易クエリサンプル

SQLiteコマンドラインで直接クエリを実行する場合：

```bash
# データベースに接続
sqlite3 backend/local.db

# テーブル一覧を表示
.tables

# 全部署を表示
SELECT * FROM departments;

# ユーザー一覧（部署情報付き）
SELECT u.username, u.display_name, u.role, d.name as department
FROM users u
LEFT JOIN departments d ON u.department_id = d.id;

# 届出一覧（種別と部署情報付き）
SELECT n.notification_date, nt.name as type, n.property_name, n.current_status
FROM notifications n
JOIN notification_types nt ON n.notification_type_id = nt.id;

# 終了
.quit
```

#### Docker経由での初回マイグレーション実行

Dockerコンテナ内でマイグレーションを実行する場合：

```bash
# Dockerコンテナの起動
cd docker
docker-compose up -d

# コンテナ内でマイグレーションを実行
docker-compose exec backend pnpm db:setup

# ログで確認
docker-compose logs backend

# データベースファイルの確認（永続化ボリューム内）
docker-compose exec backend ls -la /app/backend/data/
```

#### Drizzle Studioでの確認

Drizzle Studioを使用してGUIでデータベースを確認できます：

```bash
cd backend
pnpm db:studio
```

ブラウザで https://local.drizzle.studio を開いて確認してください。

### 本番環境（Cloudflare D1）

本番環境では、Cloudflare D1データベースを使用します。
`backend/wrangler.toml` でD1バインディングを設定してください。

#### D1データベースの作成とマイグレーション

```bash
cd backend

# D1データベースの作成
wrangler d1 create document-reception-db

# wrangler.tomlに出力されたデータベースIDを設定

# マイグレーションファイルの適用
wrangler d1 migrations apply document-reception-db --local  # ローカルテスト
wrangler d1 migrations apply document-reception-db          # 本番適用
```

## ライセンス

ISC

## 関連ドキュメント

- [システム仕様書](./system_specification.md)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)