# 検査API ドキュメント

## 概要

本ドキュメントでは、届出管理システムにおける検査（inspections）管理のためのREST APIエンドポイントについて説明します。

検査テーブルは、1つの届出に対して複数の検査レコードを紐付けることができる独立したテーブルとして設計されています。

## ベースURL

```
http://localhost:8787/api/inspections
```

## 認証

すべてのエンドポイントでJWT認証が必要です。Authorizationヘッダーにトークンを含めてください：

```
Authorization: Bearer <your-jwt-token>
```

ログインしてトークンを取得：
```bash
POST /api/auth/login
{
  "username": "your-username",
  "password": "your-password"
}
```

## エンドポイント

### 1. 特定の届出に紐づく検査一覧を取得

**GET** `/api/inspections/notification/:notificationId`

指定した届出IDに紐づくすべての検査を取得します。

**パスパラメータ:**
- `notificationId` (必須): 届出ID (UUID形式)

**アクセス権限:**
- GENERAL: 自部門の届出に紐づく検査のみ
- SENIOR/ADMIN: すべての検査

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "2f81492a-05a9-4d5c-b07e-4779d16c6054",
      "notificationId": "efe7309f-564a-4b9c-ae7a-57b9d2c07b24",
      "inspectionDate": "2026-02-09",
      "inspectionDepartmentId": "b76e0d6b-22e1-4e82-b39c-68565ce40693",
      "inspectionType": "中間検査",
      "status": "予定",
      "result": null,
      "notes": "基礎工事完了後に実施予定",
      "inspectedBy": null,
      "inspectedAt": null,
      "createdBy": "0c438d0f-bb91-44aa-abdb-1740cfeb70bc",
      "createdAt": "2026-02-02T07:32:48.844Z",
      "updatedAt": "2026-02-02T07:32:48.844Z",
      "updatedBy": "0c438d0f-bb91-44aa-abdb-1740cfeb70bc"
    }
  ]
}
```

### 2. 特定の検査詳細を取得

**GET** `/api/inspections/:id`

指定した検査IDの詳細を取得します。

**パスパラメータ:**
- `id` (必須): 検査ID (UUID形式)

**アクセス権限:**
- GENERAL: 自部門の届出に紐づく検査のみ
- SENIOR/ADMIN: すべての検査

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": "2f81492a-05a9-4d5c-b07e-4779d16c6054",
    "notificationId": "efe7309f-564a-4b9c-ae7a-57b9d2c07b24",
    "inspectionDate": "2026-02-09",
    "inspectionDepartmentId": "b76e0d6b-22e1-4e82-b39c-68565ce40693",
    "inspectionType": "中間検査",
    "status": "予定",
    "result": null,
    "notes": "基礎工事完了後に実施予定",
    "inspectedBy": null,
    "inspectedAt": null,
    "createdBy": "0c438d0f-bb91-44aa-abdb-1740cfeb70bc",
    "createdAt": "2026-02-02T07:32:48.844Z",
    "updatedAt": "2026-02-02T07:32:48.844Z",
    "updatedBy": "0c438d0f-bb91-44aa-abdb-1740cfeb70bc"
  }
}
```

### 3. 新しい検査を作成

**POST** `/api/inspections`

届出に対して新しい検査を作成します。

**アクセス権限:**
- SENIOR以上

**リクエストボディ:**
```json
{
  "notificationId": "efe7309f-564a-4b9c-ae7a-57b9d2c07b24",
  "inspectionDate": "2026-02-15",
  "inspectionDepartmentId": "b76e0d6b-22e1-4e82-b39c-68565ce40693",
  "inspectionType": "完了検査",
  "status": "予定",
  "result": null,
  "notes": "工事完了後に実施"
}
```

