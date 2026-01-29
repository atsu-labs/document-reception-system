# 届出API ドキュメント

## 概要

本ドキュメントでは、届出管理システムにおける届出（notifications）管理のためのREST APIエンドポイントについて説明します。

## ベースURL

```
http://localhost:8787/api/notifications
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

### 1. 届出一覧取得

**GET** `/api/notifications`

ページネーションと任意のフィルタを使用して届出一覧を取得します。

**クエリパラメータ:**
- `page` (任意): ページ番号 (デフォルト: 1)
- `limit` (任意): 1ページあたりの件数 (デフォルト: 20)
- `status` (任意): 現在のステータスでフィルタ
- `departmentId` (任意): 部門IDでフィルタ
- `fromDate` (任意): 届出日 >= 指定日でフィルタ (ISO形式)
- `toDate` (任意): 届出日 <= 指定日でフィルタ (ISO形式)
- `keyword` (任意): 物件名または内容で検索

**アクセス権限:**
- GENERAL: 自部門の届出のみ
- SENIOR/ADMIN: すべての届出

**例:**
```bash
GET /api/notifications?page=1&limit=10&status=受付
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "notificationTypeId": "uuid",
        "notificationDate": "2026-01-28",
        "receivingDepartmentId": "uuid",
        "processingDepartmentId": "uuid",
        "propertyName": "サンプル物件",
        "content": "内容",
        "currentStatus": "受付",
        "createdBy": "uuid",
        "createdAt": "2026-01-28T00:00:00Z",
        ...
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

### 2. 届出詳細取得

**GET** `/api/notifications/:id`

特定の届出の詳細情報を取得します。

**アクセス権限:**
- GENERAL: 自部門の届出のみ
- SENIOR/ADMIN: すべての届出

**例:**
```bash
GET /api/notifications/123e4567-e89b-12d3-a456-426614174000
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "notificationTypeId": "uuid",
    "notificationDate": "2026-01-28",
    ...
  }
}
```

---

### 3. 届出作成

**POST** `/api/notifications`

新しい届出を作成します。

**アクセス権限:**
- GENERAL: 自部門のみ作成可能
- SENIOR/ADMIN: すべての部門で作成可能

**リクエストボディ:**
```json
{
  "notificationTypeId": "uuid",
  "notificationDate": "2026-01-28",
  "receivingDepartmentId": "uuid",
  "processingDepartmentId": "uuid",
  "propertyName": "物件名",
  "content": "内容",
  "currentStatus": "受付",
  "inspectionDate": "2026-02-01",
  "inspectionDepartmentId": "uuid",
  "completionDate": null
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

**注意:** 届出を作成すると、自動的に初期履歴エントリが作成されます。

---

### 4. 届出更新

**PUT** `/api/notifications/:id`

既存の届出を更新します。

**アクセス権限:**
- GENERAL: 自部門の届出のみ更新可能
- SENIOR/ADMIN: すべての届出を更新可能

**リクエストボディ:**
```json
{
  "propertyName": "更新された物件名",
  "content": "更新された内容",
  "inspectionDate": "2026-02-15"
}
```

すべてのフィールドは任意です。指定されたフィールドのみが更新されます。

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

### 5. 届出ステータス更新

**PUT** `/api/notifications/:id/status`

届出のステータスを更新します。履歴エントリが作成されます。

**アクセス権限:** SENIORおよびADMINのみ

**リクエストボディ:**
```json
{
  "status": "処理中",
  "comment": "処理を開始しました"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "currentStatus": "処理中",
    ...
  }
}
```

---

### 6. 届出履歴取得

**GET** `/api/notifications/:id/history`

届出のステータス変更履歴を取得します。

**アクセス権限:**
- GENERAL: 自部門の届出のみ
- SENIOR/ADMIN: すべての届出

**例:**
```bash
GET /api/notifications/123e4567-e89b-12d3-a456-426614174000/history
```

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "notificationId": "uuid",
      "statusFrom": "受付",
      "statusTo": "処理中",
      "changedBy": "uuid",
      "comment": "処理を開始しました",
      "changedAt": "2026-01-28T10:00:00Z"
    },
    {
      "id": "uuid",
      "notificationId": "uuid",
      "statusFrom": null,
      "statusTo": "受付",
      "changedBy": "uuid",
      "comment": "届出を作成しました",
      "changedAt": "2026-01-28T09:00:00Z"
    }
  ]
}
```

---

### 7. 届出削除

**DELETE** `/api/notifications/:id`

届出とその履歴を削除します。

**アクセス権限:** ADMINのみ

**例:**
```bash
DELETE /api/notifications/123e4567-e89b-12d3-a456-426614174000
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

## ロールベースアクセス制御

### GENERAL（一般ユーザー）
- 自部門の届出の閲覧が可能
- 自部門の届出の作成が可能
- 自部門の届出の更新が可能
- **届出のステータス変更は不可**
- **届出の削除は不可**
- **他部門の届出へのアクセスは不可**

### SENIOR（上位ユーザー）
- すべての届出の閲覧が可能
- すべての部門の届出の作成が可能
- すべての届出の更新が可能
- **届出のステータス変更が可能**
- **届出の削除は不可**

### ADMIN（管理者）
- すべての操作に対する完全なアクセス権限
- すべての届出の閲覧、作成、更新が可能
- 届出のステータス変更が可能
- **届出の削除が可能**

---

## エラーレスポンス

すべてのエラーレスポンスは以下の形式に従います：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "人間が読めるエラーメッセージ"
  }
}
```

**一般的なエラーコード:**
- `UNAUTHORIZED` (401): 認証トークンの欠落または無効
- `FORBIDDEN` (403): 要求された操作に対する権限不足
- `NOT_FOUND` (404): 要求された届出が見つからない
- `INTERNAL_ERROR` (500): サーバーエラー

---

## 使用例

### 例1: GENERAL ユーザーとして届出一覧を取得

```bash
# ログイン
TOKEN=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password123"}' \
  | jq -r '.data.token')

# 届出一覧を取得（自部門のみ表示）
curl -X GET "http://localhost:8787/api/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 例2: ADMIN として届出を作成し、ステータスを更新

```bash
# 管理者としてログイン
TOKEN=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq -r '.data.token')

# 届出を作成
NOTIFICATION_ID=$(curl -s -X POST http://localhost:8787/api/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationTypeId": "...",
    "notificationDate": "2026-01-28",
    "receivingDepartmentId": "...",
    "processingDepartmentId": "...",
    "propertyName": "テスト物件",
    "currentStatus": "受付"
  }' | jq -r '.data.id')

# ステータスを更新
curl -X PUT "http://localhost:8787/api/notifications/$NOTIFICATION_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "処理中",
    "comment": "処理を開始しました"
  }'

# 履歴を確認
curl -X GET "http://localhost:8787/api/notifications/$NOTIFICATION_ID/history" \
  -H "Authorization: Bearer $TOKEN"
```

---

## テスト

APIのテストには以下のツールを使用できます：

1. **curl**（上記の例を参照）
2. **Postman** または **Insomnia**
3. **HTTPie**: `http GET localhost:8787/api/notifications "Authorization: Bearer $TOKEN"`

デフォルトのテストユーザー：
- **admin** / password123（ADMINロール）
- **senior1** / password123（SENIORロール）
- **user1** / password123（GENERALロール）
