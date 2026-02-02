import { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, fetchDepartments } from '../../lib/masterApi';
import type { User, UserRole, Department } from '../../types';
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
import { Select } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/Alert';

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GENERAL');
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [users, depts] = await Promise.all([fetchUsers(), fetchDepartments()]);
      setItems(users || []);
      setDepartments(depts || []);
    } catch (e) {
      console.error(e);
      setError('ユーザーまたは部署の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setUsername('');
    setDisplayName('');
    setPassword('password123');
    setRole('GENERAL');
    setDepartmentId(departments[0]?.id);
    setDialogOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setUsername(u.username);
    setDisplayName(u.displayName);
    setPassword('');
    setRole(u.role as UserRole);
    setDepartmentId(u.departmentId);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!username || !displayName) {
        setError('ユーザー名と表示名は必須です');
        return;
      }

      if (editing) {
        const payload: Partial<User> & { password?: string } = { 
          displayName, 
          role, 
          departmentId: departmentId || '' 
        };
        if (password) payload.password = password;
        await updateUser(editing.id, payload);
      } else {
        await createUser({ username, displayName, password, role, departmentId: departmentId || '' });
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
      await deleteUser(id);
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
      <h1 className="text-2xl mb-4">ユーザー管理</h1>

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
              <th className="text-left px-4 py-2">ユーザー名</th>
              <th className="text-left px-4 py-2">表示名</th>
              <th className="text-left px-4 py-2">ロール</th>
              <th className="text-left px-4 py-2">部署</th>
              <th className="text-left px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.displayName}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.departmentId}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(u)}>編集</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>削除</Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">ユーザーが見つかりません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'ユーザーを編集' : 'ユーザーを作成'}</DialogTitle>
            <DialogDescription>ユーザー情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <div>
              <Label>ユーザー名</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={!!editing} />
            </div>
            <div>
              <Label>表示名</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label>初期パスワード{editing ? '（変更する場合）' : ''}</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
            <div>
              <Label>ロール</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="GENERAL">GENERAL</option>
                <option value="SENIOR">SENIOR</option>
                <option value="ADMIN">ADMIN</option>
              </Select>
            </div>
            <div>
              <Label>部署</Label>
              <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">(未選択)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={loading}>{editing ? '更新' : '作成'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
