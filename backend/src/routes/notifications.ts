import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, or, like, gte, lte, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getDB, Env } from '../db/client';
import { notifications, notificationHistory, users } from '../db/schema';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { requireSenior, requireAdmin } from '../middleware/permission';
import { getCurrentTimestamp } from '../utils/timestamp';
import {
  createNotificationSchema,
  updateNotificationSchema,
  updateStatusSchema,
  listNotificationsQuerySchema,
} from '../utils/validation';

const notificationsRouter = new Hono();

// すべての届出ルートに認証ミドルウェアを適用
notificationsRouter.use('*', authMiddleware);

/**
 * GET /api/notifications
 * ページネーションとフィルタを使用して届出一覧を取得
 * アクセス権限: すべての認証済みユーザー（ロールによってフィルタリング）
 */
notificationsRouter.get('/', zValidator('query', listNotificationsQuerySchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const query = c.req.valid('query');

  try {
    // WHERE条件を構築
    const conditions = [];

    // ロールベースのフィルタリング
    if (authUser.role === 'GENERAL') {
      // GENERAL ユーザーは自部門の届出のみ閲覧可能
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);
      
      if (user?.departmentId) {
        conditions.push(
          or(
            eq(notifications.receivingDepartmentId, user.departmentId),
            eq(notifications.processingDepartmentId, user.departmentId)
          )
        );
      }
    }
    // SENIOR と ADMIN はすべての届出を閲覧可能（追加フィルタなし）

    // ステータスフィルタ
    if (query.status) {
      conditions.push(eq(notifications.currentStatus, query.status));
    }

    // 部門フィルタ
    if (query.departmentId) {
      conditions.push(
        or(
          eq(notifications.receivingDepartmentId, query.departmentId),
          eq(notifications.processingDepartmentId, query.departmentId)
        )
      );
    }

    // 日付範囲フィルタ
    if (query.fromDate) {
      conditions.push(gte(notifications.notificationDate, query.fromDate));
    }
    if (query.toDate) {
      conditions.push(lte(notifications.notificationDate, query.toDate));
    }

    // キーワード検索（物件名または内容）
    if (query.keyword) {
      conditions.push(
        or(
          like(notifications.propertyName, `%${query.keyword}%`),
          like(notifications.content, `%${query.keyword}%`)
        )
      );
    }

    // WHERE句を構築
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 全件取得してカウント（シンプルなアプローチ）
    const allItems = await db
      .select()
      .from(notifications)
      .where(whereClause);
    
    const total = allItems.length;

    // ページネーション結果を取得
    const offset = (query.page - 1) * query.limit;
    const items = allItems
      .sort((a, b) => {
        // 届出日の降順、次に作成日時の降順でソート
        if (b.notificationDate !== a.notificationDate) {
          return b.notificationDate.localeCompare(a.notificationDate);
        }
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      })
      .slice(offset, offset + query.limit);

    return c.json(paginatedResponse(items, query.page, query.limit, total));
  } catch (error) {
    console.error('List notifications error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch notifications'),
      500
    );
  }
});

/**
 * GET /api/notifications/:id
 * 届出の詳細情報を取得
 * アクセス権限: すべての認証済みユーザー（GENERAL は部門チェックあり）
 */
notificationsRouter.get('/:id', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!notification) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // アクセス権限をチェック
    if (authUser.role === 'GENERAL') {
      // GENERAL ユーザーは自部門の届出のみアクセス可能
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== notification.receivingDepartmentId &&
        user.departmentId !== notification.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    return c.json(successResponse(notification));
  } catch (error) {
    console.error('Get notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch notification'),
      500
    );
  }
});

/**
 * POST /api/notifications
 * 新しい届出を作成
 * アクセス権限: すべての認証済みユーザー
 */
notificationsRouter.post('/', zValidator('json', createNotificationSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const data = c.req.valid('json');

  try {
    // ユーザーが受付部門へのアクセス権限を持つかチェック
    if (authUser.role === 'GENERAL') {
      // GENERAL ユーザーは自部門の届出のみ作成可能
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== data.receivingDepartmentId &&
        user.departmentId !== data.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Cannot create notification for other departments'),
          403
        );
      }
    }

    // 届出を作成
    const id = randomUUID();
    const now = getCurrentTimestamp();

    await db.insert(notifications).values({
      id,
      ...data,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
      createdAt: now,
      updatedAt: now,
    });

    // 初期履歴エントリを作成
    await db.insert(notificationHistory).values({
      id: randomUUID(),
      notificationId: id,
      statusFrom: null,
      statusTo: data.currentStatus,
      changedBy: authUser.userId,
      comment: '届出を作成しました',
      changedAt: now,
    });

    // 作成された届出を取得
    const [created] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(created), 201);
  } catch (error) {
    console.error('Create notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to create notification'),
      500
    );
  }
});

