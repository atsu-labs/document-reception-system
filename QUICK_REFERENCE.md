# クイックリファレンス

届出管理システムの開発で頻繁に使用するコマンドと情報のクイックリファレンスガイドです。

## 📦 セットアップ

```bash
# 初回セットアップ
git clone https://github.com/atsu-labs/document-reception-system.git
cd document-reception-system
pnpm install

# 環境変数の設定
cd backend && cp .dev.vars.example .dev.vars && cd ..
cd frontend && cp .env.example .env && cd ..

# データベースのセットアップ
cd backend && pnpm db:setup && cd ..
```

## 🚀 開発サーバー起動

```bash
# 方法1: 別々のターミナルで起動
pnpm --filter backend dev:local    # ターミナル1
pnpm --filter frontend dev          # ターミナル2

# 方法2: 並列起動
pnpm dev
```

## 🔗 アクセスURL

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8787
- ヘルスチェック: http://localhost:8787/health
- Drizzle Studio: https://local.drizzle.studio

## 👤 初期ユーザー

| ユーザー名 | パスワード | 役割 |
|------------|------------|------|
| admin      | password123 | 管理者 |
| senior1    | password123 | 上位ユーザー |
| user1      | password123 | 一般ユーザー |

## 💾 データベースコマンド

```bash
# マイグレーション
pnpm --filter backend db:generate    # マイグレーションファイル生成
pnpm --filter backend db:migrate     # マイグレーション実行

# データ投入・確認
pnpm --filter backend db:seed        # シードデータ投入
pnpm --filter backend db:verify      # データベース検証
pnpm --filter backend db:studio      # Drizzle Studio起動

# セットアップ・リセット
pnpm --filter backend db:setup       # migrate + seed + verify
pnpm --filter backend db:reset       # データベースリセット
```

## 🔨 ビルド・テスト

```bash
# lint
pnpm --filter backend lint
pnpm --filter frontend lint
pnpm lint                           # 全体

# ビルド
pnpm --filter backend build
pnpm --filter frontend build
pnpm build                          # 全体

# テスト（設定されている場合）
pnpm --filter backend test
pnpm --filter frontend test
pnpm test                           # 全体
```

## 🔀 Git ワークフロー

```bash
# ブランチ作成
git checkout main
git pull origin main
git checkout -b feature/issue-123-description

# コミット
git add .
git commit -m "feat: 機能の説明"

# プッシュ
git push origin feature/issue-123-description
```

### コミットプレフィックス

| プレフィックス | 用途 |
|----------------|------|
| `feat:` | 新機能 |
| `fix:` | バグ修正 |
| `docs:` | ドキュメント |
| `style:` | フォーマット |
| `refactor:` | リファクタリング |
| `test:` | テスト |
| `chore:` | ツール・設定 |

## 🔍 トラブルシューティング

### ポート競合

```bash
# ポート使用状況確認
lsof -i :8787                       # バックエンド
lsof -i :5173                       # フロントエンド

# プロセス終了
kill -9 <PID>
```

### node_modules 問題

```bash
# キャッシュクリア・再インストール
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### データベース問題

```bash
# データベースリセット
cd backend
pnpm db:reset
pnpm db:setup
```

### Vite ビルドキャッシュ

```bash
# キャッシュクリア
cd frontend
rm -rf node_modules/.vite dist
pnpm build
```

## 📚 ディレクトリ構成

```
document-reception-system/
├── backend/              # Hono + Drizzle
│   ├── src/
│   │   ├── index.ts      # エントリーポイント
│   │   ├── routes/       # APIルート
│   │   ├── middleware/   # ミドルウェア
│   │   ├── services/     # ビジネスロジック
│   │   ├── db/           # データベース
│   │   └── utils/        # ユーティリティ
│   └── drizzle/          # マイグレーション
└── frontend/             # React + Vite
    ├── src/
    │   ├── pages/        # ページ
    │   ├── components/   # コンポーネント
    │   ├── lib/          # ライブラリ
    │   ├── hooks/        # フック
    │   ├── stores/       # 状態管理
    │   └── types/        # 型定義
    └── public/           # 静的ファイル
```

## 🛠️ よく使うファイル

| ファイル | 説明 |
|----------|------|
| `backend/.dev.vars` | バックエンド環境変数 |
| `frontend/.env` | フロントエンド環境変数 |
| `backend/wrangler.toml` | Cloudflare Workers設定 |
| `backend/drizzle.config.ts` | Drizzle ORM設定 |
| `frontend/vite.config.ts` | Vite設定 |

## 📖 ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [README.md](README.md) | プロジェクト概要・セットアップ |
| [CONTRIBUTING.md](CONTRIBUTING.md) | コントリビューションガイド |
| [system_specification.md](system_specification.md) | システム仕様書 |

## 🔗 重要なリンク

- [Hono](https://hono.dev/) - バックエンドフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - ORM
- [React](https://react.dev/) - フロントエンドライブラリ
- [Vite](https://vitejs.dev/) - ビルドツール
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - デプロイ

## 💡 Tips

### エイリアスの設定（オプション）

```bash
# ~/.bashrc または ~/.zshrc に追加
alias pnpm-backend="pnpm --filter backend"
alias pnpm-frontend="pnpm --filter frontend"
alias dev-backend="pnpm --filter backend dev:local"
alias dev-frontend="pnpm --filter frontend dev"
```

### VS Code 推奨拡張機能

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitHub Pull Requests

### 開発時の注意点

- `.dev.vars`と`.env`ファイルは`.gitignore`に含まれており、コミットされません
- Cloudflare D1を使用しているため、ローカルではwranglerの開発データベースが使用されます
- `node_modules`は各パッケージごとに管理されます
- pnpmワークスペースを使用しているため、`pnpm --filter`でパッケージ指定が必要です

---

詳細は各ドキュメントを参照してください。
