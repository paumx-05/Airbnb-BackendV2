// Esquemas Zod para validación de ingresos
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Meses válidos en español
export const MesValidoSchema = z.enum([
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
])

// Schema para ingreso del backend
export const IngresoSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  descripcion: z.string(),
  monto: z.number().positive(),
  fecha: z.string(), // ISO date string
  categoria: z.string(),
  mes: z.string(),
  createdAt: z.string().optional(), // ISO date string
})

// Schema para request de crear ingreso
export const CreateIngresoRequestSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.union([
    z.string().min(1, 'La fecha es requerida'),
    z.date(),
  ]),
  categoria: z.string().min(1, 'La categoría es requerida'),
  mes: MesValidoSchema,
})

// Schema para request de actualizar ingreso (todos opcionales)
export const UpdateIngresoRequestSchema = z.object({
  descripcion: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  fecha: z.union([
    z.string().optional(),
    z.date().optional(),
  ]),
  categoria: z.string().min(1).optional(),
  mes: MesValidoSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)

// Schema para respuesta de obtener ingresos por mes
export const IngresosResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(IngresoSchema),
})

// Schema para respuesta de crear/actualizar ingreso
export const IngresoResponseSchema = BackendResponseSchema(IngresoSchema)

// Schema para respuesta de total de ingresos
export const TotalIngresosResponseSchema = BackendResponseSchema(
  z.object({
    mes: z.string(),
    total: z.number(),
  })
)

// Schema para respuesta de ingresos por categoría
export const IngresosByCategoriaResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(IngresoSchema),
  total: z.number(),
})

// Schema para respuesta de eliminar ingreso
export const DeleteIngresoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Tipos TypeScript derivados
export type Ingreso = z.infer<typeof IngresoSchema>
export type CreateIngresoRequest = z.infer<typeof CreateIngresoRequestSchema>
export type UpdateIngresoRequest = z.infer<typeof UpdateIngresoRequestSchema>
export type IngresosResponse = z.infer<typeof IngresosResponseSchema>
export type IngresoResponse = z.infer<typeof IngresoResponseSchema>
export type TotalIngresosResponse = z.infer<typeof TotalIngresosResponseSchema>
export type IngresosByCategoriaResponse = z.infer<typeof IngresosByCategoriaResponseSchema>
export type DeleteIngresoResponse = z.infer<typeof DeleteIngresoResponseSchema>
export type MesValido = z.infer<typeof MesValidoSchema>


