# Sprint 4: マスターデータ管理（管理者）

## 概要
管理者向けにマスターデータ管理機能を実装する。バックエンドではマスター用CRUD APIを提供し、フロントエンドでは管理画面（所属、届出種類、ユーザー）を実装する。管理者ルートは管理者ロールのユーザーのみアクセス可能とする。

## 目的
- マスターデータを管理者がWeb UIで管理できるようにする
- 管理者によるユーザー管理（作成・更新・削除）、所属・届出種類のメンテナンスを可能にする
- 適切な権限チェックとテストを追加する

## スコープ / 要件
### バックエンド API
- 所属マスターCRUD: `POST /api/master/departments`, `GET /api/master/departments`, `GET /api/master/departments/:id`, `PUT /api/master/departments/:id`, `DELETE /api/master/departments/:id`
- 届出種類マスターCRUD: `POST /api/master/notification-types`, `GET /api/master/notification-types`, `GET /api/master/notification-types/:id`, `PUT /api/master/notification-types/:id`, `DELETE /api/master/notification-types/:id`
- ユーザー管理CRUD: `POST /api/master/users`, `GET /api/master/users`, `GET /api/master/users/:id`, `PUT /api/master/users/:id`, `DELETE /api/master/users/:id`

共通要件:
- リクエストバリデーション（必須項目、メールフォーマットなど）
- レスポンスは既存APIの形式に合わせる（`utils/response.ts` を参照）
- 認証・認可: 管理者ロール（`admin`）のみ実行可能。既存ミドルウェアを再利用。
- エラー処理とログ出力

### DB / マイグレーション
- `departments` テーブル: `id` (PK), `name` (unique, not null), `description` (nullable), `created_at`, `updated_at`
- `notification_types` テーブル: `id`, `code` (unique), `label`, `description`, `created_at`, `updated_at`
- `users` テーブル: 既存のユーザーテーブルを利用。管理者フラグ/ロール列がない場合は `role` または `is_admin` カラムを追加するマイグレーションを作成する
- シード: 基本的な所属・届出種類・初期管理者アカウントを追加するシードを用意

### フロントエンド
- 所属管理画面: 一覧、作成フォーム（name, description）、編集、削除
- 届出種類管理画面: 一覧、作成フォーム（code, label, description）、編集、削除
- ユーザー管理画面: 一覧、作成（メール、名前、所属、ロール/権限、初期パスワード）、編集、削除
- UI/UX: 既存のコンポーネント (`frontend/src/components/ui/*`) を再利用する
- API 統合: `frontend/src/lib/api.ts` または `frontend/src/lib/notificationApi.ts` のパターンに合わせて API 呼び出しを実装

### 認可 / ルート保護
- フロントエンドの管理画面ルートは `ProtectedRoute` を拡張して管理者のみアクセス可能にする（`stores/authStore.ts` のロール情報を利用）
- バックエンドは既存の `middleware/permission.ts`（または `auth.ts`）を利用して `admin` のみ許可

## 受け入れ基準
- API エンドポイントがドキュメントどおり動作し、CRUD 操作ができること
- 管理者ユーザー以外は管理ルートへアクセスできないこと（フロント／バックエンド双方で検証）
- フロントの管理画面から、所属・届出種類・ユーザーの作成・更新・削除が行えること
- 必要なマイグレーションとシードが含まれていること
- 主要なユニットテスト／APIテストが追加されていること

## タスクチェックリスト
- [ ] バックエンド: ルート・コントローラ・サービスの実装
- [ ] バックエンド: バリデーション・エラーハンドリング
- [ ] DB: マイグレーション作成（departments, notification_types, users role）
- [ ] DB: シード追加（初期データ）
- [ ] フロント: 所属管理ページ実装
- [ ] フロント: 届出種類管理ページ実装
- [ ] フロント: ユーザー管理ページ実装
- [ ] フロント/バック: 管理者認可の追加・保護
- [ ] テスト: バックエンドAPIテスト
- [ ] テスト: フロントの簡易インテグレーション/ユニットテスト
- [ ] ドキュメント: README、CHANGELOG、マイグレーションの説明

## 実装メモ / API 仕様例
- 作成: `POST /api/master/departments` リクエストボディ: `{ "name": "総務", "description": "..." }` 返却: 作成した `department` オブジェクト
- 一覧: `GET /api/master/departments` クエリ: `?page=&limit=&q=` 返却: `{ items: [...], total: N }`
- 同様に `notification-types` と `users` を実装

## 見積もり
- 開発時間: 3〜5日（バックエンド + フロント + テスト）
- 優先度: 高

## ラベル / マイルストーン / 担当
- ラベル: `sprint/4`, `feature`, `admin`, `backend`, `frontend`
- マイルストーン: Sprint 4
- 担当: @TODO

---

必要であれば、この Issue から個別のタスク Issue を作成して分割してください。
