# document-reception-system

届出管理システム - Document Reception Management System

## 概要

組織内部で使用する申請・届出データの管理システム。一般ユーザーによる受付データの登録・進捗確認と、管理ユーザーによるマスターデータ管理を実現します。

## 技術スタック

### バックエンド
- **フレームワーク**: Hono v4
- **ORM**: Drizzle ORM v0.30
- **データベース**: Cloudflare D1
- **ランタイム**: Cloudflare Workers (本番) / Node.js (ローカル開発)
- **言語**: TypeScript v5
- **テスト**: Vitest

### フロントエンド
- **ライブラリ**: React v18
- **ビルドツール**: Vite
- **ルーティング**: React Router v7
- **状態管理**: TanStack Query, Zustand
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **言語**: TypeScript v5
- **テスト**: Vitest + React Testing Library

### CI/CD
- **CI**: GitHub Actions
- **テスト自動化**: Vitest
- **D1統合**: ローカルD1エミュレーション

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
├── package.json          # ワークスペースルート
└── pnpm-workspace.yaml   # pnpmワークスペース設定
```

## 開発環境のセットアップ

### 前提条件

- **Node.js**: v20以上
- **pnpm**: v8以上

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

# ローカル開発サーバー起動（ローカルD1使用）
pnpm --filter backend dev:local

# デプロイ（Cloudflare Workers + D1）
pnpm --filter backend deploy

# ビルド
pnpm --filter backend build

# === データベース管理コマンド ===

# マイグレーションファイル生成（スキーマ変更時）
pnpm --filter backend db:generate

# --- D1データベース管理（本番・推奨） ---
# ✅ これらのコマンドを優先的に使用してください

# D1シードデータのエクスポート（SQL生成）
pnpm --filter backend db:export-seed

# D1へのシードデータ投入
pnpm --filter backend db:seed:d1 --local   # ローカルD1環境
pnpm --filter backend db:seed:d1 --remote  # 本番D1環境

# D1データベースの検証
pnpm --filter backend db:verify:d1 --local   # ローカルD1環境
pnpm --filter backend db:verify:d1 --remote  # 本番D1環境

# D1データベースのリセット（全削除＋再構築）
pnpm --filter backend db:reset:d1 --local   # ローカルD1環境
pnpm --filter backend db:reset:d1 --remote  # 本番D1環境（要注意！）

# D1データベースの一括セットアップ（migrate→seed→verify）
pnpm --filter backend db:setup:d1 --local   # ローカルD1環境
pnpm --filter backend db:setup:d1 --remote  # 本番D1環境
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

### 本番環境（Cloudflare D1）

✅ **本プロジェクトは Cloudflare D1 データベースを使用します**

`backend/wrangler.toml` でD1バインディングを設定してください。

#### D1データベースの初期セットアップ

##### 1. D1データベースの作成

```bash
cd backend

# D1データベースを作成
wrangler d1 create document-reception-db

# 出力されたデータベースIDをコピー
# 例: database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

##### 2. wrangler.tomlの設定

`backend/wrangler.toml` を編集し、D1バインディングを有効化：

```toml
[[d1_databases]]
binding = "DB"
database_name = "document-reception-db"
database_id = "<YOUR_DATABASE_ID>"  # 上記で取得したIDを設定
```

##### 3. マイグレーションの適用

```bash
# ローカルD1でテスト
wrangler d1 migrations apply document-reception-db --local

# 本番D1に適用
wrangler d1 migrations apply document-reception-db --remote
```

#### D1へのシードデータ投入

✅ **推奨方法**: 専用のD1コマンドを使用

```bash
cd backend

# === 方法1: 一括セットアップ（推奨） ===
# マイグレーション → シード → 検証を一度に実行
pnpm db:setup:d1 --local    # ローカルD1環境
pnpm db:setup:d1 --remote   # 本番D1環境

# === 方法2: 個別実行 ===

# シードデータをSQL形式でエクスポート
pnpm db:export-seed

# D1にシードデータを投入
pnpm db:seed:d1 --local     # ローカルD1環境
pnpm db:seed:d1 --remote    # 本番D1環境

# データベース検証
pnpm db:verify:d1 --local   # ローカルD1環境
pnpm db:verify:d1 --remote  # 本番D1環境
```

#### D1データベースのリセット

⚠️ **警告**: すべてのデータが削除されます！

```bash
# ローカルD1環境
pnpm db:reset:d1 --local

# 本番D1環境（慎重に実行してください）
pnpm db:reset:d1 --remote

# 確認をスキップする場合（スクリプト実行時）
pnpm db:reset:d1 --local --force
```

