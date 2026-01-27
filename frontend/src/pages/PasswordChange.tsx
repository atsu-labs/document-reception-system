import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/authStore';
import { passwordChangeSchema, type PasswordChangeFormData } from '../lib/validations/auth';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function PasswordChange() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordChangeFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Implement actual password change API call
      // await api.post('auth/change-password', { json: data });
      
      // For now, simulate API call
      console.log('Password change data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      reset();
      
      // Redirect to home after successful change
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('パスワードの変更に失敗しました。現在のパスワードが正しいことを確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              戻る
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              パスワード変更
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              新しいパスワードを設定してください
            </p>
          </div>

          {/* Success message */}
          {success && (
            <Alert variant="success" className="mb-6">
              <AlertDescription>
                パスワードが正常に変更されました。ホームページにリダイレクトします...
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-6" onClose={() => setError(null)}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Password change form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current password field */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                現在のパスワード
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                    errors.currentPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New password field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                    errors.newPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
              {/* Password strength indicator */}
              <PasswordStrength password={newPassword || ''} />
            </div>

            {/* Confirm password field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                新しいパスワード（確認）
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password policy info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                パスワードポリシー
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 8文字以上</li>
                <li>• 大文字、小文字、数字、記号を含む</li>
                <li>• よくあるパターンは使用不可</li>
                <li>• 現在のパスワードと同じものは使用不可</li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? '変更中...' : 'パスワードを変更'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
