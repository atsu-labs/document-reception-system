# データスキーマ変更ドキュメント

## 概要

このドキュメントでは、届出管理システムのデータスキーマに加えられた変更について説明します。

変更日: 2026-02-02

## 変更内容の要約

1. **届出種別のグループ化**: 届出種別に親グループIDを追加し、階層的な分類を可能にしました
2. **検査テーブルの分離**: 独立した検査テーブルを作成し、1つの届出に複数の検査を紐付けられるようにしました
3. **追加データのサポート**: 届出種別ごとに追加データの要否を設定でき、必要な場合はJSON形式で柔軟にデータを保存できるようにしました

## 詳細な変更内容

### 1. 届出種別テーブル (notification_types) の変更

**追加されたカラム:**

| カラム名 | データ型 | NULL許可 | デフォルト値 | 説明 |
|---------|---------|---------|------------|------|
| parent_group_id | text | YES | NULL | 親グループID。届出種別をグループ化するための参照ID |
| requires_additional_data | integer (boolean) | NO | 0 (false) | 追加データ要否フラグ。trueの場合、この種別の届出は追加データを持つことができる |

**使用例:**

```sql
-- 親グループを作成（届出種別としても登録するが、親グループとして機能）
INSERT INTO notification_types (
  id, code, name, description,
  parent_group_id, has_inspection, has_content_field, requires_additional_data,
  workflow_template_id, is_active, sort_order
) VALUES (
  'group-id', 'NTG001', '工事関連', '工事に関する届出グループ',
  NULL, 0, 0, 0,
  NULL, 1, 1
);

-- 子の届出種別を作成
INSERT INTO notification_types (
  id, code, name, description,
  parent_group_id, has_inspection, has_content_field, requires_additional_data,
  workflow_template_id, is_active, sort_order
) VALUES (
  'type-id', 'NT001', '新築工事届', '新築工事に関する届出',
  'group-id', 1, 1, 1,
  'workflow-id', 1, 1
);
```

### 2. 届出テーブル (notifications) の変更

**追加されたカラム:**

| カラム名 | データ型 | NULL許可 | デフォルト値 | 説明 |
|---------|---------|---------|------------|------|
| additional_data | text | YES | NULL | 追加データ（JSON形式）。届出種別でrequires_additional_dataがtrueの場合に使用 |

**非推奨となったカラム:**

以下のカラムは後方互換性のため残されていますが、新しい検査テーブルの使用が推奨されます：

- `inspection_date`: 検査予定日（非推奨、inspectionsテーブルを使用してください）
- `inspection_department_id`: 検査担当部署ID（非推奨、inspectionsテーブルを使用してください）

**使用例:**

```sql
-- 追加データを含む届出を作成
INSERT INTO notifications (
  id, notification_type_id, notification_date,
  receiving_department_id, processing_department_id,
  property_name, content, additional_data,
  current_status, created_by, updated_by
) VALUES (
  'notification-id', 'type-id', '2026-02-02',
  'dept-id-1', 'dept-id-2',
  '物件名', '届出内容',
  '{"buildingStructure":"鉄筋コンクリート造","floors":3,"totalArea":250.5}',
  '受付', 'user-id', 'user-id'
);
```

**追加データのJSON構造例:**

```json
{
  "buildingStructure": "鉄筋コンクリート造",
  "floors": 3,
  "totalArea": 250.5,
  "constructionCompany": "ABC建設株式会社",
  "estimatedCost": 50000000
}
```

### 3. 検査テーブル (inspections) の新規作成

**テーブル構造:**

| カラム名 | データ型 | NULL許可 | デフォルト値 | 説明 |
|---------|---------|---------|------------|------|
| id | text | NO | - | 主キー (UUID) |
| notification_id | text | NO | - | 届出ID（外部キー） |
| inspection_date | text | NO | - | 検査予定日 |
| inspection_department_id | text | NO | - | 検査担当部署ID（外部キー） |
| inspection_type | text | YES | NULL | 検査種別（例: 中間検査、完了検査） |
| status | text | NO | '予定' | 検査ステータス（例: 予定、実施済み、中止） |
| result | text | YES | NULL | 検査結果（例: 合格、不合格） |
| notes | text | YES | NULL | 検査に関する備考 |
| inspected_by | text | YES | NULL | 検査実施者ID（外部キー） |
| inspected_at | text | YES | NULL | 検査実施日時 |
| created_by | text | NO | - | 作成者ID（外部キー） |
| created_at | text | YES | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | text | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | text | NO | - | 更新者ID（外部キー） |