#### 初期ユーザー情報

シードデータ投入後、以下のテストユーザーが使用可能になります：

- **管理者**: `username=admin`, `password=password123`
- **上位ユーザー**: `username=senior1`, `password=password123`
- **一般ユーザー**: `username=user1`, `password=password123`

⚠️ **セキュリティ**: 本番環境では必ずパスワードを変更してください。

#### D1データベース管理の補足

**直接wranglerコマンドを使用する場合**:

```bash
# D1データベース一覧
wrangler d1 list

# D1にSQLを直接実行
wrangler d1 execute document-reception-db --local --command="SELECT * FROM users;"
wrangler d1 execute document-reception-db --remote --file=./seed-export.sql

# マイグレーション履歴の確認
wrangler d1 migrations list document-reception-db --local
wrangler d1 migrations list document-reception-db --remote

# データベース情報の確認
wrangler d1 info document-reception-db
```

---

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

### 開発サーバー関連

#### Q2: バックエンドが起動しない（ポート8787）
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

#### Q3: フロントエンドが起動しない（ポート5173）
```bash
# ポートを使用しているプロセスを確認
lsof -i :5173

# または環境変数で別ポートを指定
PORT=5174 pnpm --filter frontend dev
```

#### Q4: APIへのリクエストが失敗する（CORS エラー）
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

#### Q5: D1データベースが見つからない

**症状**: `wrangler d1` コマンド実行時にデータベースが見つからないエラー

**解決策**:
```bash
# D1データベースの一覧を確認
wrangler d1 list

# データベースが存在しない場合は作成
wrangler d1 create document-reception-db

# wrangler.tomlにデータベースIDを設定
# [[d1_databases]]
# binding = "DB"
# database_name = "document-reception-db"
# database_id = "<YOUR_DATABASE_ID>"
```

#### Q6: D1シードデータ投入時のエラー

**症状**: `pnpm db:seed:d1` 実行時にエラーが発生

**原因**:
- マイグレーションが適用されていない
- seed-export.sqlが生成されていない
- wranglerがインストールされていない

**解決策**:
```bash
cd backend

# 1. マイグレーションを先に適用
wrangler d1 migrations apply document-reception-db --local

# 2. シードデータを再投入
pnpm db:seed:d1 --local

# または一括セットアップ
pnpm db:setup:d1 --local
```

#### Q7: D1データ検証時の権限エラー

**症状**: `pnpm db:verify:d1 --remote` 実行時に権限エラー

**解決策**:
```bash
# wranglerでログイン状態を確認
wrangler whoami

# ログインしていない場合
wrangler login

# 再度検証を実行
pnpm db:verify:d1 --remote
```

#### Q8: ログイン時に認証エラー

**症状**: `401 Unauthorized`エラーが返される

**原因**:
- シードデータが投入されていない
- JWT_SECRETの設定ミス

**解決策**:
```bash
cd backend

# D1にシードデータを投入
pnpm db:seed:d1 --local    # ローカルD1
pnpm db:seed:d1 --remote   # 本番D1

# .dev.varsファイルを確認
cat .dev.vars
# JWT_SECRETが設定されているか確認
```

**初期ユーザー情報**:
- 管理者: `username=admin`, `password=password123`
- 上位ユーザー: `username=senior1`, `password=password123`
- 一般ユーザー: `username=user1`, `password=password123`

### ビルド関連

#### Q9: TypeScriptのコンパイルエラー
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

#### Q10: Viteのビルドエラー
```bash
# キャッシュをクリア
cd frontend
rm -rf node_modules/.vite dist
pnpm build
```

### その他

#### Q11: pnpmワークスペースのフィルターが効かない
```bash
# フィルターの正しい記法
pnpm --filter backend dev     # OK
pnpm -F backend dev           # OK (短縮形)
pnpm backend dev              # NG
```

#### Q12: Wranglerのログインエラー
```bash
# Cloudflare Workersへのデプロイ時
wrangler login
wrangler whoami  # ログイン確認

# ログアウトして再ログイン
wrangler logout
wrangler login
```

## D1データベース運用ガイド

### D1環境の選択

本プロジェクトでは以下の環境でD1を使用します：

- **ローカルD1** (`--local`): ローカル開発・テスト用。ローカルマシン上でD1をエミュレート
- **リモートD1** (`--remote`): 本番・ステージング用。Cloudflare上の実際のD1データベース

