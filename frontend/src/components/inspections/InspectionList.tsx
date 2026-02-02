import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import type { Inspection, Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import api from '@/lib/api';

interface InspectionListProps {
  notificationId: string;
  departments: Department[];
}

interface InspectionFormData {
  inspectionDate: string;
  inspectionDepartmentId: string;
  inspectionType: string;
  status: string;
  result: string;
  notes: string;
}

export default function InspectionList({ notificationId, departments }: InspectionListProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [formData, setFormData] = useState<InspectionFormData>({
    inspectionDate: '',
    inspectionDepartmentId: '',
    inspectionType: '',
    status: '予定',
    result: '',
    notes: '',
  });

  // 検査一覧を取得
  const { data: inspections, isLoading, error } = useQuery<Inspection[]>({
    queryKey: ['inspections', notificationId],
    queryFn: async () => {
      const res = await api.get(`inspections/notification/${notificationId}`).json<{ success: boolean; data: Inspection[] }>();
      return res.data || [];
    },
    enabled: !!notificationId,
  });

  // 部署マップを作成
  const departmentMap = useMemo(() => {
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);

  // 検査作成mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Inspection>) => {
      return await api.post('inspections', { json: data }).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', notificationId] });
      setDialogOpen(false);
      resetForm();
    },
  });

  // 検査更新mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
      return await api.put(`inspections/${id}`, { json: data }).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', notificationId] });
      setDialogOpen(false);
      resetForm();
    },
  });

  // 検査削除mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`inspections/${id}`).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', notificationId] });
    },
  });

  const resetForm = () => {
    setEditing(null);
    setFormData({
      inspectionDate: '',
      inspectionDepartmentId: '',
      inspectionType: '',
      status: '予定',
      result: '',
      notes: '',
    });
  };

  const openCreate = () => {
    resetForm();
    setFormData({
      ...formData,
      inspectionDepartmentId: departments[0]?.id || '',
    });
    setDialogOpen(true);
  };

  const openEdit = (inspection: Inspection) => {
    setEditing(inspection);
    setFormData({
      inspectionDate: inspection.inspectionDate,
      inspectionDepartmentId: inspection.inspectionDepartmentId,
      inspectionType: inspection.inspectionType || '',
      status: inspection.status,
      result: inspection.result || '',
      notes: inspection.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Inspection> = {
      notificationId,
      inspectionDate: formData.inspectionDate,
      inspectionDepartmentId: formData.inspectionDepartmentId,
      inspectionType: formData.inspectionType || null,
      status: formData.status,
      result: formData.result || null,
      notes: formData.notes || null,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (id: string) => {
    setInspectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!inspectionToDelete) return;
    await deleteMutation.mutateAsync(inspectionToDelete);
    setDeleteDialogOpen(false);
    setInspectionToDelete(null);
  };

  // 権限チェック（SENIOR以上のみ作成・編集・削除可能）
  const canManage = user?.role === 'SENIOR' || user?.role === 'ADMIN';

  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>検査情報の取得に失敗しました</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>検査情報</CardTitle>
        {canManage && (
          <Button onClick={openCreate} size="sm">
            検査を追加
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {inspections && inspections.length > 0 ? (
          <div className="space-y-4">
            {inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">検査種別</Label>
                      <div className="font-medium">{inspection.inspectionType || '-'}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">検査日</Label>
                      <div>{format(new Date(inspection.inspectionDate), 'yyyy年MM月dd日')}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">検査所属</Label>
                      <div>{departmentMap[inspection.inspectionDepartmentId] || inspection.inspectionDepartmentId}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">ステータス</Label>
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-sm ${
                            inspection.status === '予定'
                              ? 'bg-blue-100 text-blue-800'
                              : inspection.status === '実施済み'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {inspection.status}
                        </span>
                      </div>
                    </div>
                    {inspection.result && (
                      <div>
                        <Label className="text-sm text-muted-foreground">結果</Label>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 rounded text-sm ${
                              inspection.result === '合格'
                                ? 'bg-green-100 text-green-800'
                                : inspection.result === '不合格'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {inspection.result}
                          </span>
                        </div>
                      </div>
                    )}
                    {inspection.notes && (
                      <div className="md:col-span-2">
                        <Label className="text-sm text-muted-foreground">備考</Label>
                        <div className="text-sm whitespace-pre-wrap">{inspection.notes}</div>
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(inspection)}
                      >
                        編集
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(inspection.id)}
                      >
                        削除
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            検査情報がありません
          </div>
        )}

        {/* 検査追加・編集ダイアログ */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? '検査を編集' : '検査を追加'}</DialogTitle>
              </DialogHeader>

              {(createMutation.isError || updateMutation.isError) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {(createMutation.error as Error)?.message ||
                      (updateMutation.error as Error)?.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="inspectionType">検査種別</Label>
                  <Input
                    id="inspectionType"
                    value={formData.inspectionType}
                    onChange={(e) =>
                      setFormData({ ...formData, inspectionType: e.target.value })
                    }
                    placeholder="例: 中間検査、完了検査"
                  />
                </div>

                <div>
                  <Label htmlFor="inspectionDate">検査予定日 *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, inspectionDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inspectionDepartmentId">検査担当所属 *</Label>
                  <Select
                    value={formData.inspectionDepartmentId}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        inspectionDepartmentId: value,
                      })
                    }
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">ステータス *</Label>
                  <Select
                    value={formData.status}
                    onChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <option value="予定">予定</option>
                    <option value="実施済み">実施済み</option>
                    <option value="中止">中止</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="result">結果</Label>
                  <Select
                    value={formData.result}
                    onChange={(value) =>
                      setFormData({ ...formData, result: value })
                    }
                  >
                    <option value="">-- 選択してください --</option>
                    <option value="合格">合格</option>
                    <option value="不合格">不合格</option>
                    <option value="条件付き合格">条件付き合格</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="検査に関する詳細情報を入力してください"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? '更新' : '追加'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 削除確認ダイアログ */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="検査を削除"
          description="この検査を削除してもよろしいですか？この操作は取り消せません。"
          onConfirm={confirmDelete}
          confirmText="削除"
          cancelText="キャンセル"
        />
      </CardContent>
    </Card>
  );
}
