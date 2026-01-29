import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SENIOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GENERAL':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '管理者';
      case 'SENIOR':
        return '上位ユーザー';
      case 'GENERAL':
        return '一般ユーザー';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                届出管理システム
              </h1>
              <p className="text-sm text-slate-600">
                Document Reception System
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-slate-500">{user.username}</p>
                  </div>
                  <button
                    onClick={() => navigate('/password-change')}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                  >
                    パスワード変更
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  >
                    ログアウト
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-left hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900">届出一覧</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              届出の一覧表示・検索・管理
            </p>
          </button>
          
          <button
            onClick={() => navigate('/notifications/new')}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-left hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900">新規登録</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              新しい届出を登録
            </p>
          </button>

          <button
            onClick={() => navigate('/password-change')}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-left hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900">設定</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-slate-600 group-hover:rotate-90 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              パスワード変更など
            </p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            ログイン情報
          </h2>
          
          {user && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ユーザーID
                  </label>
                  <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ユーザー名
                  </label>
                  <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                    {user.username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    表示名
                  </label>
                  <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                    {user.displayName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ロール
                  </label>
                  <div className="inline-flex">
                    <span
                      className={`text-sm font-medium px-3 py-2 rounded border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    部署ID
                  </label>
                  <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                    {user.departmentId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    アカウント状態
                  </label>
                  <div className="inline-flex">
                    <span
                      className={`text-sm font-medium px-3 py-2 rounded border ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {user.isActive ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  権限情報
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">現在のロール: {getRoleLabel(user.role)}</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        {user.role === 'GENERAL' && (
                          <>
                            <li>自部署の届出登録・閲覧</li>
                            <li>自分が登録した届出の編集</li>
                          </>
                        )}
                        {user.role === 'SENIOR' && (
                          <>
                            <li>複数部署の届出閲覧</li>
                            <li>届出のステータス更新</li>
                            <li>GENERALユーザーの権限を含む</li>
                          </>
                        )}
                        {user.role === 'ADMIN' && (
                          <>
                            <li>全データへのアクセス</li>
                            <li>マスターデータの管理</li>
                            <li>ユーザー管理</li>
                            <li>すべての権限を保有</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            システム情報
          </h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Backend:</span>
              <span>Hono + Drizzle ORM + Cloudflare Workers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Frontend:</span>
              <span>React + Vite + Zustand + shadcn/ui</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">認証:</span>
              <span>JWT (8時間有効)</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-green-600 font-medium">
                ✓ 認証システムが正常に動作しています
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