**外部キー制約:**
- `notification_id` → `notifications(id)`
- `inspection_department_id` → `departments(id)`
- `inspected_by` → `users(id)`
- `created_by` → `users(id)`
- `updated_by` → `users(id)`

**使用例:**

```sql
-- 届出に対して複数の検査を作成
INSERT INTO inspections (
  id, notification_id, inspection_date, inspection_department_id,
  inspection_type, status, notes,
  created_by, updated_by
) VALUES (
  'inspection-id-1', 'notification-id', '2026-02-15', 'dept-id',
  '中間検査', '予定', '基礎工事完了後に実施',
  'user-id', 'user-id'
);

INSERT INTO inspections (
  id, notification_id, inspection_date, inspection_department_id,
  inspection_type, status, notes,
  created_by, updated_by
) VALUES (
  'inspection-id-2', 'notification-id', '2026-03-01', 'dept-id',
  '完了検査', '予定', '工事完了後に実施',
  'user-id', 'user-id'
);
```

## マイグレーション

### マイグレーションファイル

マイグレーションは以下のファイルで定義されています：

- `backend/drizzle/migrations/0001_jazzy_solo.sql`

### マイグレーション内容

```sql
-- 新しい検査テーブルを作成
CREATE TABLE `inspections` (
  `id` text PRIMARY KEY NOT NULL,
  `notification_id` text NOT NULL,
  `inspection_date` text NOT NULL,
  `inspection_department_id` text NOT NULL,
  `inspection_type` text,
  `status` text DEFAULT '予定' NOT NULL,
  `result` text,
  `notes` text,
  `inspected_by` text,
  `inspected_at` text,
  `created_by` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP,
  `updated_by` text NOT NULL,
  FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`inspection_department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`inspected_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- 届出種別テーブルに親グループIDを追加
ALTER TABLE notification_types ADD `parent_group_id` text;

-- 届出種別テーブルに追加データ要否フラグを追加
ALTER TABLE notification_types ADD `requires_additional_data` integer DEFAULT false NOT NULL;

-- 届出テーブルに追加データフィールドを追加
ALTER TABLE notifications ADD `additional_data` text;
```

### マイグレーション実行方法

```bash
# Drizzle Kitを使用してマイグレーションを実行
cd backend
npm run db:push

# D1環境（Cloudflare Workers）の場合
wrangler d1 migrations apply document-reception-system --local  # ローカル環境
wrangler d1 migrations apply document-reception-system --remote # 本番環境
```

## シードデータ

### シードデータの内容

以下のサンプルデータが含まれています：

1. **届出種別グループ**: 2つのグループ（工事関連、事務手続き関連）
2. **届出種別**: 5つの種別（新築工事届、修繕工事届、解体工事届、検査依頼、完了報告）
3. **届出**: 3件のサンプル届出（追加データを含むものと含まないもの）
4. **検査**: 3件のサンプル検査（予定と実施済み）

### シードデータの投入方法

```bash
cd backend

# シードデータをエクスポート（SQLファイルを生成）
npm run db:export-seed

# D1にシードデータを投入
npm run db:seed:d1 -- --local   # ローカル環境
npm run db:seed:d1 -- --remote  # 本番環境
```

## API変更

### 新しいエンドポイント

検査管理のための新しいAPIエンドポイントが追加されました：

- `GET /api/inspections/notification/:notificationId` - 届出に紐づく検査一覧を取得
- `GET /api/inspections/:id` - 検査詳細を取得
- `POST /api/inspections` - 新しい検査を作成
- `PUT /api/inspections/:id` - 検査情報を更新
- `DELETE /api/inspections/:id` - 検査を削除

詳細は [検査API ドキュメント](./INSPECTIONS_API.md) を参照してください。

### 既存エンドポイントの変更

届出API (`/api/notifications`) と届出種別API (`/api/master/notification-types`) は、新しいフィールドに対応しています：

**届出種別の作成・更新:**
```json
{
  "code": "NT001",
  "name": "新築工事届",
  "description": "新築工事に関する届出",
  "parentGroupId": "group-id",
  "hasInspection": true,
  "hasContentField": true,
  "requiresAdditionalData": true,
  "workflowTemplateId": "workflow-id",
  "sortOrder": 1
}
```

