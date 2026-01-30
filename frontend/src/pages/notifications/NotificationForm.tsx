import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { notificationsApi, masterApi } from '@/lib/notificationApi';
import { notificationCreateSchema, type NotificationCreateInput } from '@/lib/validations/notification';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/Alert';

export default function NotificationForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

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

  // Fetch notification for edit mode
  const { data: notification, isLoading: loadingNotification } = useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationsApi.getById(id!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<NotificationCreateInput>({
    resolver: zodResolver(notificationCreateSchema),
    defaultValues: {
      notificationTypeId: '',
      notificationDate: format(new Date(), 'yyyy-MM-dd'),
      receivingDepartmentId: user?.departmentId || '',
      processingDepartmentId: '',
      propertyName: '',
      content: '',
      inspectionDate: '',
      inspectionDepartmentId: '',
      completionDate: '',
      currentStatus: '受付',
    },
  });

  // Watch notification type to show/hide fields
  const selectedNotificationTypeId = watch('notificationTypeId');
  const selectedNotificationType = useMemo(() => {
    return notificationTypes?.find((t) => t.id === selectedNotificationTypeId);
  }, [notificationTypes, selectedNotificationTypeId]);

  // Populate form in edit mode
  useEffect(() => {
    if (notification && isEditMode) {
      reset({
        notificationTypeId: notification.notificationTypeId,
        notificationDate: notification.notificationDate,
        receivingDepartmentId: notification.receivingDepartmentId,
        processingDepartmentId: notification.processingDepartmentId,
        propertyName: notification.propertyName || '',
        content: notification.content || '',
        inspectionDate: notification.inspectionDate || '',
        inspectionDepartmentId: notification.inspectionDepartmentId || '',
        completionDate: notification.completionDate || '',
        currentStatus: notification.currentStatus,
      });
    }
  }, [notification, isEditMode, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: notificationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigate('/notifications');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: NotificationCreateInput) =>
      notificationsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
      navigate(`/notifications/${id}`);
    },
  });

  const onSubmit = async (data: NotificationCreateInput) => {
    // Clean optional fields: send undefined/null instead of empty string for UUID/date optional fields
    const clean: NotificationCreateInput = {
      ...data,
      inspectionDepartmentId: data.inspectionDepartmentId ? data.inspectionDepartmentId : undefined,
      inspectionDate: data.inspectionDate ? data.inspectionDate : undefined,
      completionDate: data.completionDate ? data.completionDate : undefined,
      content: data.content ? data.content : undefined,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(clean);
      } else {
        await createMutation.mutateAsync(clean);
      }
    } catch (err: any) {
      try {
        if (err?.response) {
          const body = await err.response.json();
          console.error('API error body:', body);
        }
      } catch (e) {
        // ignore
      }
      console.error('Failed to save notification:', err);
      throw err;
    }
  };

  if (isEditMode && loadingNotification) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">読み込み中...</div>
      </div>
    );
  }

  const mutation = isEditMode ? updateMutation : createMutation;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? '届出編集' : '届出新規登録'}
        </h1>
      </div>

      {mutation.isError && (
        <Alert variant="destructive" className="mb-6">
          {(mutation.error as Error).message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notificationTypeId">
                届出種類 <span className="text-red-500">*</span>
              </Label>
              <Select
                id="notificationTypeId"
                {...register('notificationTypeId')}
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                {notificationTypes?.filter(t => t.isActive).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
              {errors.notificationTypeId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.notificationTypeId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notificationDate">
                届出日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="notificationDate"
                type="date"
                {...register('notificationDate')}
                disabled={isSubmitting}
              />
              {errors.notificationDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.notificationDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="receivingDepartmentId">
                受付所属 <span className="text-red-500">*</span>
              </Label>
              <Select
                id="receivingDepartmentId"
                {...register('receivingDepartmentId')}
                disabled={isSubmitting || user?.role === 'GENERAL'}
              >
                <option value="">選択してください</option>
                {departments?.filter(d => d.isActive).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
              {errors.receivingDepartmentId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.receivingDepartmentId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="processingDepartmentId">
                処理所属 <span className="text-red-500">*</span>
              </Label>
              <Select
                id="processingDepartmentId"
                {...register('processingDepartmentId')}
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                {departments?.filter(d => d.isActive).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
              {errors.processingDepartmentId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.processingDepartmentId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyName">物件名</Label>
              <Input
                id="propertyName"
                {...register('propertyName')}
                placeholder="対象物件名を入力"
                disabled={isSubmitting}
              />
              {errors.propertyName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.propertyName.message}
                </p>
              )}
            </div>

            {selectedNotificationType?.hasContentField && (
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  {...register('content')}
                  placeholder="内容を入力"
                  rows={4}
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="currentStatus">
                ステータス <span className="text-red-500">*</span>
              </Label>
              <Select
                id="currentStatus"
                {...register('currentStatus')}
                disabled={isSubmitting || isEditMode}
              >
                <option value="受付">受付</option>
                <option value="処理中">処理中</option>
                <option value="検査">検査</option>
                <option value="完了">完了</option>
              </Select>
              {errors.currentStatus && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentStatus.message}
                </p>
              )}
              {isEditMode && (
                <p className="text-sm text-muted-foreground mt-1">
                  ステータスの変更は詳細画面で行ってください
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedNotificationType?.hasInspection && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>検査情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inspectionDate">検査日</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  {...register('inspectionDate')}
                  disabled={isSubmitting}
                />
                {errors.inspectionDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.inspectionDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="inspectionDepartmentId">検査所属</Label>
                <Select
                  id="inspectionDepartmentId"
                  {...register('inspectionDepartmentId')}
                  disabled={isSubmitting}
                >
                  <option value="">選択してください</option>
                  {departments?.filter(d => d.isActive).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
                {errors.inspectionDepartmentId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.inspectionDepartmentId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>完了情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="completionDate">完了日</Label>
              <Input
                id="completionDate"
                type="date"
                {...register('completionDate')}
                disabled={isSubmitting}
              />
              {errors.completionDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.completionDate.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEditMode ? `/notifications/${id}` : '/notifications')}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : isEditMode ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </div>
  );
}
