import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { notificationsApi, masterApi } from '@/lib/notificationApi';
import { statusChangeSchema, type StatusChangeInput } from '@/lib/validations/notification';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Alert } from '@/components/ui/Alert';
import InspectionList from '@/components/inspections/InspectionList';

export default function NotificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch notification
  const { data: notification, isLoading, error } = useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch history
  const { data: history } = useQuery({
    queryKey: ['notification-history', id],
    queryFn: () => notificationsApi.getHistory(id!),
    enabled: !!id,
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterApi.getDepartments(),
  });

  // Fetch notification types
  const { data: notificationTypes } = useQuery({
    queryKey: ['notificationTypes'],
    queryFn: () => masterApi.getNotificationTypes(),
  });

  // Create lookup maps
  const departmentMap = useMemo(() => {
    if (!departments) return {};
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);

  const notificationTypeMap = useMemo(() => {
    if (!notificationTypes) return {};
    return notificationTypes.reduce((acc, type) => {
      acc[type.id] = type.name;
      return acc;
    }, {} as Record<string, string>);
  }, [notificationTypes]);

  const notificationType = useMemo(() => {
    if (!notification || !notificationTypes) return null;
    return notificationTypes.find((t) => t.id === notification.notificationTypeId);
  }, [notification, notificationTypes]);

  // Status change form
  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    formState: { errors: statusErrors, isSubmitting: isSubmittingStatus },
    reset: resetStatus,
  } = useForm<StatusChangeInput>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      status: notification?.currentStatus || '',
      comment: '',
    },
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: (data: StatusChangeInput) =>
      notificationsApi.changeStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
      queryClient.invalidateQueries({ queryKey: ['notification-history', id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setStatusDialogOpen(false);
      resetStatus();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => notificationsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigate('/notifications');
    },
  });

  const onSubmitStatus = async (data: StatusChangeInput) => {
    try {
      await statusMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const canEdit = useMemo(() => {
    if (!user || !notification) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'SENIOR') return true;
    if (user.role === 'GENERAL' && notification.receivingDepartmentId === user.departmentId) {
      return true;
    }
    return false;
  }, [user, notification]);

  const canChangeStatus = useMemo(() => {
    if (!user) return false;
    return user.role === 'SENIOR' || user.role === 'ADMIN';
  }, [user]);

  const canDelete = useMemo(() => {
    if (!user) return false;
    return user.role === 'ADMIN';
  }, [user]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          エラーが発生しました: {(error as Error).message}
        </Alert>
      </div>
    );
  }

  if (isLoading || !notification) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">届出詳細</h1>
        <div className="flex gap-2">
          {canChangeStatus && (
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(true)}
            >
              ステータス変更
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/notifications/${id}/edit`)}
            >
              編集
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              削除
            </Button>
          )}
        </div>
      </div>

      {deleteMutation.isError && (
        <Alert variant="destructive" className="mb-6">
          {(deleteMutation.error as Error).message}
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>届出種類</Label>
              <div className="mt-1">
                {notificationTypeMap[notification.notificationTypeId] || notification.notificationTypeId}
              </div>
            </div>
            <div>
              <Label>届出日</Label>
              <div className="mt-1">
                {format(new Date(notification.notificationDate), 'yyyy年MM月dd日')}
              </div>
            </div>
            <div>
              <Label>受付所属</Label>
              <div className="mt-1">
                {departmentMap[notification.receivingDepartmentId] || notification.receivingDepartmentId}
              </div>
            </div>
            <div>
              <Label>処理所属</Label>
              <div className="mt-1">
                {departmentMap[notification.processingDepartmentId] || notification.processingDepartmentId}
              </div>
            </div>
            <div>
              <Label>物件名</Label>
              <div className="mt-1">{notification.propertyName || '-'}</div>
            </div>
            <div>
              <Label>ステータス</Label>
              <div className="mt-1">
                <StatusBadge status={notification.currentStatus} />
              </div>
            </div>
          </div>

          {notificationType?.hasContentField && notification.content && (
            <div>
              <Label>内容</Label>
              <div className="mt-1 whitespace-pre-wrap">
                {notification.content}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Information */}
      {notificationType?.hasInspection && departments && (
        <InspectionList 
          notificationId={notification.id} 
          departments={departments}
        />
      )}

      {/* Completion Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>完了情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>完了日</Label>
            <div className="mt-1">
              {notification.completionDate
                ? format(new Date(notification.completionDate), 'yyyy年MM月dd日')
                : '-'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-l-2 border-primary pl-4 pb-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {item.statusFrom && (
                      <>
                        <StatusBadge status={item.statusFrom} />
                        <span>→</span>
                      </>
                    )}
                    <StatusBadge status={item.statusTo} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(item.changedAt), 'yyyy/MM/dd HH:mm')}
                  </div>
                  {item.comment && (
                    <div className="mt-1 text-sm">{item.comment}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              履歴がありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent onClose={() => setStatusDialogOpen(false)}>
          <form onSubmit={handleSubmitStatus(onSubmitStatus)}>
            <DialogHeader>
              <DialogTitle>ステータス変更</DialogTitle>
            </DialogHeader>
            {statusMutation.isError && (
              <Alert variant="destructive" className="my-4">
                {(statusMutation.error as Error).message}
              </Alert>
            )}
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="status">
                  新しいステータス <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="status"
                  {...registerStatus('status')}
                  disabled={isSubmittingStatus}
                >
                  <option value="">選択してください</option>
                  <option value="受付">受付</option>
                  <option value="処理中">処理中</option>
                  <option value="検査">検査</option>
                  <option value="完了">完了</option>
                  <option value="キャンセル">キャンセル</option>
                </Select>
                {statusErrors.status && (
                  <p className="text-sm text-red-500 mt-1">
                    {statusErrors.status.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="comment">コメント</Label>
                <Textarea
                  id="comment"
                  {...registerStatus('comment')}
                  placeholder="変更理由などを入力"
                  rows={3}
                  disabled={isSubmittingStatus}
                />
                {statusErrors.comment && (
                  <p className="text-sm text-red-500 mt-1">
                    {statusErrors.comment.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={isSubmittingStatus}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmittingStatus}>
                {isSubmittingStatus ? '変更中...' : '変更'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="届出の削除"
        description="この届出を削除してもよろしいですか？この操作は取り消せません。"
        confirmText="削除"
        isDestructive
      />
    </div>
  );
}
