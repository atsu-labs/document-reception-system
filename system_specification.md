# 届出管理システム 要件定義・設計書

**作成日**: 2026年1月21日  
**バージョン**: 1.0

---

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [認証・権限設計](#3-認証権限設計)
4. [データベース設計](#4-データベース設計)
5. [API設計](#5-api設計)
6. [フロントエンド設計](#6-フロントエンド設計)
7. [プロジェクト構成](#7-プロジェクト構成)
8. [開発フェーズ](#8-開発フェーズ)

---

## 1. システム概要

### 1.1 目的
組織内部で使用する申請・届出データの管理システム。一般ユーザーによる受付データの登録・進捗確認と、管理ユーザーによるマスターデータ管理を実現する。

### 1.2 特徴
- スモールスタートでの段階的な機能拡張
- Cloudflare D1データベース
- Cloudflare Workersでのデプロイ対応
- 組織内部専用（インターネット公開なし）

### 1.3 主要機能
- **一般ユーザー**: 届出の登録、自部署データの閲覧・編集、進捗確認
- **上位ユーザー**: 複数部署のデータ閲覧、ステータス更新
- **管理ユーザー**: 全データアクセス、マスターデータ管理、ユーザー管理

---

## 2. 技術スタック

### 2.1 バックエンド
- **フレームワーク**: Hono v4系
- **ORM**: Drizzle ORM v0.30系
- **データベース**: Cloudflare D1
- **認証**: JWT (hono/jwt)
- **バリデーション**: Zod
- **ランタイム**: Cloudflare Workers
- **言語**: TypeScript v5系

### 2.2 フロントエンド
- **ライブラリ**: React v18系
- **ビルドツール**: Vite
- **ルーティング**: TanStack Router または React Router v6
- **状態管理**: 
  - TanStack Query (サーバー状態)
  - Zustand (クライアント状態)
- **フォーム**: React Hook Form + Zod
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **テーブル**: TanStack Table
- **日付処理**: date-fns
- **HTTP Client**: ky または axios
- **言語**: TypeScript v5系

### 2.3 デプロイ
- **本番**: Cloudflare Workers (API) + Cloudflare Pages (フロントエンド)

---

## 3. 認証・権限設計

### 3.1 ユーザーロール

| ロール | 権限 |
|--------|------|
| GENERAL (一般) | 自部署の届出登録・閲覧 |
| SENIOR (上位) | 複数部署の届出閲覧・ステータス更新 |
| ADMIN (管理) | 全データアクセス + マスターデータ管理 |

### 3.2 認証方式
- **方式**: ユーザーID/パスワード認証
- **セッション管理**: JWT トークン
- **トークン有効期限**: 8時間（推奨）
- **ユーザー登録**: 管理者による手動登録
- **初期パスワード**: 管理者が発行、初回ログイン時変更可（オプション）

### 3.3 セキュリティ要件
- パスワードのハッシュ化（bcrypt）
- HTTPS通信必須
- CORS設定（フロントエンドドメインのみ許可）
- XSS/CSRF対策

---

## 4. データベース設計

### 4.1 テーブル一覧

#### 4.1.1 users (ユーザー)
```typescript
{
  id: string (UUID, PK)
  username: string (UNIQUE, ユーザーID)
  password_hash: string
  display_name: string (表示名)
  role: 'GENERAL' | 'SENIOR' | 'ADMIN'
  department_id: string (FK -> departments.id)
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4.1.2 departments (所属マスター)
```typescript
{
  id: string (UUID, PK)
  code: string (所属コード, UNIQUE)
  name: string (所属名)
  parent_id: string | null (FK -> departments.id, 階層構造用)
  is_active: boolean
  sort_order: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4.1.3 notification_types (届出種類マスター)
```typescript
{
  id: string (UUID, PK)
  code: string (届出コード, UNIQUE)
  name: string (届出名称)
  description: string | null
  has_inspection: boolean (検査の有無)
  has_content_field: boolean (内容フィールドの有無)
  workflow_template_id: string | null (FK -> workflow_templates.id)
  is_active: boolean
  sort_order: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4.1.4 workflow_templates (ワークフロー定義)
```typescript
{
  id: string (UUID, PK)
  name: string
  statuses: JSON (例: ["受付", "処理中", "検査", "完了"])
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4.1.5 notifications (届出データ)
```typescript
{
  id: string (UUID, PK)
  notification_type_id: string (FK -> notification_types.id)
  notification_date: date (届出日)
  receiving_department_id: string (FK -> departments.id, 受付所属)
  processing_department_id: string (FK -> departments.id, 処理所属)
  property_name: string | null (対象物件名、自由入力)
  
  // 可変フィールド
  content: string | null (内容)
  inspection_date: date | null (検査日)
  inspection_department_id: string | null (FK -> departments.id, 検査所属)
  completion_date: date | null (完了日)
  
  current_status: string (現在のステータス)
  
  // メタデータ
  created_by: string (FK -> users.id)
  created_at: timestamp
  updated_at: timestamp
  updated_by: string (FK -> users.id)
}
```

#### 4.1.6 notification_history (届出履歴)
```typescript
{
  id: string (UUID, PK)
  notification_id: string (FK -> notifications.id)
  status_from: string | null
  status_to: string
  changed_by: string (FK -> users.id)
  comment: string | null
  changed_at: timestamp
}
```

### 4.2 インデックス設計
- `users.username` (UNIQUE)
- `notifications.created_by`
- `notifications.receiving_department_id`
- `notifications.processing_department_id`
- `notifications.notification_date`
- `notifications.current_status`
- `notification_history.notification_id`

---

## 5. API設計

### 5.1 エンドポイント一覧

#### 5.1.1 認証系
```
POST   /api/auth/login          # ログイン
POST   /api/auth/logout         # ログアウト
GET    /api/auth/me             # 現在のユーザー情報取得
PUT    /api/auth/password       # パスワード変更
```

#### 5.1.2 届出系
```
GET    /api/notifications                    # 一覧取得（権限に応じてフィルタ）
GET    /api/notifications/:id                # 詳細取得
POST   /api/notifications                    # 新規作成
PUT    /api/notifications/:id                # 更新
DELETE /api/notifications/:id                # 削除（論理削除）
PUT    /api/notifications/:id/status         # ステータス変更
GET    /api/notifications/:id/history        # 履歴取得
```

**一覧取得のクエリパラメータ例:**
```
?page=1
&limit=20
&status=処理中
&department_id=xxx
&from_date=2026-01-01
&to_date=2026-12-31
&keyword=検索キーワード
```

#### 5.1.3 マスターデータ系（管理者のみ）

**所属マスター:**
```
GET    /api/master/departments
POST   /api/master/departments
PUT    /api/master/departments/:id
DELETE /api/master/departments/:id
```

**届出種類マスター:**
```
GET    /api/master/notification-types
POST   /api/master/notification-types
PUT    /api/master/notification-types/:id
DELETE /api/master/notification-types/:id
```

**ユーザー管理:**
```
GET    /api/master/users
POST   /api/master/users
PUT    /api/master/users/:id
DELETE /api/master/users/:id
```

### 5.2 レスポンス形式

**成功時:**
```json
{
  "success": true,
  "data": { ... }
}
```

**エラー時:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

**一覧取得時（ページネーション）:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### 5.3 認証ヘッダー
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 6. フロントエンド設計

### 6.1 画面一覧

#### 6.1.1 共通画面
- ログイン画面
- ダッシュボード（ホーム画面）

#### 6.1.2 一般・上位ユーザー画面
- 届出一覧（検索・フィルタ機能付き）
- 届出詳細・編集
- 届出新規登録
- ステータス変更（上位ユーザーのみ）

#### 6.1.3 管理ユーザー画面
- 上記すべて
- マスターデータ管理
  - 所属管理
  - 届出種類管理
  - ユーザー管理

### 6.2 ルーティング構成

```
/login                          # ログイン画面
/                               # ダッシュボード（要認証）
/notifications                  # 届出一覧
/notifications/new              # 新規登録
/notifications/:id              # 詳細・編集
/admin/departments              # 所属管理（管理者のみ）
/admin/notification-types       # 届出種類管理（管理者のみ）
/admin/users                    # ユーザー管理（管理者のみ）
```

### 6.3 主要コンポーネント

#### 6.3.1 レイアウト
- `Layout`: 全体レイアウト
- `Sidebar`: サイドバーナビゲーション
- `Header`: ヘッダー（ユーザー情報、ログアウト）

#### 6.3.2 共通コンポーネント
- `DataTable`: 汎用データテーブル（ソート、フィルタ、ページネーション）
- `StatusBadge`: ステータス表示バッジ
- `ConfirmDialog`: 確認ダイアログ
- `LoadingSpinner`: ローディング表示

#### 6.3.3 shadcn/ui使用コンポーネント
- Button
- Input
- Select
- Table
- Dialog
- Form
- Card
- Badge
- Tabs
- Calendar
- Combobox

### 6.4 状態管理戦略

**TanStack Query (サーバー状態):**
- API呼び出しとキャッシュ管理
- 自動リフレッシュ
- Optimistic Update

**Zustand (クライアント状態):**
- 認証状態（ユーザー情報、トークン）
- UIステート（サイドバー開閉など）

---

## 7. プロジェクト構成

```
project/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # エントリーポイント
│   │   ├── routes/
│   │   │   ├── auth.ts                 # 認証関連ルート
│   │   │   ├── notifications.ts        # 届出関連ルート
│   │   │   └── master.ts               # マスター関連ルート
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT認証ミドルウェア
│   │   │   └── permission.ts           # 権限チェックミドルウェア
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── master.service.ts
│   │   ├── db/
│   │   │   ├── client.ts               # DB接続
│   │   │   └── schema.ts               # Drizzleスキーマ定義
│   │   └── utils/
│   │       ├── validation.ts           # Zodスキーマ
│   │       └── response.ts             # レスポンスヘルパー
│   ├── drizzle/
│   │   └── migrations/                 # マイグレーションファイル
│   ├── drizzle.config.ts
│   ├── wrangler.toml                   # Cloudflare Workers設定
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # エントリーポイント
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationList.tsx
│   │   │   │   ├── NotificationDetail.tsx
│   │   │   │   └── NotificationForm.tsx
│   │   │   └── admin/
│   │   │       ├── DepartmentManager.tsx
│   │   │       ├── NotificationTypeManager.tsx
│   │   │       └── UserManager.tsx
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/uiコンポーネント
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   └── shared/
│   │   │       ├── DataTable.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       └── ConfirmDialog.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                  # APIクライアント
│   │   │   ├── auth.ts                 # 認証ヘルパー
│   │   │   └── utils.ts                # 汎用ユーティリティ
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useMaster.ts
│   │   ├── stores/
│   │   │   └── authStore.ts            # Zustand認証ストア
│   │   └── types/
│   │       └── index.ts                # フロントエンド固有の型
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── shared/
│   └── types/
│       ├── user.ts
│       ├── notification.ts
│       ├── master.ts
│       └── api.ts                      # APIレスポンス型
│
├── .gitignore
├── README.md
└── package.json (ワークスペースルート)
```

---

## 8. 開発フェーズ

### Phase 1: MVP（最小機能プロダクト）
**目標**: 基本機能の動作確認

**実装項目:**
1. 開発環境セットアップ
2. DB設計・マイグレーション
3. 認証機能（ログイン・ログアウト）
4. 基本的な届出CRUD（固定フィールドのみ）
5. シンプルなマスター管理（所属、届出種類）
6. 権限による表示制御
7. 基本的なUI/UX

**期待成果:**
- ログインして届出の登録・閲覧ができる
- 管理者がマスターデータを編集できる

### Phase 2: 機能拡張
**目標**: 実用レベルの機能追加

**実装項目:**
1. ステータス管理・履歴機能
2. 検索・フィルタ機能の強化
3. 届出種類による可変フィールド対応
4. ダッシュボード（統計表示）
5. バリデーション強化
6. エラーハンドリング改善

**期待成果:**
- ワークフローに沿った届出処理ができる
- 過去データの検索・分析ができる

### Phase 3: 改善・最適化
**目標**: UX向上とパフォーマンス改善

**実装項目:**
1. UI/UX改善（レスポンシブ対応など）
2. パフォーマンス最適化
3. データエクスポート機能（CSV）
4. 監査ログ機能
5. セキュリティ強化
6. ドキュメント整備

**期待成果:**
- 快適に使える業務システム
- 運用に必要な機能が揃っている

---

## 9. 非機能要件

### 9.1 パフォーマンス
- ページ読み込み: 3秒以内
- API応答時間: 500ms以内（通常時）
- 同時接続: 50ユーザー程度を想定

### 9.2 セキュリティ
- HTTPS通信必須
- パスワードハッシュ化（bcrypt）
- SQLインジェクション対策（ORMによる自動対策）
- XSS対策（React自動エスケープ + CSP）
- CSRF対策（SameSite Cookie）

### 9.3 可用性
- 稼働時間: 業務時間内（9:00-18:00）
- メンテナンス: 業務時間外に実施

### 9.4 保守性
- TypeScriptによる型安全性
- ESLint/Prettierによるコード品質維持
- ユニットテスト（重要ロジック）
- APIドキュメント（OpenAPI/Swagger）

---

## 10. 今後の検討事項

### 10.1 機能面
- [ ] メール通知機能の必要性
- [ ] ファイルアップロード機能の必要性
- [ ] リアルタイム更新（WebSocket）の必要性
- [ ] モバイル対応の優先度
- [ ] 多言語対応の必要性

### 10.2 技術面
- [ ] テスト戦略の詳細化
- [ ] CI/CDパイプラインの構築
- [ ] ログ・監視の方針
- [ ] バックアップ戦略
- [ ] 災害復旧計画

### 10.3 運用面
- [ ] ユーザーマニュアル作成
- [ ] 運用手順書作成
- [ ] サポート体制
- [ ] 定期メンテナンス計画

---

## 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 1.0 | 2026-01-21 | 初版作成 | - |

---

**備考:**
本ドキュメントは開発の進行に伴い適宜更新されます。重要な変更があった場合は改訂履歴に記録してください。
