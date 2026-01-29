# 認証・認可システム

このドキュメントは、届出管理システムバックエンドに実装されたJWTベースの認証・認可システムについて説明します。

## 概要

本システムはJSON Web Token (JWT)を使用したステートレス認証を提供し、以下の機能を備えています：

- **トークンベース認証** - 8時間有効期限のJWT
- **ロールベースアクセス制御** (RBAC) - GENERAL、SENIOR、ADMINの3つのロール
- **パスワードハッシュ化** - bcryptを使用
- **環境ベース設定** - JWT秘密鍵の環境変数管理

## ユーザーロール

本システムは階層型のロールシステムを実装しています：

| ロール | レベル | 説明 |
|------|-------|-------------|
| GENERAL | 1 | 一般ユーザー - 保護されたエンドポイントへのアクセス可能 |
| SENIOR | 2 | 上位ユーザー - GENERALの権限に加えて追加の権限を持つ |
| ADMIN | 3 | 管理者 - SENIORを含むすべての権限を持つ |

## APIエンドポイント

### 認証エンドポイント

#### POST /api/auth/login
ユーザー認証を行い、JWTトークンを取得します。

**リクエスト:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**レスポンス (成功時):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "displayName": "管理者ユーザー",
      "role": "ADMIN",
      "departmentId": "uuid"
    }
  }
}
```

**レスポンス (エラー時):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

#### POST /api/auth/logout
現在のユーザーをログアウトします（トークンはクライアント側で破棄されます）。

**ヘッダー:**
```
Authorization: Bearer <token>
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### GET /api/auth/me
現在の認証済みユーザーの情報を取得します。

**ヘッダー:**
```
Authorization: Bearer <token>
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "displayName": "管理者ユーザー",
    "role": "ADMIN",
    "departmentId": "uuid",
    "isActive": true,
    "createdAt": "2026-01-26 03:00:12"
  }
}
```

#### PUT /api/auth/password
現在のユーザーのパスワードを変更します。

**ヘッダー:**
```
Authorization: Bearer <token>
```

**リクエスト:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

## ミドルウェア

### 認証ミドルウェア

`authMiddleware` はJWTトークンを検証し、リクエストコンテキストにユーザー情報を付与します。

**使用方法:**
```typescript
import { authMiddleware } from '../middleware/auth';

// ルートを保護
app.get('/protected', authMiddleware, async (c) => {
  const user = getAuthUser(c);
  // ... ルートロジック
});
```

### 権限ミドルウェア

権限ミドルウェアはロールベースアクセス制御を実施します。

**利用可能なミドルウェア:**
- `requireSenior` - SENIORまたはADMINロールが必要
- `requireAdmin` - ADMINロールが必要
- `requireRole(role)` - カスタムロール要件

**使用方法:**
```typescript
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireSenior } from '../middleware/permission';

// 管理者専用エンドポイント
app.get('/admin-only', authMiddleware, requireAdmin, async (c) => {
  // ADMINユーザーのみアクセス可能
});

// 上位ユーザーまたは管理者用エンドポイント
app.get('/senior-or-admin', authMiddleware, requireSenior, async (c) => {
  // SENIORおよびADMINユーザーがアクセス可能
});
```

## JWT設定

JWTトークンは以下の設定で構成されています：

- **アルゴリズム**: HS256 (HMAC with SHA-256)
- **有効期限**: 8時間 (28,800秒)
- **シークレット**: `JWT_SECRET` 環境変数で設定

### 環境変数

`backend` ディレクトリに `.dev.vars` ファイルを作成してください：

```bash
# JWT シークレット（本番環境では変更必須！）
JWT_SECRET=your-secure-secret-key-here
```

**⚠️ 重要:** `.dev.vars` ファイルや本番環境のシークレットをバージョン管理にコミットしないでください！

## パスワードセキュリティ

- パスワードは **bcrypt** を使用して10ソルトラウンドでハッシュ化されます
- 平文パスワードの保存やログ出力は決して行わないでください
- 最小パスワード長: 6文字（検証で設定可能）

