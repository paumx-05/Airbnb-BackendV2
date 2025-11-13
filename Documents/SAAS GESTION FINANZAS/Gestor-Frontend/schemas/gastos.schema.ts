// Esquemas Zod para validación de gastos
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para el array de dividido (opcional)
export const DivididoSchema = z.array(
  z.object({
    amigoId: z.string().min(1, 'El ID del amigo es requerido'),
    amigoNombre: z.string().min(1, 'El nombre del amigo es requerido'),
    montoDividido: z.number().min(0, 'El monto dividido debe ser >= 0'),
    pagado: z.boolean().optional().default(false), // Opcional, default: false
  })
).optional()

// Schema para gasto del backend
export const GastoSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  descripcion: z.string(),
  monto: z.number().positive(),
  fecha: z.string(), // ISO date string
  categoria: z.string(),
  mes: z.string(),
  dividido: DivididoSchema,
  createdAt: z.string().optional(), // ISO date string
})

// Schema para request de crear gasto
export const CreateGastoRequestSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  mes: z.string().optional(), // Opcional: se extrae de la fecha si no se proporciona
  dividido: DivididoSchema, // Opcional: array de amigos con quienes se divide el gasto
})

// Schema para request de actualizar gasto (todos opcionales)
export const UpdateGastoRequestSchema = z.object({
  descripcion: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  fecha: z.string().optional(),
  categoria: z.string().min(1).optional(),
  mes: z.string().optional(),
  dividido: DivididoSchema, // Opcional: si se envía, reemplaza completamente el array anterior
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)

// Schema para respuesta de obtener gastos por mes
// El backend devuelve: { success: true, data: [...], total: ... }
// Nota: total puede ser opcional, se calculará en el frontend si no viene
export const GastosResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GastoSchema),
  total: z.number().optional(), // Opcional: se calculará si no viene
})

// Schema para respuesta de crear/actualizar gasto
export const GastoResponseSchema = BackendResponseSchema(GastoSchema)

// Schema para respuesta de total de gastos
export const TotalGastosResponseSchema = BackendResponseSchema(
  z.object({
    mes: z.string(),
    total: z.number(),
  })
)

// Schema para respuesta de eliminar gasto
// El backend devuelve: { success: true, message: "..." }
export const DeleteGastoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Tipos TypeScript derivados
export type Gasto = z.infer<typeof GastoSchema>
export type CreateGastoRequest = z.infer<typeof CreateGastoRequestSchema>
export type UpdateGastoRequest = z.infer<typeof UpdateGastoRequestSchema>
export type GastosResponse = z.infer<typeof GastosResponseSchema>
export type GastoResponse = z.infer<typeof GastoResponseSchema>
export type TotalGastosResponse = z.infer<typeof TotalGastosResponseSchema>
export type DeleteGastoResponse = z.infer<typeof DeleteGastoResponseSchema>

