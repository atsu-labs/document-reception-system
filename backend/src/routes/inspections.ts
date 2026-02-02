import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getDB, Env } from '../db/client';
import { inspections, notifications, users } from '../db/schema';
import { successResponse, errorResponse } from '../utils/response';
import { authMiddleware, getAuthUser } from '../middleware/auth';
import { requireSenior } from '../middleware/permission';
import { getCurrentTimestamp } from '../utils/timestamp';
import { createInspectionSchema, updateInspectionSchema } from '../utils/validation';

const inspectionsRouter = new Hono();

// すべての検査ルートに認証ミドルウェアを適用
inspectionsRouter.use('*', authMiddleware);

/**
 * GET /api/inspections/notification/:notificationId
 * 特定の届出に紐づく検査一覧を取得
 * アクセス権限: すべての認証済みユーザー
 */
inspectionsRouter.get('/notification/:notificationId', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const notificationId = c.req.param('notificationId');

  try {
    // 届出の存在確認
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (!notification) {
      return c.json(errorResponse('NOT_FOUND', 'Notification not found'), 404);
    }

    // 権限チェック（GENERAL ユーザーの場合は自部門のみ）
    if (authUser.role === 'GENERAL') {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        notification.receivingDepartmentId !== user.departmentId &&
        notification.processingDepartmentId !== user.departmentId
      ) {
        return c.json(errorResponse('FORBIDDEN', 'Access denied'), 403);
      }
    }

    // 検査一覧を取得
    const inspectionList = await db
      .select()
      .from(inspections)
      .where(eq(inspections.notificationId, notificationId))
      .orderBy(inspections.inspectionDate);

    return c.json(successResponse(inspectionList));
  } catch (error) {
    console.error('List inspections error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list inspections'), 500);
  }
});

/**
 * GET /api/inspections/:id
 * 特定の検査詳細を取得
 * アクセス権限: すべての認証済みユーザー
 */
inspectionsRouter.get('/:id', async (c) => {
  const authUser = getAuthUser(c);
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, id))
      .limit(1);

    if (!inspection) {
      return c.json(errorResponse('NOT_FOUND', 'Inspection not found'), 404);
    }

    // 届出の権限チェック
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, inspection.notificationId))
      .limit(1);

    if (!notification) {
      return c.json(errorResponse('NOT_FOUND', 'Related notification not found'), 404);
    }

    // GENERAL ユーザーの場合は自部門のみ
    if (authUser.role === 'GENERAL') {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, authUser.userId))
        .limit(1);

      if (
        user?.departmentId &&
        notification.receivingDepartmentId !== user.departmentId &&
        notification.processingDepartmentId !== user.departmentId
      ) {
        return c.json(errorResponse('FORBIDDEN', 'Access denied'), 403);
      }
    }

    return c.json(successResponse(inspection));
  } catch (error) {
    console.error('Get inspection error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to get inspection'), 500);
  }
});

/**
 * POST /api/inspections
 * 新しい検査を作成
 * アクセス権限: SENIOR以上
 */
inspectionsRouter.post(
  '/',
  requireSenior,
  zValidator('json', createInspectionSchema),
  async (c) => {
    const authUser = getAuthUser(c);
    const db = getDB(c.env as Env);
    const data = c.req.valid('json');

    try {
      // 届出の存在確認
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, data.notificationId))
        .limit(1);

      if (!notification) {
        return c.json(errorResponse('NOT_FOUND', 'Notification not found'), 404);
      }

      // 検査を作成
      const id = randomUUID();
      const now = getCurrentTimestamp();

      await db.insert(inspections).values({
        id,
        notificationId: data.notificationId,
        inspectionDate: data.inspectionDate,
        inspectionDepartmentId: data.inspectionDepartmentId,
        inspectionType: data.inspectionType ?? null,
        status: data.status ?? '予定',
        result: data.result ?? null,
        notes: data.notes ?? null,
        inspectedBy: null,
        inspectedAt: null,
        createdBy: authUser.userId,
        updatedBy: authUser.userId,
        createdAt: now,
        updatedAt: now,
      });

      // 作成された検査を取得
      const [created] = await db
        .select()
        .from(inspections)
        .where(eq(inspections.id, id))
        .limit(1);

      return c.json(successResponse(created), 201);
    } catch (error) {
      console.error('Create inspection error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create inspection'), 500);
    }
  }
);

/**
 * PUT /api/inspections/:id
 * 検査情報を更新
 * アクセス権限: SENIOR以上
 */
inspectionsRouter.put(
  '/:id',
  requireSenior,
  zValidator('json', updateInspectionSchema),
  async (c) => {
    const authUser = getAuthUser(c);
    const db = getDB(c.env as Env);
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      // 検査の存在確認
      const [inspection] = await db
        .select()
        .from(inspections)
        .where(eq(inspections.id, id))
        .limit(1);

      if (!inspection) {
        return c.json(errorResponse('NOT_FOUND', 'Inspection not found'), 404);
      }

      // 更新
      const now = getCurrentTimestamp();
      const updateData: any = {
        updatedBy: authUser.userId,
        updatedAt: now,
      };

      if (data.inspectionDate !== undefined) updateData.inspectionDate = data.inspectionDate;
      if (data.inspectionDepartmentId !== undefined) updateData.inspectionDepartmentId = data.inspectionDepartmentId;
      if (data.inspectionType !== undefined) updateData.inspectionType = data.inspectionType;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.result !== undefined) updateData.result = data.result;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.inspectedBy !== undefined) updateData.inspectedBy = data.inspectedBy;
      if (data.inspectedAt !== undefined) updateData.inspectedAt = data.inspectedAt;

      await db.update(inspections).set(updateData).where(eq(inspections.id, id));

      // 更新された検査を取得
      const [updated] = await db
        .select()
        .from(inspections)
        .where(eq(inspections.id, id))
        .limit(1);

      return c.json(successResponse(updated));
    } catch (error) {
      console.error('Update inspection error:', error);
      return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update inspection'), 500);
    }
  }
);

/**
 * DELETE /api/inspections/:id
 * 検査を削除
 * アクセス権限: SENIOR以上
 */
inspectionsRouter.delete('/:id', requireSenior, async (c) => {
  const db = getDB(c.env as Env);
  const id = c.req.param('id');

  try {
    // 検査の存在確認
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, id))
      .limit(1);

    if (!inspection) {
      return c.json(errorResponse('NOT_FOUND', 'Inspection not found'), 404);
    }

    // 削除
    await db.delete(inspections).where(eq(inspections.id, id));

    return c.json(successResponse({ message: '検査を削除しました' }));
  } catch (error) {
    console.error('Delete inspection error:', error);
    return c.json(errorResponse('INTERNAL_ERROR', 'Failed to delete inspection'), 500);
  }
});

export default inspectionsRouter;
