# document-reception-system

届出管理システム - Document Reception Management System

## 概要

組織内部で使用する申請・届出データの管理システム。一般ユーザーによる受付データの登録・進捗確認と、管理ユーザーによるマスターデータ管理を実現します。

## 技術スタック

### バックエンド
- **フレームワーク**: Hono v4
- **ORM**: Drizzle ORM v0.30
- **データベース**: Cloudflare D1 (本番・推奨) / SQLite (ローカル開発のみ)
- **ランタイム**: Cloudflare Workers (本番) / Node.js (ローカル開発)
- **言語**: TypeScript v5

**データベース方針 (D1-First Policy)**:
- 本プロジェクトは **Cloudflare D1 を第一優先** として開発・運用します
- ローカル開発環境では便宜上 SQLite を使用しますが、これは開発用途のみです
- Docker/SQLite による本番デプロイは現時点では**未サポート**です（将来的な拡張余地は確保）
- 詳細は「[データベース戦略](#データベース戦略)」セクションを参照してください

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

#### 方法2: Docker Composeを使用（開発環境のみ）

⚠️ **注意**: Docker環境はローカル開発用途のみです。本番デプロイには Cloudflare Workers + D1 を使用してください。

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

# ローカル開発サーバー起動（SQLite使用 - 開発用）
pnpm --filter backend dev:local

# デプロイ（Cloudflare Workers + D1）
pnpm --filter backend deploy

# ビルド
pnpm --filter backend build

# === データベース管理コマンド ===

# マイグレーションファイル生成（スキーマ変更時）
pnpm --filter backend db:generate

# --- ローカル開発（SQLite）専用 ---
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

⚠️ **注意**: `db:migrate`, `db:seed`, `db:verify` 等はローカルSQLite専用です。  
本番D1環境では `wrangler d1` コマンドを使用してください。

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

### データベース戦略 (D1-First Policy)

本プロジェクトは **Cloudflare D1 を第一優先のデータベース** として設計・運用します。

#### 基本方針

1. **本番環境**: Cloudflare D1 を使用（推奨・サポート対象）
2. **ローカル開発**: SQLite を使用（開発の便宜上のみ）
3. **Docker/SQLite デプロイ**: 現時点では**未実装・未サポート**

#### 将来の拡張計画（暫定案）

Docker/SQLite による本番デプロイを将来的に実装する場合、以下のような拡張が必要になります：

**データベースアダプター層の実装**:
```typescript
// 将来的な拡張イメージ（未実装）
interface DBAdapter {
  query(sql: string, params: any[]): Promise<any>;
  migrate(): Promise<void>;
  seed(): Promise<void>;
}

class D1Adapter implements DBAdapter { /* D1専用実装 */ }
class SQLiteAdapter implements DBAdapter { /* SQLite専用実装 */ }

function getDBAdapter(env: string): DBAdapter {
  return env === 'cloudflare' ? new D1Adapter() : new SQLiteAdapter();
}
```

**必要な対応項目**:
- 環境変数による DB タイプの明示的な選択 (`DB_TYPE=d1|sqlite`)
- マイグレーション戦略の分岐（D1 は wrangler、SQLite は直接実行）
- シード・検証スクリプトの環境別実装
- トランザクション処理の差異への対応
- 接続プーリングやパフォーマンス特性の違いへの対応

**実装時の注意点**:
- `backend/src/db/client.ts` の `getDB()` 関数が主要な拡張ポイント
- 各種スクリプト（migrate.ts, seed.ts, verify.ts）の環境分岐
- ドキュメントへの Docker/SQLite デプロイ手順の追加

**現状**: これらの拡張は実装されておらず、コードコメントとして将来の拡張ポイントを明示するに留めています。

---

### 開発環境（SQLite - ローカル開発用のみ）

ローカル開発では、SQLiteデータベース（`backend/data/local.db`）を使用します。

⚠️ **注意**: これは開発用途のみで、本番デプロイには Cloudflare D1 を使用してください。

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

⚠️ **これらはローカル開発（SQLite）専用コマンドです**

```bash
# マイグレーションファイルの生成
pnpm --filter backend db:generate

# マイグレーションの実行（ローカルSQLiteのみ）
pnpm --filter backend db:migrate

# シードデータの投入（ローカルSQLiteのみ）
pnpm --filter backend db:seed

# Drizzle Studio（GUI）の起動
pnpm --filter backend db:studio
```

**本番環境（Cloudflare D1）でのマイグレーション**:
```bash
cd backend

# ローカルD1でテスト
wrangler d1 migrations apply document-reception-db --local

# 本番D1に適用
wrangler d1 migrations apply document-reception-db --remote
```

### Docker環境（ローカル開発用のみ）

⚠️ **重要**: Docker環境はローカル開発用途のみです。本番デプロイには対応していません。

Docker Compose経由で起動する場合、データベースは自動的に初期化されます:

```bash
cd docker
docker-compose up -d
```

初回起動時に以下が自動実行されます:
1. マイグレーションの適用（SQLite）
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

### 本番環境（Cloudflare D1 - 推奨デプロイ方法）

✅ **本番環境では Cloudflare D1 データベースを使用します（これが推奨・サポート対象です）**

`backend/wrangler.toml` でD1バインディングを設定してください。

#### D1データベースの作成とマイグレーション

```bash
cd backend

# D1データベースの作成
wrangler d1 create document-reception-db

# wrangler.tomlに出力されたデータベースIDを設定

# マイグレーションファイルの適用
wrangler d1 migrations apply document-reception-db --local  # ローカルテスト
wrangler d1 migrations apply document-reception-db --remote # 本番適用
```

#### D1へのシードデータ投入

本番D1環境へのシードデータ投入は以下の方法で行います：

```bash
# 方法1: wrangler d1 execute でSQLを実行
wrangler d1 execute document-reception-db --remote --file=./seed.sql

# 方法2: 専用のシードエンドポイントを実装してAPIから実行
# （推奨: 本番環境の安全性を考慮）
```

⚠️ **注意**: ローカルの `pnpm db:seed` は SQLite 用なので、D1 には使用できません。

## 開発フローとPRガイドライン

### ブランチ戦略

```
main (本番環境)
  └── develop (開発環境)
       └── feature/xxx (機能追加)
       └── fix/xxx (バグ修正)
       └── docs/xxx (ドキュメント更新)
```

### 開発フロー

1. **Issueの作成**
   - 機能追加やバグ修正の前に、必ずIssueを作成してください
   - Issueには実装する内容・背景・受け入れ条件を明記

2. **ブランチの作成**
   ```bash
   # mainブランチから最新の状態を取得
   git checkout main
   git pull origin main
   
   # 作業ブランチを作成（命名規則に従う）
   git checkout -b feature/issue-123-add-notification-filter
   git checkout -b fix/issue-456-login-error
   git checkout -b docs/issue-789-update-readme
   ```

3. **実装とコミット**
   ```bash
   # 変更を確認
   git status
   git diff
   
   # コミット（わかりやすいメッセージを記載）
   git add .
   git commit -m "feat: 届出一覧の絞り込み機能を追加"
   git commit -m "fix: ログイン時の認証エラーを修正"
   git commit -m "docs: READMEにFAQセクションを追加"
   ```

4. **プッシュとPR作成**
   ```bash
   # リモートにプッシュ
   git push origin feature/issue-123-add-notification-filter
   ```
   
   その後、GitHubでPull Requestを作成します。

### PRテンプレート

Pull Request作成時は、以下の内容を含めてください：

```markdown
## 概要
このPRの目的と変更内容の要約

## 関連Issue
Closes #123

## 変更内容
- [ ] バックエンド: XXX機能の実装
- [ ] フロントエンド: XXX画面の追加
- [ ] データベース: XXXテーブルの追加
- [ ] ドキュメント: XXXの更新

## テスト
- [ ] 単体テストを追加・更新
- [ ] 手動テストを実施
- [ ] ビルドが正常に完了

## スクリーンショット（UI変更の場合）
（画像を添付）

## レビュー観点
- セキュリティ上の懸念はないか
- パフォーマンスへの影響はないか
- ドキュメントの更新は必要か
```

### コードレビューのポイント

- **レビュアー**: 最低1名のApproveを取得してからマージ
- **CI/CDチェック**: すべてのチェックがパスしていることを確認
- **コンフリクト**: マージ前にコンフリクトを解消
- **テスト**: 変更に対応するテストが含まれているか確認

### コミットメッセージ規約

プレフィックスを使用して、変更の種類を明示してください：

- `feat:` 新機能の追加
- `fix:` バグ修正
- `docs:` ドキュメントのみの変更
- `style:` コードのフォーマット、セミコロンの欠落など
- `refactor:` バグ修正や機能追加を含まないコードの変更
- `test:` テストの追加や既存テストの修正
- `chore:` ビルドプロセスやツールの変更

例：
```bash
git commit -m "feat: 届出一覧に日付範囲フィルターを追加"
git commit -m "fix: ログイン時のトークン検証エラーを修正"
git commit -m "docs: データベースセットアップ手順を更新"
```

## 設定ファイルの説明

### ルートディレクトリ

#### `package.json`
- pnpmワークスペースのルート設定
- 全体のビルド・開発・lintスクリプトを定義
- Node.js v20以上、pnpm v8以上が必要

#### `pnpm-workspace.yaml`
- ワークスペース構成の定義
- backend, frontendをワークスペースとして管理
- 依存関係の共有と効率的なインストールを実現

#### `.npmrc`
- pnpmの設定ファイル
- ホイスティングやキャッシュの動作を制御

#### `.gitignore`
- バージョン管理から除外するファイル・ディレクトリを定義
- node_modules, .env, ビルド成果物などを除外

### バックエンド (`backend/`)

#### `wrangler.toml`
- Cloudflare Workers / Wranglerの設定ファイル
- デプロイ設定、D1バインディング、環境変数を定義
- **重要**: 本番環境のD1データベースIDを設定する必要がある

#### `.dev.vars` (作成が必要)
- 開発環境用の環境変数（`.dev.vars.example`からコピー）
- **JWT_SECRET**: JWT認証の秘密鍵（本番環境では必ず変更）
- **DATABASE_PATH**: SQLiteデータベースのパス
- **注意**: このファイルは`.gitignore`に含まれているため、コミットしないこと

#### `drizzle.config.ts`
- Drizzle ORMの設定ファイル
- データベーススキーマとマイグレーションディレクトリを定義

#### `tsconfig.json`
- TypeScriptコンパイラの設定
- Cloudflare Workers向けの型定義を含む

### フロントエンド (`frontend/`)

#### `.env` (作成が必要)
- フロントエンド用の環境変数（`.env.example`からコピー）
- **VITE_API_URL**: バックエンドAPIのURL
- **注意**: このファイルは`.gitignore`に含まれているため、コミットしないこと

#### `vite.config.ts`
- Viteビルドツールの設定
- プロキシ設定、プラグイン、ビルドオプションを定義

#### `tailwind.config.js`
- Tailwind CSSの設定
- カスタムテーマ、カラー、shadcn/uiの統合

#### `eslint.config.js`
- ESLintの設定ファイル
- コードスタイルとベストプラクティスのチェック

#### `tsconfig.json` / `tsconfig.node.json`
- TypeScriptコンパイラの設定
- アプリケーションコードとビルドツール用で分離

### Docker (`docker/`)

#### `.env` (作成が必要)
- Docker Compose用の環境変数（`.env.example`からコピー）
- **JWT_SECRET**: バックエンド用のJWT秘密鍵
- **DATABASE_PATH**: コンテナ内のデータベースパス

#### `docker-compose.yml`
- サービス構成（backend, frontend）を定義
- ポート、ボリューム、ネットワーク設定
- 開発環境でのホットリロードに対応

#### `Dockerfile.backend` / `Dockerfile.frontend`
- 各サービスのDockerイメージビルド手順
- マルチステージビルドで最適化

## よくあるエラーとトラブルシューティング

### インストール・セットアップ関連

#### Q1: `pnpm install`が失敗する
```bash
# キャッシュをクリアして再試行
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**原因**:
- pnpmのバージョンが古い（v8以上が必要）
- Node.jsのバージョンが古い（v20以上が必要）
- ネットワーク接続の問題

**解決策**:
```bash
# pnpmのアップデート
npm install -g pnpm@latest

# Node.jsのバージョン確認
node -v  # v20以上か確認
```

#### Q2: データベースファイルが作成されない
```bash
# マイグレーションを手動実行
cd backend
pnpm db:migrate
pnpm db:seed
```

**原因**:
- backendディレクトリの権限問題
- SQLiteがインストールされていない

**解決策**:
```bash
# ディレクトリの作成と権限設定
mkdir -p backend/data
chmod 755 backend/data

# macOSの場合、Xcodeコマンドラインツールのインストール
xcode-select --install
```

### 開発サーバー関連

#### Q3: バックエンドが起動しない（ポート8787）
```bash
# ポートを使用しているプロセスを確認
lsof -i :8787

# プロセスを終了（PIDは上記コマンドで確認）
kill -9 <PID>
```

**または、別のポートで起動**:
```bash
# wrangler.tomlを編集してポート番号を変更
# [dev]
# port = 8788
```

#### Q4: フロントエンドが起動しない（ポート5173）
```bash
# ポートを使用しているプロセスを確認
lsof -i :5173

# または環境変数で別ポートを指定
PORT=5174 pnpm --filter frontend dev
```

#### Q5: APIへのリクエストが失敗する（CORS エラー）
**症状**: ブラウザのコンソールに`CORS policy`エラーが表示される

**解決策**:
1. フロントエンドの`.env`ファイルを確認：
   ```bash
   VITE_API_URL=http://localhost:8787/api
   ```

2. バックエンドが正常に起動しているか確認：
   ```bash
   curl http://localhost:8787/health
   ```

3. ブラウザのキャッシュをクリアして再読み込み

### データベース関連

#### Q6: マイグレーションエラー
```bash
# データベースをリセットして再作成
cd backend
pnpm db:reset
```

**原因**:
- スキーマの変更とマイグレーションファイルの不整合
- データベースファイルの破損

**解決策**:
```bash
# データベースファイルを削除して再作成
rm -rf backend/data
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

#### Q7: ログイン時に認証エラー
**症状**: `401 Unauthorized`エラーが返される

**原因**:
- シードデータが投入されていない
- JWT_SECRETの設定ミス

**解決策**:
```bash
# シードデータを再投入
cd backend
pnpm db:seed

# .dev.varsファイルを確認
cat .dev.vars
# JWT_SECRETが設定されているか確認
```

**初期ユーザー情報**:
- 管理者: `username=admin`, `password=password123`
- 上位ユーザー: `username=senior1`, `password=password123`
- 一般ユーザー: `username=user1`, `password=password123`

### Docker関連

#### Q8: Dockerコンテナが起動しない
```bash
# ログを確認
cd docker
docker-compose logs backend
docker-compose logs frontend

# コンテナを再ビルド
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Q9: Dockerでデータベースが初期化されない
```bash
# コンテナ内で手動実行
docker-compose exec backend pnpm db:setup

# ボリュームを削除して再作成
docker-compose down -v
docker-compose up -d
```

### ビルド関連

#### Q10: TypeScriptのコンパイルエラー
```bash
# 型定義を再インストール
pnpm install

# tsconfigを確認
cat backend/tsconfig.json
cat frontend/tsconfig.json
```

**よくある原因**:
- node_modulesが壊れている → `rm -rf node_modules && pnpm install`
- TypeScriptのバージョンが古い → `pnpm add -D typescript@latest`

#### Q11: Viteのビルドエラー
```bash
# キャッシュをクリア
cd frontend
rm -rf node_modules/.vite dist
pnpm build
```

### その他

#### Q12: Drizzle Studioが開かない
```bash
# 別のポートで起動を試す
cd backend
pnpm db:studio --port 4984
```

**注意**: Drizzle Studioは`https://local.drizzle.studio`で開くため、ブラウザのセキュリティ設定によってはブロックされる場合があります。

#### Q13: pnpmワークスペースのフィルターが効かない
```bash
# フィルターの正しい記法
pnpm --filter backend dev     # OK
pnpm -F backend dev           # OK (短縮形)
pnpm backend dev              # NG
```

#### Q14: Wranglerのログインエラー
```bash
# Cloudflare Workersへのデプロイ時
wrangler login
wrangler whoami  # ログイン確認
```

## サポートとコミュニティ

### 問題が解決しない場合

1. **Issueを検索**: 既存のIssueに同様の問題がないか確認
2. **新しいIssueを作成**: 上記で解決しない場合、詳細な情報とともにIssueを作成
   - エラーメッセージ（全文）
   - 実行環境（OS, Node.js, pnpmのバージョン）
   - 再現手順
   - 期待される動作と実際の動作

3. **ログの取得**:
   ```bash
   # バックエンドのログ
   cd backend
   pnpm dev:local 2>&1 | tee backend.log
   
   # フロントエンドのログ
   cd frontend
   pnpm dev 2>&1 | tee frontend.log
   ```

### 参考リソース

- **プロジェクト内部**:
  - [システム仕様書](./system_specification.md) - 詳細な技術仕様
  - [Docker README](./docker/README.md) - Docker環境の詳細ガイド
  - [コントリビューションガイド](./CONTRIBUTING.md) - 開発参加方法
  - [クイックリファレンス](./QUICK_REFERENCE.md) - よく使うコマンド集

- **公式ドキュメント**:
  - [Hono Documentation](https://hono.dev/) - バックエンドフレームワーク
  - [Drizzle ORM Documentation](https://orm.drizzle.team/) - ORMとマイグレーション
  - [React Documentation](https://react.dev/) - フロントエンドライブラリ
  - [Vite Documentation](https://vitejs.dev/) - ビルドツール
  - [shadcn/ui Documentation](https://ui.shadcn.com/) - UIコンポーネント
  - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) - デプロイ環境

## ライセンス

ISC