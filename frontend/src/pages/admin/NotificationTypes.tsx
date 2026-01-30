import { useEffect, useState } from 'react';
import { fetchNotificationTypes, createNotificationType, updateNotificationType, deleteNotificationType } from '../../lib/masterApi';
import type { NotificationType } from '../../types';

export default function NotificationTypes() {
  const [items, setItems] = useState<NotificationType[]>([]);

  async function load() {
    const res = await fetchNotificationTypes();
    setItems(res || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">届出種類管理</h1>
      <button
        className="btn-primary mb-4"
        onClick={async () => {
          const name = window.prompt('届出種類名を入力してください');
          if (!name) return;
          const code = window.prompt('コードを入力してください', `NT${Date.now()}`) || '';
          await createNotificationType({ name, code });
          await load();
        }}
      >
        新規作成
      </button>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>コード</th>
            <th>名前</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td>{d.code}</td>
              <td>{d.name}</td>
              <td>
                <button
                  onClick={async () => {
                    const newName = window.prompt('新しい名前を入力してください', d.name);
                    if (!newName) return;
                    await updateNotificationType(d.id, { name: newName });
                    await load();
                  }}
                >編集</button>
                <button
                  onClick={async () => {
                    if (!confirm('削除してよいですか？')) return;
                    await deleteNotificationType(d.id);
                    await load();
                  }}
                >削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
