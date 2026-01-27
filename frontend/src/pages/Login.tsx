import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/authStore';
import { loginSchema, type LoginFormData } from '../lib/validations/auth';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      navigate('/', { replace: true });
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              届出管理システム
            </h1>
            <p className="text-sm text-slate-600">
              Document Reception System
            </p>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-6" onClose={clearError}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.username ? 'border-red-500' : 'border-slate-300'
                }`}
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* Terms and Privacy links */}
          <div className="mt-6 text-center text-xs text-slate-600">
            <p>
              ログインすることで、
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
                利用規約
              </Link>
              および
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                プライバシーポリシー
              </Link>
              に同意したものとみなされます。
            </p>
          </div>

          {/* Test user info - only show in development */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">
                テストユーザー
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded">
                  <span>管理者</span>
                  <code className="text-slate-800">
                    admin / password123
                  </code>
                </div>
                <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded">
                  <span>上位ユーザー</span>
                  <code className="text-slate-800">
                    senior1 / password123
                  </code>
                </div>
                <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded">
                  <span>一般ユーザー</span>
                  <code className="text-slate-800">
                    user1 / password123
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