## エラーコード

| コード | HTTPステータス | 説明 |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | 認証情報の欠落または無効 |
| INVALID_CREDENTIALS | 401 | ユーザー名またはパスワードが間違っています |
| ACCOUNT_DISABLED | 403 | ユーザーアカウントが無効化されています |
| FORBIDDEN | 403 | 権限が不足しています |
| USER_NOT_FOUND | 404 | ユーザーが存在しません |
| INVALID_PASSWORD | 400 | 現在のパスワードが正しくありません |
| INTERNAL_ERROR | 500 | サーバーエラー |

## 開発

### サーバーの起動

```bash
cd backend

# 依存関係のインストール
npm install

# データベースのセットアップ
npm run db:setup:d1

# 開発サーバーの起動
JWT_SECRET=dev-secret-key npm run dev
```

サーバーは `http://localhost:8787` で起動します

### デフォルトテストユーザー

`npm run db:seed` を実行後、以下のテストユーザーが利用可能です：

| ユーザー名 | パスワード | ロール | 所属 |
|----------|----------|------|------------|
| admin | password123 | ADMIN | 管理部 |
| senior1 | password123 | SENIOR | 工務部 |
| user1 | password123 | GENERAL | 総務部 |

### 認証のテスト

```bash
# ログイン
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# ユーザー情報の取得（TOKENはログインで取得したトークンに置き換えてください）
curl http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# パスワード変更
curl -X PUT http://localhost:8787/api/auth/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "newpassword"}'
```

## セキュリティベストプラクティス

1. **本番環境では必ずHTTPSを使用** - トークンを転送中に保護するため
2. **トークンを安全に保存** - クライアント側（httpOnly Cookie または安全なストレージ）
3. **JWT秘密鍵を定期的にローテーション**
4. **強力なパスワードを使用** - パスワード複雑性要件を実施
5. **レート制限の実装** - 認証エンドポイントでブルートフォース攻撃を防止
6. **セキュリティイベントのログ記録** （ログイン試行、パスワード変更など）
7. **すべてのユーザー入力を検証とサニタイズ**

## 本番環境へのデプロイ

### Cloudflare Workers

Cloudflare Workersにデプロイする場合：

1. wrangler.tomlでJWT_SECRETを設定（暗号化）：
```toml
[env.production]
vars = { NODE_ENV = "production" }

[env.production.vars]
JWT_SECRET = "your-production-secret-key"
```

2. データベースにCloudflare D1を使用：
```toml
[[d1_databases]]
binding = "DB"
database_name = "document-reception-system"
database_id = "your-database-id"
```

3. デプロイ：
```bash
npm run deploy
```

## トークン有効期限の処理

トークンは8時間後に期限切れになります。クライアントは以下を行う必要があります：

1. トークンとその有効期限を保存
2. リクエスト前に有効期限をチェック
3. 401エラーをハンドリングしてログインにリダイレクト
4. オプションでトークンリフレッシュロジックを実装

## 今後の拡張機能

- [ ] トークンリフレッシュメカニズム
- [ ] トークン取り消し/ブラックリスト
- [ ] 多要素認証 (MFA)
- [ ] メールによるパスワードリセット
- [ ] セッション管理
- [ ] セキュリティイベントの監査ログ
- [ ] 認証エンドポイントのレート制限

## ファイル構成

```
backend/src/
├── middleware/
│   ├── auth.ts          # JWT認証ミドルウェア
│   └── permission.ts    # ロールベースアクセス制御ミドルウェア
├── routes/
│   ├── auth.ts          # 認証エンドポイント
│   └── test.ts          # 開発用テストルート
├── utils/
│   ├── jwt.ts           # JWTユーティリティ（署名、検証）
│   └── password.ts      # パスワードハッシュ化ユーティリティ
└── db/
    ├── schema.ts        # usersテーブルを含むデータベーススキーマ
    └── seed.ts          # テストユーザーのシードデータ
```
