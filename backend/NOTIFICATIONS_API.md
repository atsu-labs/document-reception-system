# Notifications API Documentation

## Overview

This document describes the REST API endpoints for managing notifications (届出) in the document reception system.

## Base URL

```
http://localhost:8787/api/notifications
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by logging in:
```bash
POST /api/auth/login
{
  "username": "your-username",
  "password": "your-password"
}
```

## Endpoints

### 1. List Notifications

**GET** `/api/notifications`

List notifications with pagination and optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by current status
- `departmentId` (optional): Filter by department ID
- `fromDate` (optional): Filter by notification date >= this date (ISO format)
- `toDate` (optional): Filter by notification date <= this date (ISO format)
- `keyword` (optional): Search in property name or content

**Access:**
- GENERAL: Only notifications from own department
- SENIOR/ADMIN: All notifications

**Example:**
```bash
GET /api/notifications?page=1&limit=10&status=受付
```

**Response:**
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

### 2. Get Notification Details

**GET** `/api/notifications/:id`

Get details of a specific notification.

**Access:**
- GENERAL: Only notifications from own department
- SENIOR/ADMIN: All notifications

**Example:**
```bash
GET /api/notifications/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
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

### 3. Create Notification

**POST** `/api/notifications`

Create a new notification.

**Access:**
- GENERAL: Can only create for own department
- SENIOR/ADMIN: Can create for any department

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

**Note:** Creating a notification automatically creates an initial history entry.

---

### 4. Update Notification

**PUT** `/api/notifications/:id`

Update an existing notification.

**Access:**
- GENERAL: Can only update notifications from own department
- SENIOR/ADMIN: Can update any notification

**Request Body:**
```json
{
  "propertyName": "Updated property name",
  "content": "Updated content",
  "inspectionDate": "2026-02-15"
}
```

All fields are optional. Only provided fields will be updated.

**Response:**
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

### 5. Update Notification Status

**PUT** `/api/notifications/:id/status`

Update the status of a notification. This creates a history entry.

**Access:** SENIOR and ADMIN only

**Request Body:**
```json
{
  "status": "処理中",
  "comment": "処理を開始しました"
}
```

**Response:**
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

### 6. Get Notification History

**GET** `/api/notifications/:id/history`

Get the status change history for a notification.

**Access:**
- GENERAL: Only for notifications from own department
- SENIOR/ADMIN: All notifications

**Example:**
```bash
GET /api/notifications/123e4567-e89b-12d3-a456-426614174000/history
```

**Response:**
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

### 7. Delete Notification

**DELETE** `/api/notifications/:id`

Delete a notification and its history.

**Access:** ADMIN only

**Example:**
```bash
DELETE /api/notifications/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

## Role-Based Access Control

### GENERAL (一般ユーザー)
- Can view notifications from their own department
- Can create notifications for their own department
- Can update notifications from their own department
- **Cannot** change notification status
- **Cannot** delete notifications
- **Cannot** access notifications from other departments

### SENIOR (上位ユーザー)
- Can view all notifications
- Can create notifications for any department
- Can update all notifications
- **Can** change notification status
- **Cannot** delete notifications

### ADMIN (管理者)
- Full access to all operations
- Can view, create, update all notifications
- Can change notification status
- **Can** delete notifications

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Missing or invalid authentication token
- `FORBIDDEN` (403): Insufficient permissions for the requested operation
- `NOT_FOUND` (404): Requested notification not found
- `INTERNAL_ERROR` (500): Server error

---

## Examples

### Example 1: List notifications as GENERAL user

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password123"}' \
  | jq -r '.data.token')

# List notifications (will only see own department)
curl -X GET "http://localhost:8787/api/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Create and update notification status as ADMIN

```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq -r '.data.token')

# Create notification
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

# Update status
curl -X PUT "http://localhost:8787/api/notifications/$NOTIFICATION_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "処理中",
    "comment": "処理を開始しました"
  }'

# View history
curl -X GET "http://localhost:8787/api/notifications/$NOTIFICATION_ID/history" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing

For testing the API, you can use:

1. **curl** (as shown in examples above)
2. **Postman** or **Insomnia**
3. **HTTPie**: `http GET localhost:8787/api/notifications "Authorization: Bearer $TOKEN"`

Default test users:
- **admin** / password123 (ADMIN role)
- **senior1** / password123 (SENIOR role)
- **user1** / password123 (GENERAL role)