**フィールド説明:**
- `notificationId` (必須): 届出ID (UUID形式)
- `inspectionDate` (必須): 検査予定日 (ISO日付形式)
- `inspectionDepartmentId` (必須): 検査担当部署ID (UUID形式)
- `inspectionType` (任意): 検査種別（例: 中間検査、完了検査、解体前検査など）
- `status` (任意): 検査ステータス（デフォルト: "予定"）
- `result` (任意): 検査結果（例: 合格、不合格、条件付き合格など）
- `notes` (任意): 検査に関する備考

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": "new-inspection-id",
    "notificationId": "efe7309f-564a-4b9c-ae7a-57b9d2c07b24",
    "inspectionDate": "2026-02-15",
    "inspectionDepartmentId": "b76e0d6b-22e1-4e82-b39c-68565ce40693",
    "inspectionType": "完了検査",
    "status": "予定",
    "result": null,
    "notes": "工事完了後に実施",
    "inspectedBy": null,
    "inspectedAt": null,
    "createdBy": "current-user-id",
    "createdAt": "2026-02-02T08:00:00.000Z",
    "updatedAt": "2026-02-02T08:00:00.000Z",
    "updatedBy": "current-user-id"
  }
}
```

### 4. 検査情報を更新

**PUT** `/api/inspections/:id`

既存の検査情報を更新します。

**アクセス権限:**
- SENIOR以上

**パスパラメータ:**
- `id` (必須): 検査ID (UUID形式)

**リクエストボディ:**
```json
{
  "status": "実施済み",
  "result": "合格",
  "notes": "検査完了。問題なし。",
  "inspectedBy": "inspector-user-id",
  "inspectedAt": "2026-02-15T10:30:00Z"
}
```

**フィールド説明:**
すべてのフィールドは任意です。更新したいフィールドのみを含めてください。

- `inspectionDate` (任意): 検査予定日
- `inspectionDepartmentId` (任意): 検査担当部署ID
- `inspectionType` (任意): 検査種別
- `status` (任意): 検査ステータス
- `result` (任意): 検査結果
- `notes` (任意): 検査に関する備考
- `inspectedBy` (任意): 検査実施者のユーザーID
- `inspectedAt` (任意): 検査実施日時

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "id": "inspection-id",
    "notificationId": "efe7309f-564a-4b9c-ae7a-57b9d2c07b24",
    "inspectionDate": "2026-02-15",
    "inspectionDepartmentId": "b76e0d6b-22e1-4e82-b39c-68565ce40693",
    "inspectionType": "完了検査",
    "status": "実施済み",
    "result": "合格",
    "notes": "検査完了。問題なし。",
    "inspectedBy": "inspector-user-id",
    "inspectedAt": "2026-02-15T10:30:00Z",
    "createdBy": "creator-user-id",
    "createdAt": "2026-02-02T08:00:00.000Z",
    "updatedAt": "2026-02-15T10:30:00.000Z",
    "updatedBy": "current-user-id"
  }
}
```

### 5. 検査を削除

**DELETE** `/api/inspections/:id`

指定した検査を削除します。

**アクセス権限:**
- SENIOR以上

**パスパラメータ:**
- `id` (必須): 検査ID (UUID形式)

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "message": "検査を削除しました"
  }
}
```

## エラーレスポンス

エラーが発生した場合、以下の形式でレスポンスが返されます：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

**一般的なエラーコード:**
- `NOT_FOUND`: リソースが見つかりません
- `FORBIDDEN`: アクセス権限がありません
- `VALIDATION_ERROR`: 入力データの検証エラー
- `INTERNAL_ERROR`: サーバー内部エラー

## 使用例

### 届出に検査を追加するワークフロー

1. 届出を作成または取得
```bash
GET /api/notifications/:notificationId
```

2. 検査を作成
```bash
POST /api/inspections
{
  "notificationId": "notification-id",
  "inspectionDate": "2026-03-01",
  "inspectionDepartmentId": "inspection-dept-id",
  "inspectionType": "中間検査",
  "status": "予定"
}
```

3. 検査を実施後、結果を更新
```bash
PUT /api/inspections/:inspectionId
{
  "status": "実施済み",
  "result": "合格",
  "inspectedBy": "inspector-user-id",
  "inspectedAt": "2026-03-01T14:00:00Z"
}
```

4. 届出の検査一覧を確認
```bash
GET /api/inspections/notification/:notificationId
```

## データモデル

### Inspection (検査)

```typescript
interface Inspection {
  id: string;                        // UUID
  notificationId: string;            // 届出ID (UUID)
  inspectionDate: string;            // 検査予定日 (ISO日付形式)
  inspectionDepartmentId: string;    // 検査担当部署ID (UUID)
  inspectionType: string | null;     // 検査種別
  status: string;                    // 検査ステータス (デフォルト: "予定")
  result: string | null;             // 検査結果
  notes: string | null;              // 備考
  inspectedBy: string | null;        // 検査実施者ID (UUID)
  inspectedAt: string | null;        // 検査実施日時 (ISO日付時刻形式)
  createdBy: string;                 // 作成者ID (UUID)
  createdAt: string;                 // 作成日時
  updatedAt: string;                 // 更新日時
  updatedBy: string;                 // 更新者ID (UUID)
}
```

## 関連ドキュメント

- [届出API ドキュメント](./NOTIFICATIONS_API.md)
- [認証API ドキュメント](./AUTH.md)