**届出の作成・更新:**
```json
{
  "notificationTypeId": "type-id",
  "notificationDate": "2026-02-02",
  "receivingDepartmentId": "dept-id-1",
  "processingDepartmentId": "dept-id-2",
  "propertyName": "物件名",
  "content": "届出内容",
  "additionalData": "{\"buildingStructure\":\"鉄筋コンクリート造\",\"floors\":3}",
  "currentStatus": "受付"
}
```

## データ移行ガイドライン

### 既存データの扱い

既存のデータは以下のように扱われます：

1. **届出種別**: 既存の届出種別は引き続き動作します。`parent_group_id`と`requires_additional_data`のデフォルト値はNULLと0（false）です。

2. **届出**: 既存の届出は引き続き動作します。`inspection_date`と`inspection_department_id`フィールドは後方互換性のため保持されています。

3. **検査**: 既存の届出に`inspection_date`がある場合、新しい検査テーブルにデータを移行することを推奨します。

### 移行手順（推奨）

既存の届出から検査データを移行する場合：

```sql
-- 既存の届出から検査データを抽出して検査テーブルに挿入
INSERT INTO inspections (
  id, notification_id, inspection_date, inspection_department_id,
  inspection_type, status, notes,
  created_by, updated_by, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),  -- 新しいUUID生成
  id,                           -- notification_id
  inspection_date,              -- 検査予定日
  inspection_department_id,     -- 検査担当部署
  NULL,                         -- inspection_type（デフォルト）
  '予定',                       -- status
  NULL,                         -- notes
  created_by,
  updated_by,
  created_at,
  updated_at
FROM notifications
WHERE inspection_date IS NOT NULL
  AND inspection_department_id IS NOT NULL;
```

## ベストプラクティス

### 1. 届出種別のグループ化

- グループは届出種別テーブルに「親」として登録します
- グループ自体は`parent_group_id`がNULLです
- 子の届出種別は`parent_group_id`に親のIDを設定します

### 2. 複数検査の管理

- 1つの届出に対して複数の検査を作成できます
- 検査種別（`inspection_type`）を使って検査の種類を区別します
- 検査ステータス（`status`）で進捗を管理します

### 3. 追加データの使用

- 届出種別で`requires_additional_data`がtrueの場合のみ使用します
- データはJSON文字列として保存します
- スキーマは柔軟ですが、届出種別ごとに構造を統一することを推奨します

## トラブルシューティング

### マイグレーションエラー

マイグレーション実行時にエラーが発生した場合：

1. データベースのバックアップを取得
2. 既存のマイグレーションが正しく適用されているか確認
3. Drizzle Kitのバージョンを確認（v0.20.18以上）

### シードデータエラー

シードデータ投入時にエラーが発生した場合：

1. マイグレーションが正しく適用されているか確認
2. wranglerがインストールされているか確認
3. D1データベースが作成されているか確認

## 関連ドキュメント

- [検査API ドキュメント](./INSPECTIONS_API.md)
- [届出API ドキュメント](./NOTIFICATIONS_API.md)
- [データベーススキーマ](./src/db/schema.ts)

---

## 変更履歴: 証明書発行機能の追加とスキーマクリーンアップ

**変更日:** 2026-02-18

### 変更内容の要約

1. **証明書発行機能の追加**: 届出データに証明書発行の所属と日付を追加し、届出種別マスタに証明書発行の有無チェック項目を追加
2. **不要フィールドの削除**: 届出テーブルから非推奨の検査関連フィールド（`inspection_date`, `inspection_department_id`）を削除

### 詳細な変更内容

#### 1. notification_types テーブルへの追加

**追加されたカラム:**

| カラム名 | データ型 | NULL許可 | デフォルト値 | 説明 |
|---------|---------|---------|------------|------|
| has_certificate_issue | integer (boolean) | NO | 0 (false) | 証明書発行の有無。trueの場合、この種別の届出は証明書発行情報を持つことができる |

**使用例:**

```sql
-- 証明書発行が必要な届出種別を作成
INSERT INTO notification_types (
  id, code, name, description,
  group_id, has_inspection, has_certificate_issue, has_content_field,
  requires_additional_data, workflow_template_id, is_active, sort_order
) VALUES (
  'type-id', 'NT001', '建築確認申請', '建築確認に関する届出',
  'group-id', 1, 1, 1,
  1, 'workflow-id', 1, 1
);
```

