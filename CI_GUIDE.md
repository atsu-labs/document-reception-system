# CI/CD Workflow Guide

このドキュメントでは、Document Reception SystemのCI/CD環境とGitHub Actionsワークフローについて説明します。

## 📋 目次

- [概要](#概要)
- [ワークフロー一覧](#ワークフロー一覧)
- [Copilot Agent専用ワークフロー](#copilot-agent専用ワークフロー)
- [通常のCIワークフロー](#通常のciワークフロー)
- [環境変数とシークレット](#環境変数とシークレット)
- [トラブルシューティング](#トラブルシューティング)

## 概要

本プロジェクトでは、以下の目的でGitHub Actionsを使用しています：

1. **継続的インテグレーション (CI)**: コードの品質を自動的に検証
2. **D1データベース統合**: Cloudflare D1との統合テスト
3. **Copilot Agent支援**: エフェメラルなテスト環境の提供

## ワークフロー一覧

### 1. ci.yml - 通常のCIワークフロー

**パス**: `.github/workflows/ci.yml`

**トリガー**:
- `main`, `develop`, `copilot/**` ブランチへのpush
- `main`, `develop` ブランチへのPull Request

**ジョブ構成**:
- **test**: テスト実行とカバレッジレポート生成
- **lint**: コードスタイルとベストプラクティスのチェック
- **build**: プロダクションビルドの実行
- **d1-integration**: D1データベース統合テスト

**実行時間**: 約5-10分

### 2. copilot-setup-steps.yml - Copilot Agent専用ワークフロー

**パス**: `.github/workflows/copilot-setup-steps.yml`

**トリガー**:
- すべてのブランチへのPull Request
- 手動実行 (workflow_dispatch)

**ジョブ構成**:
- **setup-and-test**: 完全な環境セットアップとテスト実行

**実行時間**: 約10-15分

## Copilot Agent専用ワークフロー

### 目的

Copilot Agentが自動的にIssueからPRを生成する際に、エフェメラル（一時的）なテスト環境を提供します。

### 実行内容

#### 1. 環境セットアップ
```yaml
- Node.js v20のインストール
- pnpm v8のインストール
- 依存関係のキャッシュ設定
- pnpm install実行
```

#### 2. D1データベースセットアップ
```yaml
- 環境変数の設定 (.dev.vars作成)
- ローカルD1環境の初期化
- マイグレーションの適用
- シードデータの投入（オプション）
```

#### 3. テストとビルド
```yaml
- リンターの実行
- テストの実行
- バックエンドのビルド
- フロントエンドのビルド
```

#### 4. データベース検証
```yaml
- D1データベースの検証（オプション）
- テスト結果のサマリー生成
```

### 使用例

```bash
# Copilot AgentがPRを作成すると自動的に実行されます
# 手動でトリガーする場合:
# GitHub > Actions > Copilot Agent Setup Steps > Run workflow
```

### D1データベースの扱い

- **ローカルモード**: `--local` フラグを使用してローカルD1をエミュレート
- **安全性**: 本番データベースには一切アクセスしない
- **一時的**: ワークフロー実行ごとに新しいD1インスタンスを作成

## 通常のCIワークフロー

### testジョブ

**目的**: コードの正確性を検証

```yaml
steps:
  - 環境セットアップ
  - pnpm install
  - pnpm test (全テスト実行)
  - カバレッジレポートのアップロード
```

**成果物**:
- テスト結果
- カバレッジレポート (7日間保持)

### lintジョブ

**目的**: コード品質の維持

```yaml
steps:
  - 環境セットアップ
  - pnpm install
  - pnpm lint (ESLint実行)
```

**検証項目**:
- TypeScript型チェック
- コードスタイル
- 未使用変数
- ベストプラクティス

### buildジョブ

**目的**: デプロイ可能性の確認

```yaml
steps:
  - 環境セットアップ
  - pnpm install
  - pnpm build (プロダクションビルド)
  - ビルド成果物のアップロード
```

**成果物**:
- `backend/dist/` - バックエンドビルド
- `frontend/dist/` - フロントエンドビルド

### d1-integrationジョブ

**目的**: D1データベースとの統合を検証

```yaml
steps:
  - 環境セットアップ
  - pnpm install
  - .dev.vars作成
  - D1マイグレーション適用
  - シードデータ投入
  - データベース検証
```

**特徴**:
- ローカルD1環境を使用
- 本番環境には影響なし
- 失敗時も続行 (continue-on-error)

## 環境変数とシークレット

### 必須のシークレット

現在、必須のシークレットはありません。すべてデフォルト値で動作します。

### オプションのシークレット

#### JWT_SECRET

**説明**: JWT認証トークンの秘密鍵

**設定方法**:
1. GitHubリポジトリ > Settings > Secrets and variables > Actions
2. "New repository secret"をクリック
3. Name: `JWT_SECRET`
4. Value: 任意の強力な秘密鍵

**デフォルト値**:
```
test-jwt-secret-for-ci-only-do-not-use-in-production
```

⚠️ **注意**: デフォルト値は本番環境では使用しないでください。

### 環境変数の使い方

#### ワークフロー内で使用

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'
```

#### ステップ内で動的に作成

```yaml
- name: Setup environment variables
  run: |
    cat > .dev.vars << EOF
    JWT_SECRET=${{ secrets.JWT_SECRET || 'default-value' }}
    DATABASE_PATH=./test.db
    EOF
```

## ワークフローのカスタマイズ

### Node.jsバージョンの変更

```yaml
env:
  NODE_VERSION: '20'  # 変更したいバージョン
```

### pnpmバージョンの変更

```yaml
env:
  PNPM_VERSION: '8'  # 変更したいバージョン
```

### タイムアウトの設定

```yaml
jobs:
  test:
    timeout-minutes: 30  # デフォルトは360分
```

### キャッシュの最適化

```yaml
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## トラブルシューティング

### ワークフローが失敗する

#### 問題1: 依存関係のインストールエラー

**症状**:
```
Error: Unable to find a specification for package
```

**解決策**:
1. `pnpm-lock.yaml`が最新か確認
2. ローカルで`pnpm install`を実行してロックファイルを更新
3. コミットしてプッシュ

#### 問題2: テスト失敗

**症状**:
```
FAIL src/test/example.test.ts
```

**解決策**:
1. ローカルで同じテストを実行: `pnpm test`
2. 失敗の原因を特定して修正
3. 再度コミット

#### 問題3: ビルドエラー

**症状**:
```
Error: Cannot find module 'xxx'
```

**解決策**:
1. 依存関係を確認: `pnpm list xxx`
2. 必要なパッケージをインストール: `pnpm add xxx`
3. ビルドを再実行: `pnpm build`

#### 問題4: D1マイグレーションエラー

**症状**:
```
Error: Migration failed
```

**解決策**:
1. マイグレーションファイルを確認: `ls backend/drizzle/migrations/`
2. ローカルでテスト: `pnpm --filter backend wrangler d1 migrations apply document-reception-system --local`
3. SQLの構文エラーを修正

### ワークフローが実行されない

#### 確認事項

1. **トリガー条件**: ブランチ名やイベントタイプが条件に一致しているか
2. **YAMLの構文**: ワークフローファイルの構文エラーがないか
3. **権限**: リポジトリのActions設定が有効か

#### デバッグ方法

```yaml
- name: Debug info
  run: |
    echo "Branch: ${{ github.ref }}"
    echo "Event: ${{ github.event_name }}"
    env
```

### キャッシュが効かない

#### 原因

- `pnpm-lock.yaml`が変更された
- キャッシュキーが一致しない
- キャッシュが期限切れ（7日間）

#### 解決策

```yaml
restore-keys: |
  ${{ runner.os }}-pnpm-store-
```

フォールバックキーを追加すると、部分的なキャッシュヒットが可能になります。

## ベストプラクティス

### 1. 並列実行の活用

```yaml
jobs:
  test:
    # 並列実行
  lint:
    # 並列実行
  build:
    # 並列実行
```

ジョブ間に依存関係がない場合、並列実行で時間を短縮できます。

### 2. キャッシュの活用

```yaml
- uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

依存関係をキャッシュして、インストール時間を短縮します。

### 3. continue-on-errorの使用

```yaml
- name: Optional step
  continue-on-error: true
  run: pnpm db:verify:d1 --local
```

重要でないステップは失敗してもワークフローを継続させます。

### 4. 成果物の保存

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: coverage/
    retention-days: 7
```

テスト結果やビルド成果物を保存して後で参照できるようにします。

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [pnpm CI Guide](https://pnpm.io/continuous-integration)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Vitest CI Guide](https://vitest.dev/guide/ci.html)

## サポート

ワークフローに関する問題がある場合:

1. **Actionsログ確認**: GitHub > Actions タブで詳細なログを確認
2. **Issue作成**: 問題の詳細とログを含めてIssueを作成
3. **ローカル再現**: 同じコマンドをローカルで実行して問題を特定
