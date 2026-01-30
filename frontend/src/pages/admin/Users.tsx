import { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../lib/masterApi';
import type { User, UserRole } from '../../types';

export default function Users() {
  const [items, setItems] = useState<User[]>([]);

  async function load() {
    const res = await fetchUsers();
    setItems(res || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">ユーザー管理</h1>
      <button
        className="btn-primary mb-4"
        onClick={async () => {
          const username = window.prompt('ユーザー名を入力してください');
          if (!username) return;
          const displayName = window.prompt('表示名を入力してください', username) || username;
          const password = window.prompt('初期パスワードを入力してください', 'password123') || 'password123';
          const roleInput = window.prompt('ロール (GENERAL|SENIOR|ADMIN)', 'GENERAL') || 'GENERAL';
          const allowed: UserRole[] = ['GENERAL', 'SENIOR', 'ADMIN'];
          const role = allowed.includes(roleInput as UserRole) ? (roleInput as UserRole) : 'GENERAL';
          await createUser({ username, displayName, password, role, departmentId: items[0]?.departmentId || '' });
          await load();
        }}
      >
        新規作成
      </button>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>ユーザー名</th>
            <th>表示名</th>
            <th>ロール</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.displayName}</td>
              <td>{u.role}</td>
              <td>
                <button
                  onClick={async () => {
                    const newDisplay = window.prompt('表示名を入力してください', u.displayName);
                    if (!newDisplay) return;
                    await updateUser(u.id, { displayName: newDisplay });
                    await load();
                  }}
                >編集</button>
                <button
                  onClick={async () => {
                    if (!confirm('削除してよいですか？')) return;
                    await deleteUser(u.id);
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
