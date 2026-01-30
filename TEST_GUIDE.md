# テストガイド (Test Guide)

このドキュメントは、Document Reception Systemのテスト環境のセットアップ方法と検証手順を説明します。

## 📋 目次

- [概要](#概要)
- [前提条件](#前提条件)
- [テスト環境のセットアップ](#テスト環境のセットアップ)
- [テストの実行](#テストの実行)
- [CI/CD環境](#cicd環境)
- [Copilot Agent用の環境](#copilot-agent用の環境)
- [トラブルシューティング](#トラブルシューティング)

## 概要

このプロジェクトでは、以下のテスト環境を提供しています：

- **Vitest**: TypeScript/JavaScriptのテストフレームワーク
- **D1 Local**: Cloudflare D1のローカルエミュレーション環境
- **GitHub Actions**: CI/CDパイプライン
- **React Testing Library**: フロントエンドコンポーネントテスト

## 前提条件

### 必須ソフトウェア

- **Node.js**: v20以上
- **pnpm**: v8以上
- **Git**: 最新バージョン

### インストール確認

```bash
node --version   # v20.0.0以上
pnpm --version   # 8.0.0以上
git --version    # 任意のバージョン
```

## テスト環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/atsu-labs/document-reception-system.git
cd document-reception-system
```

### 2. 依存関係のインストール

```bash
# すべてのワークスペースの依存関係をインストール
pnpm install
```

### 3. 環境変数の設定

#### バックエンド

```bash
cd backend
cp .dev.vars.example .dev.vars
```

`.dev.vars`を編集：

```env
JWT_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./local.db
```

#### フロントエンド（オプション）

```bash
cd frontend
cp .env.example .env
```

### 4. D1データベースのセットアップ

#### ローカルD1環境の初期化

```bash
cd backend

# 方法1: 一括セットアップ（推奨）
pnpm db:setup:d1 --local

# 方法2: 個別実行
pnpm wrangler d1 migrations apply document-reception-system --local
pnpm db:seed:d1 --local
pnpm db:verify:d1 --local
```

## テストの実行

### すべてのテストを実行

```bash
# ルートディレクトリから
pnpm test
```

これにより、バックエンドとフロントエンドの両方のテストが並列実行されます。

### バックエンドテストのみ実行

```bash
pnpm --filter backend test
```

### フロントエンドテストのみ実行

```bash
pnpm --filter frontend test
```

### ウォッチモードでテスト実行

```bash
# すべて
pnpm -r test:watch

# バックエンドのみ
pnpm --filter backend test:watch

# フロントエンドのみ
pnpm --filter frontend test:watch
```

### テストUIを使用

```bash
# バックエンド
pnpm --filter backend test:ui

# フロントエンド
pnpm --filter frontend test:ui
```

ブラウザで `http://localhost:51204` にアクセスしてUIを確認できます。

### カバレッジレポートの生成

```bash
# すべて
pnpm -r test:coverage

# バックエンドのみ
pnpm --filter backend test:coverage

# フロントエンドのみ
pnpm --filter frontend test:coverage
```

カバレッジレポートは以下に生成されます：
- バックエンド: `backend/coverage/`
- フロントエンド: `frontend/coverage/`

## CI/CD環境

### GitHub Actionsワークフロー

このプロジェクトでは2つのGitHub Actionsワークフローを提供しています：

#### 1. ci.yml - 通常のCI/CDワークフロー

**トリガー:**
- `main`, `develop` ブランチへのpush
- `main`, `develop` ブランチへのPull Request
- `copilot/**` ブランチへのpush

**実行内容:**
- テストの実行
- リンターの実行
- ビルドの実行
- D1統合テスト

#### 2. copilot-setup-steps.yml - Copilot Agent専用ワークフロー

**トリガー:**
- すべてのブランチへのPull Request
- 手動実行（`workflow_dispatch`）

**実行内容:**
- エフェメラル（一時的）テスト環境のセットアップ
- D1データベースのセットアップとシード
- テスト、リント、ビルドの実行
- データベース検証

### 環境変数とシークレット

GitHub Actionsで使用する環境変数：

- `JWT_SECRET` (オプション): GitHubシークレットとして設定可能
  - 設定されていない場合、CI用のデフォルト値が使用されます

設定方法：
1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」をクリック
3. Name: `JWT_SECRET`, Value: `your-secret-value`

## Copilot Agent用の環境

Copilot Agentがこのリポジトリで作業する際、以下の環境が自動的にセットアップされます：

### 自動実行される処理

1. **依存関係のインストール**: `pnpm install`
2. **D1データベースのセットアップ**: ローカルモードでマイグレーションとシード
3. **テスト実行**: `pnpm test`
4. **リント実行**: `pnpm lint`
5. **ビルド実行**: `pnpm build`

### Copilot Agentからの利用方法

Copilot Agentは以下のコマンドを実行できます：

```bash
# テストの実行
pnpm test

# 特定パッケージのテスト
pnpm --filter backend test
pnpm --filter frontend test

# D1データベースのセットアップ
cd backend && pnpm db:setup:d1 --local

# ビルド
pnpm build

# リント
pnpm lint
```

## テストの書き方

### バックエンドテスト

バックエンドテストは `backend/src/**/*.test.ts` に配置します。

```typescript
import { describe, it, expect } from 'vitest';

describe('Sample Test', () => {
  it('should work correctly', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });
});
```

### フロントエンドテスト

フロントエンドテストは `frontend/src/**/*.test.tsx` に配置します。

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## トラブルシューティング

### テストが失敗する

#### 問題: 依存関係のエラー

```bash
# 依存関係を再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 問題: D1データベースのエラー

```bash
cd backend

# D1データベースをリセット
pnpm db:reset:d1 --local

# または再セットアップ
pnpm db:setup:d1 --local
```

### ポートの競合

```bash
# 使用中のポートを確認
lsof -i :8787  # バックエンド
lsof -i :5173  # フロントエンド

# プロセスを終了
kill -9 <PID>
```

### キャッシュのクリア

```bash
# pnpmキャッシュをクリア
pnpm store prune

# Vitestキャッシュをクリア
rm -rf backend/node_modules/.vitest
rm -rf frontend/node_modules/.vitest
```

### CI/CDが失敗する

1. **ローカルで同じコマンドを実行**: CIで実行されるコマンドと同じものをローカルで試す
2. **環境変数を確認**: 必要な環境変数が設定されているか確認
3. **ログを確認**: GitHub Actionsのログで詳細なエラーメッセージを確認

## ベストプラクティス

### テストを書く際のポイント

1. **小さく、焦点を絞る**: 1つのテストで1つのことをテストする
2. **明確な命名**: テストケース名は何をテストしているか明確に
3. **独立性**: テストは他のテストに依存しない
4. **データのクリーンアップ**: テスト後はデータをクリーンアップする

### D1データベースの使い分け

- **開発**: `--local`フラグを使用
- **CI/CD**: `--local`フラグを使用（自動的に設定される）
- **ステージング/本番**: `--remote`フラグを使用

### Copilot Agentとの連携

- **自動化を活用**: `pnpm db:setup:d1 --local`で環境を一括セットアップ
- **テストを頻繁に実行**: 変更後は必ず`pnpm test`を実行
- **エラーログを確認**: 失敗した場合は詳細なログを確認

## 参考リンク

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [pnpm Documentation](https://pnpm.io/)
- [GitHub Actions Documentation](https://docs.github.com/actions)

## サポート

問題が解決しない場合は、以下の方法でサポートを受けられます：

1. **Issue作成**: GitHubでIssueを作成
2. **ログの添付**: エラーログや実行環境の情報を含める
3. **再現手順**: 問題を再現できる最小限の手順を記載