### よくある D1 操作

#### 新規環境のセットアップ
```bash
cd backend

# 1. D1データベース作成（初回のみ）
wrangler d1 create document-reception-db

# 2. wrangler.toml にIDを設定

# 3. 一括セットアップ
pnpm db:setup:d1 --local    # ローカルD1
pnpm db:setup:d1 --remote   # 本番D1
```

#### 既存環境へのシード再投入
```bash
cd backend

# シードデータのみ投入
pnpm db:seed:d1 --local     # ローカルD1
pnpm db:seed:d1 --remote    # 本番D1
```

#### データベースの完全リセット
```bash
cd backend

# ⚠️ 全データ削除＋再構築
pnpm db:reset:d1 --local    # ローカルD1
pnpm db:reset:d1 --remote   # 本番D1（慎重に！）
```

#### データ検証・確認
```bash
cd backend

# 検証スクリプトで確認
pnpm db:verify:d1 --local   # ローカルD1
pnpm db:verify:d1 --remote  # 本番D1

# または直接SQLを実行
wrangler d1 execute document-reception-db --local --command="SELECT * FROM users;"
wrangler d1 execute document-reception-db --remote --command="SELECT COUNT(*) FROM notifications;"
```

### D1運用のベストプラクティス

1. **ローカルD1で先にテスト**: 本番適用前に必ず `--local` でテスト
2. **バックアップの考慮**: 重要なデータは定期的にエクスポート
3. **マイグレーション履歴の管理**: `wrangler d1 migrations list` で適用状況を確認
4. **本番環境での慎重な操作**: `--remote` での `reset` は極力避ける

### D1環境の使い分け

| 用途 | 推奨データベース | 理由 |
|------|------------------|------|
| 本番環境 | **D1 (--remote)** | Cloudflare Workers統合、スケーラビリティ |
| ステージング | **D1 (--remote)** | 本番環境と同等の動作確認 |
| ローカル開発・テスト | **D1 (--local)** | D1エミュレーション |
| CI/CD | **D1 (--local)** | Cloudflare環境での自動テスト |

**推奨**: 可能な限り **D1 (--local)** を使用して、本番環境との差異を最小化してください。

## テストとCI/CD

### テストの実行

```bash
# すべてのテストを実行
pnpm test

# バックエンドテストのみ
pnpm --filter backend test

# フロントエンドテストのみ
pnpm --filter frontend test

# ウォッチモードで実行
pnpm -r test:watch

# カバレッジレポートを生成
pnpm -r test:coverage
```

### CI/CDパイプライン

本プロジェクトは、GitHub Actionsを使用した自動テストとビルドを提供しています。

#### 通常のCI（.github/workflows/ci.yml）

**トリガー**:
- `main`, `develop`, `copilot/**` ブランチへのpush
- `main`, `develop` ブランチへのPull Request

**実行内容**:
- テスト実行
- リント実行
- ビルド実行
- D1データベース統合テスト

#### Copilot Agent専用ワークフロー（.github/workflows/copilot-setup-steps.yml）

**トリガー**:
- すべてのブランチへのPull Request
- 手動実行

**実行内容**:
- エフェメラル（一時的）テスト環境のセットアップ
- D1データベースのセットアップとシード
- テスト、リント、ビルドの実行

### 詳細情報

- **テストガイド**: [TEST_GUIDE.md](./TEST_GUIDE.md) - テスト環境のセットアップと実行方法
- **CI/CDガイド**: [CI_GUIDE.md](./CI_GUIDE.md) - GitHub Actionsワークフローの詳細

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
  - [コントリビューションガイド](./CONTRIBUTING.md) - 開発参加方法
  - [クイックリファレンス](./QUICK_REFERENCE.md) - よく使うコマンド集
  - [テストガイド](./TEST_GUIDE.md) - テスト環境のセットアップと実行方法
  - [CI/CDガイド](./CI_GUIDE.md) - GitHub Actionsワークフローの詳細

- **公式ドキュメント**:
  - [Hono Documentation](https://hono.dev/) - バックエンドフレームワーク
  - [Drizzle ORM Documentation](https://orm.drizzle.team/) - ORMとマイグレーション
  - [React Documentation](https://react.dev/) - フロントエンドライブラリ
  - [Vite Documentation](https://vitejs.dev/) - ビルドツール
  - [shadcn/ui Documentation](https://ui.shadcn.com/) - UIコンポーネント
  - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) - デプロイ環境

## ライセンス

ISC