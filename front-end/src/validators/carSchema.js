import { z } from 'zod'

const currentYear = new Date().getFullYear()

const colorEnum = [
  'AMARELO',
  'AZUL',
  'BRANCO',
  'CINZA',
  'DOURADO',
  'LARANJA',
  'MARROM',
  'PRATA',
  'PRETO',
  'ROSA',
  'ROXO',
  'VERDE',
  'VERMELHO'
]

const storeOpenDate = new Date('2020-03-20')

export const carSchema = z.object({
  brand: z
    .string()
    .min(1, { message: 'Campo brand deve ter no mínimo 1 caractere.' })
    .max(25, { message: 'Campo brand deve ter no máximo 25 caracteres.' }),

  model: z
    .string()
    .min(1, { message: 'Campo model deve ter no mínimo 1 caractere.' })
    .max(25, { message: 'Campo model deve ter no máximo 25 caracteres.' }),

  color: z.enum(colorEnum, { errorMap: () => ({ message: `Campo color deve ser um dos valores: ${colorEnum.join(', ')}.` }) }),

  year_manufacture: z
    .number({ invalid_type_error: 'Campo year_manufacture deve ser um número inteiro.' })
    .int({ message: 'Campo year_manufacture deve ser um número inteiro.' })
    .min(1960, { message: `Campo year_manufacture não pode ser anterior a 1960.` })
    .max(currentYear, { message: `Campo year_manufacture não pode ser maior que ${currentYear}.` }),

  imported: z.boolean({ required_error: 'Campo imported é obrigatório e deve ser true ou false.' }),

  plates: z.string().length(8, { message: 'Campo plates deve ter exatamente 8 caracteres.' }),

  selling_date: z
    .union([z.date(), z.null(), z.undefined()])
    .refine((val) => {
      if (!val) return true
      return val >= storeOpenDate && val <= new Date()
    }, { message: 'Campo selling_date, se informado, deve estar entre 20/03/2020 e hoje.' }),

  selling_price: z
    .union([z.number(), z.null(), z.undefined()])
    .refine((val) => {
      if (val === null || val === undefined) return true
      return val >= 5000 && val <= 5000000
    }, { message: 'Campo selling_price, se informado, deve estar entre R$ 5.000,00 e R$ 5.000.000,00.' }),

  customer_id: z.any().optional(),
})

export function safeParseCar(payload) {
  const copy = { ...payload }
  if (copy.year_manufacture !== undefined && copy.year_manufacture !== null && copy.year_manufacture !== '') {
    copy.year_manufacture = Number(copy.year_manufacture)
  }
  if (copy.selling_price !== undefined && copy.selling_price !== null && copy.selling_price !== '') {
    copy.selling_price = Number(copy.selling_price)
  }
  if (copy.selling_date) {
    const d = new Date(copy.selling_date)
    if (!isNaN(d)) copy.selling_date = d
  }
  if (typeof copy.imported === 'string') {
    copy.imported = copy.imported === 'true' || copy.imported === '1'
  }
  return carSchema.safeParse(copy)
}

export default carSchema
