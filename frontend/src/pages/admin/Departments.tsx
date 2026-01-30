import { useEffect, useState } from 'react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../lib/masterApi';
import type { Department } from '../../types';
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

export default function Departments() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDepartments();
      setItems(res || []);
    } catch (e) {
      console.error(e);
      setError('所属の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setCode(`DEPT${Date.now()}`);
    setName('');
    setIsActive(true);
    setDialogOpen(true);
  }

  function openEdit(d: Department) {
    setEditing(d);
    setCode(d.code);
    setName(d.name);
    setIsActive(d.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!name || !code) {
        setError('コードと名前は必須です');
        return;
      }

      if (editing) {
        await updateDepartment(editing.id, { name, code, isActive });
      } else {
        await createDepartment({ name, code, isActive });
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
      await deleteDepartment(id);
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
      <h1 className="text-2xl mb-4">所属管理</h1>

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
              <th className="text-left px-4 py-2">状態</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-2">{d.code}</td>
                <td className="px-4 py-2">{d.name}</td>
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
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  所属が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? '所属を編集' : '所属を作成'}</DialogTitle>
            <DialogDescription>
              所属コードと名前を入力してください
            </DialogDescription>
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
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="active">有効</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
