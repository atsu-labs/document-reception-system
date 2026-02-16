import { useEffect, useState } from 'react';
import { fetchNotificationGroups, createNotificationGroup, updateNotificationGroup, deleteNotificationGroup } from '../../lib/masterApi';
import type { NotificationGroup } from '../../types';
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

export default function NotificationGroups() {
  const [items, setItems] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationGroup | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotificationGroups();
      setItems(res || []);
    } catch (e) {
      console.error(e);
      setError('届出グループの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setCode(`NTG${Date.now()}`);
    setName('');
    setDescription('');
    setSortOrder(0);
    setIsActive(true);
    setDialogOpen(true);
  }

  function openEdit(g: NotificationGroup) {
    setEditing(g);
    setCode(g.code);
    setName(g.name);
    setDescription(g.description || '');
    setSortOrder(g.sortOrder);
    setIsActive(g.isActive);
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
        await updateNotificationGroup(editing.id, { 
          code, 
          name, 
          description, 
          sortOrder,
          isActive 
        });
      } else {
        await createNotificationGroup({ 
          code, 
          name, 
          description,
          sortOrder,
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
    if (!confirm('本当に削除しますか？\n※このグループに属する届出種別がある場合、削除できません。')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteNotificationGroup(id);
      await load();
    } catch (e) {
      console.error(e);
      setError('削除に失敗しました。このグループに属する届出種別が存在する可能性があります。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">届出グループ管理</h1>

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
              <th className="text-left px-4 py-2">並び順</th>
              <th className="text-left px-4 py-2">状態</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="px-4 py-2">{g.code}</td>
                <td className="px-4 py-2">{g.name}</td>
                <td className="px-4 py-2">{g.description}</td>
                <td className="px-4 py-2">{g.sortOrder}</td>
                <td className="px-4 py-2">{g.isActive ? '有効' : '無効'}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(g)}>
                    編集
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(g.id)}>
                    削除
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  届出グループが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? '届出グループを編集' : '届出グループを作成'}</DialogTitle>
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
              <Label>並び順</Label>
              <Input 
                type="number" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)} 
              />
            </div>
            <div className="flex items-center gap-2">
              <input id="ntg-active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <Label htmlFor="ntg-active">有効</Label>
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