#### 2. notifications テーブルの変更

**追加されたカラム:**

| カラム名 | データ型 | NULL許可 | デフォルト値 | 説明 |
|---------|---------|---------|------------|------|
| certificate_issue_department_id | text | YES | NULL | 証明書発行所属ID（外部キー: departments.id） |
| certificate_issue_date | text | YES | NULL | 証明書発行日付（ISO日付形式） |

**削除されたカラム:**

| カラム名 | 理由 |
|---------|------|
| inspection_date | 検査情報は独立した inspections テーブルで管理するため非推奨 |
| inspection_department_id | 検査情報は独立した inspections テーブルで管理するため非推奨 |

**使用例:**

```sql
-- 証明書発行情報を含む届出を作成
INSERT INTO notifications (
  id, notification_type_id, notification_date,
  receiving_department_id, processing_department_id,
  property_name, content, additional_data,
  certificate_issue_department_id, certificate_issue_date,
  current_status, created_by, updated_by
) VALUES (
  'notification-id', 'type-id', '2026-02-18',
  'dept-id-1', 'dept-id-2',
  '物件名', '届出内容', NULL,
  'cert-dept-id', '2026-02-20',
  '受付', 'user-id', 'user-id'
);
```

### マイグレーション

**マイグレーションファイル:**
- `backend/drizzle/migrations/0003_add_certificate_issue_fields.sql`

**マイグレーション内容:**

```sql
-- 届出種別テーブルに証明書発行の有無フィールドを追加
ALTER TABLE notification_types ADD COLUMN `has_certificate_issue` integer DEFAULT false NOT NULL;

-- 届出テーブルに証明書発行関連フィールドを追加
ALTER TABLE notifications ADD COLUMN `certificate_issue_department_id` text REFERENCES departments(id);
ALTER TABLE notifications ADD COLUMN `certificate_issue_date` text;

-- 届出テーブルから非推奨フィールドを削除（テーブル再作成が必要）
-- inspection_date と inspection_department_id を削除
```

**マイグレーション実行方法:**

```bash
# Drizzle Kitを使用してマイグレーションを実行
cd backend
npm run db:push

# D1環境（Cloudflare Workers）の場合
wrangler d1 migrations apply document-reception-system --local  # ローカル環境
wrangler d1 migrations apply document-reception-system --remote # 本番環境
```

### API変更

**届出種別の作成・更新 (POST/PUT /api/master/notification-types):**

```json
{
  "code": "NT001",
  "name": "建築確認申請",
  "description": "建築確認に関する届出",
  "groupId": "group-id",
  "hasInspection": true,
  "hasCertificateIssue": true,
  "hasContentField": true,
  "requiresAdditionalData": true,
  "workflowTemplateId": "workflow-id",
  "sortOrder": 1
}
```

**届出の作成・更新 (POST/PUT /api/notifications):**

```json
{
  "notificationTypeId": "type-id",
  "notificationDate": "2026-02-18",
  "receivingDepartmentId": "dept-id-1",
  "processingDepartmentId": "dept-id-2",
  "propertyName": "物件名",
  "content": "届出内容",
  "additionalData": null,
  "certificateIssueDepartmentId": "cert-dept-id",
  "certificateIssueDate": "2026-02-20",
  "currentStatus": "受付"
}
```

**注意:** `inspectionDate` と `inspectionDepartmentId` フィールドは削除されました。検査情報は `/api/inspections` エンドポイントで管理してください。

### データ移行ガイドライン

既存データの扱い：

1. **届出種別**: 既存の届出種別は引き続き動作します。`has_certificate_issue` のデフォルト値は `false` です。
2. **届出**: 既存の届出は引き続き動作します。`inspection_date` と `inspection_department_id` フィールドは削除されました。

### ベストプラクティス

#### 1. 証明書発行情報の管理

- 届出種別で `hasCertificateIssue` が `true` の場合のみ、証明書発行情報を入力します
- 証明書発行日と証明書発行所属は両方とも入力するか、両方とも空にします

#### 2. 検査情報の管理

- 検査情報は独立した `inspections` テーブルで管理します
- 1つの届出に対して複数の検査を作成できます
- 詳細は [検査API ドキュメント](./INSPECTIONS_API.md) を参照してください

### 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 1.0 | 2026-02-02 | 初版作成 | - |
| 1.1 | 2026-02-18 | 証明書発行機能の追加と不要フィールドの削除 | - |
