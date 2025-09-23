import { z } from 'zod'

// 決済フォームのバリデーションスキーマ
export const paymentSchema = z.object({
  payment_method: z.enum(['card', 'cash', 'bank_transfer'], {
    required_error: '決済方法を選択してください',
  }),
  card_token: z.string().optional(),
  amount: z.number().min(1, '決済金額は1円以上である必要があります'),
  currency: z.string().default('JPY'),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

// 返金フォームのバリデーションスキーマ
export const refundSchema = z.object({
  reason: z
    .string()
    .min(1, '返金理由は必須です')
    .min(10, '返金理由は10文字以上で入力してください')
    .max(500, '返金理由は500文字以下で入力してください'),
  amount: z
    .number()
    .min(1, '返金金額は1円以上である必要があります')
    .optional(),
})

export type RefundFormData = z.infer<typeof refundSchema>

// カード情報のバリデーションスキーマ（モック用）
export const cardInfoSchema = z.object({
  card_number: z
    .string()
    .min(1, 'カード番号は必須です')
    .regex(/^\d{16}$/, 'カード番号は16桁の数字で入力してください'),
  expiry_month: z
    .string()
    .min(1, '有効期限（月）は必須です')
    .regex(/^(0[1-9]|1[0-2])$/, '有効期限（月）は01-12で入力してください'),
  expiry_year: z
    .string()
    .min(1, '有効期限（年）は必須です')
    .regex(/^\d{4}$/, '有効期限（年）は4桁の数字で入力してください'),
  cvv: z
    .string()
    .min(1, 'CVVは必須です')
    .regex(/^\d{3,4}$/, 'CVVは3-4桁の数字で入力してください'),
  cardholder_name: z
    .string()
    .min(1, 'カード名義は必須です')
    .min(2, 'カード名義は2文字以上で入力してください')
    .max(50, 'カード名義は50文字以下で入力してください'),
})

export type CardInfoFormData = z.infer<typeof cardInfoSchema>