/**
 * PUT /api/notifications/:id
 * 届出を更新
 * アクセス権限: SENIOR と ADMIN（全件アクセス可）、GENERAL（自部門のみ）
 */
notificationsRouter.put('/:id', zValidator('json', updateNotificationSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');
  const data = c.req.valid('json');

  try {
    // 既存の届出を取得
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // アクセス権限をチェック
    if (authUser.role === 'GENERAL') {
      // GENERAL ユーザーは自部門の届出のみ更新可能
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== existing.receivingDepartmentId &&
        user.departmentId !== existing.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    // 届出を更新
    const now = getCurrentTimestamp();
    await db
      .update(notifications)
      .set({
        ...data,
        updatedBy: authUser.userId,
        updatedAt: now,
      })
      .where(eq(notifications.id, id));

    // 更新された届出を取得
    const [updated] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(updated));
  } catch (error) {
    console.error('Update notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to update notification'),
      500
    );
  }
});

/**
 * DELETE /api/notifications/:id
 * 届出を削除（スキーマに削除フラグがないため物理削除）
 * アクセス権限: ADMIN のみ
 */
notificationsRouter.delete('/:id', requireAdmin, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    // 届出の存在をチェック
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // 物理削除（スキーマに論理削除フラグがないため）
    // 外部キー制約のため、まず履歴を削除
    await db
      .delete(notificationHistory)
      .where(eq(notificationHistory.notificationId, id));

    // 届出を削除
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));

    return c.json(
      successResponse({ message: 'Notification deleted successfully' })
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to delete notification'),
      500
    );
  }
});

/**
 * PUT /api/notifications/:id/status
 * 届出のステータスを更新
 * アクセス権限: SENIOR と ADMIN
 */
notificationsRouter.put('/:id/status', requireSenior, zValidator('json', updateStatusSchema), async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');
  const { status, comment } = c.req.valid('json');

  try {
    // 既存の届出を取得
    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!existing) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    const oldStatus = existing.currentStatus;

    // ステータスを更新
    const now = getCurrentTimestamp();
    await db
      .update(notifications)
      .set({
        currentStatus: status,
        updatedBy: authUser.userId,
        updatedAt: now,
      })
      .where(eq(notifications.id, id));

    // 履歴エントリを作成
    await db.insert(notificationHistory).values({
      id: randomUUID(),
      notificationId: id,
      statusFrom: oldStatus,
      statusTo: status,
      changedBy: authUser.userId,
      comment: comment || null,
      changedAt: now,
    });

    // 更新された届出を取得
    const [updated] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return c.json(successResponse(updated));
  } catch (error) {
    console.error('Update status error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to update status'),
      500
    );
  }
});

/**
 * GET /api/notifications/:id/history
 * 届出の履歴を取得
 * アクセス権限: すべての認証済みユーザー（GENERAL は部門チェックあり）
 */
notificationsRouter.get('/:id/history', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    // 届出の存在とユーザーのアクセス権限をチェック
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!notification) {
      return c.json(
        errorResponse('NOT_FOUND', 'Notification not found'),
        404
      );
    }

    // アクセス権限をチェック
    if (authUser.role === 'GENERAL') {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        user.departmentId !== notification.receivingDepartmentId &&
        user.departmentId !== notification.processingDepartmentId
      ) {
        return c.json(
          errorResponse('FORBIDDEN', 'Insufficient permissions'),
          403
        );
      }
    }

    // 履歴を取得
    const history = await db
      .select()
      .from(notificationHistory)
      .where(eq(notificationHistory.notificationId, id))
      .orderBy(desc(notificationHistory.changedAt));

    return c.json(successResponse(history));
  } catch (error) {
    console.error('Get history error:', error);
    return c.json(
      errorResponse('INTERNAL_ERROR', 'Failed to fetch history'),
      500
    );
  }
});

export default notificationsRouter;
