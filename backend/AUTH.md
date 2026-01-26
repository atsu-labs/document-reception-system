# Authentication & Authorization System

This document describes the JWT-based authentication and authorization system implemented for the Document Reception System backend.

## Overview

The system uses JSON Web Tokens (JWT) for stateless authentication with the following features:

- **Token-based authentication** using JWT with 8-hour expiration
- **Role-based access control** (RBAC) with three roles: GENERAL, SENIOR, ADMIN
- **Password hashing** using bcrypt
- **Environment-based configuration** for JWT secrets

## User Roles

The system implements a hierarchical role system:

| Role | Level | Description |
|------|-------|-------------|
| GENERAL | 1 | Basic user - can access protected endpoints |
| SENIOR | 2 | Senior user - has GENERAL permissions + additional privileges |
| ADMIN | 3 | Administrator - has all permissions including SENIOR |

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "displayName": "Admin User",
      "role": "ADMIN",
      "departmentId": "uuid"
    }
  }
}
```

**Response (Error):**
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
Logout current user (token should be discarded client-side).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Admin User",
    "role": "ADMIN",
    "departmentId": "uuid",
    "isActive": true,
    "createdAt": "2026-01-26 03:00:12"
  }
}
```

#### PUT /api/auth/password
Change current user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

## Middleware

### Authentication Middleware

The `authMiddleware` verifies JWT tokens and attaches user information to the request context.

**Usage:**
```typescript
import { authMiddleware } from '../middleware/auth';

// Protect a route
app.get('/protected', authMiddleware, async (c) => {
  const user = getAuthUser(c);
  // ... route logic
});
```

### Permission Middleware

The permission middleware enforces role-based access control.

**Available Middleware:**
- `requireSenior` - Requires SENIOR or ADMIN role
- `requireAdmin` - Requires ADMIN role
- `requireRole(role)` - Custom role requirement

**Usage:**
```typescript
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireSenior } from '../middleware/permission';

// Admin-only endpoint
app.get('/admin-only', authMiddleware, requireAdmin, async (c) => {
  // Only ADMIN users can access this
});

// Senior or Admin endpoint
app.get('/senior-or-admin', authMiddleware, requireSenior, async (c) => {
  // SENIOR and ADMIN users can access this
});
```

## JWT Configuration

JWT tokens are configured with the following settings:

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 8 hours (28,800 seconds)
- **Secret**: Configured via `JWT_SECRET` environment variable

### Environment Variables

Create a `.dev.vars` file in the `backend` directory:

```bash
# JWT secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secure-secret-key-here

# Database path
DATABASE_PATH=./data/local.db
```

**⚠️ IMPORTANT:** Never commit the `.dev.vars` file or production secrets to version control!

## Password Security

- Passwords are hashed using **bcrypt** with 10 salt rounds
- Never store or log plain-text passwords
- Minimum password length: 6 characters (configurable in validation)

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| INVALID_CREDENTIALS | 401 | Wrong username or password |
| ACCOUNT_DISABLED | 403 | User account is disabled |
| FORBIDDEN | 403 | Insufficient permissions |
| USER_NOT_FOUND | 404 | User does not exist |
| INVALID_PASSWORD | 400 | Current password is incorrect |
| INTERNAL_ERROR | 500 | Server error |

## Development

### Running the Server

```bash
cd backend

# Install dependencies
npm install

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
JWT_SECRET=dev-secret-key npm run dev
```

The server will run on `http://localhost:8787`

### Default Test Users

After running `npm run db:seed`, the following test users are available:

| Username | Password | Role | Department |
|----------|----------|------|------------|
| admin | password123 | ADMIN | 管理部 |
| senior1 | password123 | SENIOR | 工務部 |
| user1 | password123 | GENERAL | 総務部 |

### Testing Authentication

```bash
# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Get user info (replace TOKEN with actual token from login)
curl http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Change password
curl -X PUT http://localhost:8787/api/auth/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "newpassword"}'
```

## Security Best Practices

1. **Always use HTTPS** in production to protect tokens in transit
2. **Store tokens securely** on the client (e.g., httpOnly cookies or secure storage)
3. **Rotate JWT secrets** periodically
4. **Use strong passwords** - enforce password complexity requirements
5. **Implement rate limiting** on authentication endpoints to prevent brute force attacks
6. **Log security events** (login attempts, password changes, etc.)
7. **Validate and sanitize** all user inputs

## Production Deployment

### Cloudflare Workers

When deploying to Cloudflare Workers:

1. Set the JWT_SECRET in wrangler.toml (encrypted):
```toml
[env.production]
vars = { NODE_ENV = "production" }

[env.production.vars]
JWT_SECRET = "your-production-secret-key"
```

2. Use Cloudflare D1 for the database:
```toml
[[d1_databases]]
binding = "DB"
database_name = "document-reception-system"
database_id = "your-database-id"
```

3. Deploy:
```bash
npm run deploy
```

## Token Expiration Handling

Tokens expire after 8 hours. The client should:

1. Store the token and its expiration time
2. Check expiration before making requests
3. Handle 401 errors by redirecting to login
4. Optionally implement token refresh logic

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Token revocation/blacklist
- [ ] Multi-factor authentication (MFA)
- [ ] Password reset via email
- [ ] Session management
- [ ] Audit logging for security events
- [ ] Rate limiting on authentication endpoints

## Files Structure

```
backend/src/
├── middleware/
│   ├── auth.ts          # JWT authentication middleware
│   └── permission.ts    # Role-based access control middleware
├── routes/
│   ├── auth.ts          # Authentication endpoints
│   └── test.ts          # Test routes for development
├── utils/
│   ├── jwt.ts           # JWT utilities (sign, verify)
│   └── password.ts      # Password hashing utilities
└── db/
    ├── schema.ts        # Database schema including users table
    └── seed.ts          # Seed data with test users
```
