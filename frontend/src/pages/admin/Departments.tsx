import { useEffect, useState } from 'react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../lib/masterApi';
import type { Department } from '../../types';

export default function Departments() {
  const [items, setItems] = useState<Department[]>([]);

  async function load() {
    const res = await fetchDepartments();
    setItems(res || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">所属管理</h1>
      <button
        className="btn-primary mb-4"
        onClick={async () => {
          const name = window.prompt('所属名を入力してください');
          if (!name) return;
          const code = window.prompt('コードを入力してください', `DEPT${Date.now()}`) || '';
          await createDepartment({ name, code });
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
                    await updateDepartment(d.id, { name: newName });
                    await load();
                  }}
                >編集</button>
                <button
                  onClick={async () => {
                    if (!confirm('削除してよいですか？')) return;
                    await deleteDepartment(d.id);
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
