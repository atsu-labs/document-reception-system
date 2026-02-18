import { useEffect, useState, useMemo } from 'react';
import { fetchNotificationGroups, fetchNotificationTypes, createNotificationType, updateNotificationType, deleteNotificationType } from '../../lib/masterApi';
import type { NotificationGroup, NotificationType } from '../../types';
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
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationType | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [hasInspection, setHasInspection] = useState(false);
  const [hasCertificateIssue, setHasCertificateIssue] = useState(false);
  const [requiresAdditionalData, setRequiresAdditionalData] = useState(false);
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [typesRes, groupsRes] = await Promise.all([
        fetchNotificationTypes(),
        fetchNotificationGroups()
      ]);
      setItems(typesRes || []);
      setGroups(groupsRes || []);
    } catch (e) {
      console.error(e);
      setError('届出種別と届出グループの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // グループIDから名前へのマップを作成（パフォーマンス最適化）
  const groupMap = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach(group => {
      map.set(group.id, group.name);
    });
    return map;
  }, [groups]);

  function openCreate() {
    setEditing(null);
    setCode(`NT${Date.now()}`);
    setName('');
    setDescription('');
    // グループが存在する場合のみデフォルト値を設定
    setGroupId(groups.length > 0 ? groups[0].id : '');
    setHasInspection(false);
    setHasCertificateIssue(false);
    setRequiresAdditionalData(false);
    setIsActive(true);
    // グループが存在しない場合はエラーメッセージを表示
    if (groups.length === 0) {
      setError('届出種別を作成する前に、まず届出グループを作成してください');
      return;
    }
    setDialogOpen(true);
  }

  function openEdit(t: NotificationType) {
    setEditing(t);
    setCode(t.code);
    setName(t.name);
    setDescription(t.description || '');
    setGroupId(t.groupId);
    setHasInspection(t.hasInspection ?? false);
    setHasCertificateIssue(t.hasCertificateIssue ?? false);
    setRequiresAdditionalData(t.requiresAdditionalData ?? false);
    setIsActive(t.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!code || !name || !groupId) {
        setError('コード、名前、届出グループは必須です');
        return;
      }

      if (editing) {
        await updateNotificationType(editing.id, { 
          code, 
          name, 
          description, 
          groupId,
          hasInspection,
          hasCertificateIssue,
          requiresAdditionalData,
          isActive 
        });
      } else {
        await createNotificationType({ 
          code, 
          name, 
          description,
          groupId,
          hasInspection,
          hasCertificateIssue,
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
              <th className="text-left px-4 py-2">届出グループ</th>
              <th className="text-left px-4 py-2">検査</th>
              <th className="text-left px-4 py-2">証明書</th>
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
                <td className="px-4 py-2">{groupMap.get(d.groupId) || '(不明)'}</td>
                <td className="px-4 py-2">{d.hasInspection ? '有' : '無'}</td>
                <td className="px-4 py-2">{d.hasCertificateIssue ? '有' : '無'}</td>
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
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-muted-foreground">
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
              <Label>届出グループ（必須）</Label>
              <select 
                className="w-full border rounded px-3 py-2"
                value={groupId} 
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">-- 選択してください --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                id="nt-has-inspection" 
                type="checkbox" 
                checked={hasInspection} 
                onChange={(e) => setHasInspection(e.target.checked)} 
              />
              <Label htmlFor="nt-has-inspection">検査の有無</Label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                id="nt-has-certificate" 
                type="checkbox" 
                checked={hasCertificateIssue} 
                onChange={(e) => setHasCertificateIssue(e.target.checked)} 
              />
              <Label htmlFor="nt-has-certificate">証明書発行の有無</Label>
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
