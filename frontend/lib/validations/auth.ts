import { z } from 'zod'

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .min(8, 'パスワードは8文字以上で入力してください'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ユーザー登録フォームのバリデーションスキーマ
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{}|;:,.<>?/~`])/,
      'パスワードは大文字・小文字・数字・特殊文字を含む必要があります'
    ),
  confirmPassword: z.string().min(1, 'パスワード確認は必須です'),
  full_name: z
    .string()
    .min(1, '氏名は必須です')
    .min(2, '氏名は2文字以上で入力してください')
    .max(100, '氏名は100文字以下で入力してください'),
  phone_number: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      // 日本の電話番号パターン（ハイフンあり・なし対応）
      return /^(0\d{1,4}-?\d{1,4}-?\d{3,4})$/.test(val)
    }, '有効な電話番号を入力してください（例：090-1234-5678）'),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// パスワードリセット要求フォームのバリデーションスキーマ
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
})

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>

// パスワードリセット確定フォームのバリデーションスキーマ
export const passwordResetConfirmSchema = z.object({
  token: z
    .string()
    .min(1, 'リセットトークンは必須です'),
  new_password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{}|;:,.<>?/~`])/,
      'パスワードは大文字・小文字・数字・特殊文字を含む必要があります'
    ),
  confirm_password: z.string().min(1, 'パスワード確認は必須です'),
})
.refine((data) => data.new_password === data.confirm_password, {
  message: 'パスワードが一致しません',
  path: ['confirm_password'],
})

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>

// ユーザープロフィール更新フォームのバリデーションスキーマ
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(1, '氏名は必須です')
    .min(2, '氏名は2文字以上で入力してください')
    .max(100, '氏名は100文字以下で入力してください'),
  phone_number: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return /^(0\d{1,4}-?\d{1,4}-?\d{3,4})$/.test(val)
    }, '有効な電話番号を入力してください（例：090-1234-5678）'),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
