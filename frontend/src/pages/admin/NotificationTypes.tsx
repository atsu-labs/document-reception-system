import { useEffect, useState, useMemo } from 'react';
import { fetchNotificationTypes, createNotificationType, updateNotificationType, deleteNotificationType } from '../../lib/masterApi';
import type { NotificationType } from '../../types';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/Alert';

export default function NotificationTypes() {
  const [items, setItems] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationType | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentGroupId, setParentGroupId] = useState<string>('');
  const [requiresAdditionalData, setRequiresAdditionalData] = useState(false);
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotificationTypes();
      setItems(res || []);
    } catch (e) {
      console.error(e);
      setError('届出種類の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 親グループのIDから名前へのマップを作成（パフォーマンス最適化）
  const parentGroupMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(item => {
      map.set(item.id, item.name);
    });
    return map;
  }, [items]);

  // 親グループとして選択可能な届出種別をメモ化（パフォーマンス最適化）
  const selectableParentGroups = useMemo(() => {
    return items.filter(t => !t.parentGroupId);
  }, [items]);

  function openCreate() {
    setEditing(null);
    setCode(`NT${Date.now()}`);
    setName('');
    setDescription('');
    setParentGroupId('');
    setRequiresAdditionalData(false);
    setIsActive(true);
    setDialogOpen(true);
  }

  function openEdit(t: NotificationType) {
    setEditing(t);
    setCode(t.code);
    setName(t.name);
    setDescription(t.description || '');
    setParentGroupId(t.parentGroupId || '');
    setRequiresAdditionalData(t.requiresAdditionalData ?? false);
    setIsActive(t.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!code || !name) {
        setError('コードと名前は必須です');
        return;
      }

      if (editing) {
        await updateNotificationType(editing.id, { 
          code, 
          name, 
          description, 
          parentGroupId: parentGroupId || null,
          requiresAdditionalData,
          isActive 
        });
      } else {
        await createNotificationType({ 
          code, 
          name, 
          description,
          parentGroupId: parentGroupId || null,
          requiresAdditionalData,
          isActive 
        });
      }

      setDialogOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('本当に削除しますか？')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteNotificationType(id);
      await load();
    } catch (e) {
      console.error(e);
      setError('削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">届出種類管理</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-4">
        <div />
        <Button onClick={openCreate}>新規作成</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">コード</th>
              <th className="text-left px-4 py-2">名前</th>
              <th className="text-left px-4 py-2">説明</th>
              <th className="text-left px-4 py-2">親グループ</th>
              <th className="text-left px-4 py-2">追加データ</th>
              <th className="text-left px-4 py-2">状態</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-2">{d.code}</td>
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">{d.description}</td>
                <td className="px-4 py-2">{d.parentGroupId ? (parentGroupMap.get(d.parentGroupId) || '(不明)') : '-'}</td>
                <td className="px-4 py-2">{d.requiresAdditionalData ? '必要' : '不要'}</td>
                <td className="px-4 py-2">{d.isActive ? '有効' : '無効'}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                    編集
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(d.id)}>
                    削除
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  届出種類が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? '届出種類を編集' : '届出種類を作成'}</DialogTitle>
            <DialogDescription>コード・名前・説明を入力してください</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <div>
              <Label>コード</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label>名前</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>説明</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>親グループID（任意）</Label>
              <select 
                className="w-full border rounded px-3 py-2"
                value={parentGroupId} 
                onChange={(e) => setParentGroupId(e.target.value)}
              >
                <option value="">-- なし --</option>
                {selectableParentGroups.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                id="nt-req-additional" 
                type="checkbox" 
                checked={requiresAdditionalData} 
                onChange={(e) => setRequiresAdditionalData(e.target.checked)} 
              />
              <Label htmlFor="nt-req-additional">追加データ必要</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="nt-active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <Label htmlFor="nt-active">有効</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={loading}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
