import { z } from 'zod';

// Password validation rules
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .max(100, 'パスワードは100文字以下である必要があります')
  .regex(/[a-z]/, 'パスワードには小文字を含める必要があります')
  .regex(/[A-Z]/, 'パスワードには大文字を含める必要があります')
  .regex(/[0-9]/, 'パスワードには数字を含める必要があります')
  .regex(/[^a-zA-Z0-9]/, 'パスワードには記号を含める必要があります')
  .refine(
    (password) => {
      // Check for common weak patterns
      const weakPatterns = [
        /^password/i,
        /^12345/,
        /^qwerty/i,
        /(.)\1{2,}/, // repeated characters (e.g., aaa, 111)
      ];
      return !weakPatterns.some(pattern => pattern.test(password));
    },
    {
      message: 'よくあるパターンは使用できません',
    }
  );

// Login form validation
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'ユーザー名を入力してください')
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(50, 'ユーザー名は50文字以下である必要があります')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名には半角英数字、ハイフン、アンダースコアのみ使用できます'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

// Password change form validation
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '新しいパスワードは現在のパスワードと異なる必要があります',
    path: ['newPassword'],
  });

// Registration form validation (for future use)
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'ユーザー名は3文字以上である必要があります')
      .max(50, 'ユーザー名は50文字以下である必要があります')
      .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名には半角英数字、ハイフン、アンダースコアのみ使用できます'),
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: '利用規約とプライバシーポリシーに同意する必要があります',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
