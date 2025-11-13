// Esquemas Zod para validación de amigos
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para amigo del backend
export const AmigoSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  nombre: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable().optional(),
  estado: z.enum(['activo', 'pendiente', 'bloqueado']),
  fechaAmistad: z.string(), // ISO date string
  createdAt: z.string().optional(), // ISO date string
})

// Schema para request de crear amigo
export const CreateAmigoRequestSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('El email debe ser válido'),
  avatar: z.string().url().optional().or(z.literal('')),
  estado: z.enum(['activo', 'pendiente', 'bloqueado']).optional().default('activo'),
})

// Schema para request de actualizar amigo (todos opcionales)
export const UpdateAmigoRequestSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional().or(z.literal('')).nullable(),
  estado: z.enum(['activo', 'pendiente', 'bloqueado']).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)

// Schema para request de actualizar estado
export const UpdateEstadoRequestSchema = z.object({
  estado: z.enum(['activo', 'pendiente', 'bloqueado']),
})

// Schema para respuesta de obtener amigos
export const AmigosResponseSchema = BackendResponseSchema(z.array(AmigoSchema))

// Schema para respuesta de obtener/crear/actualizar amigo
export const AmigoResponseSchema = BackendResponseSchema(AmigoSchema)

// Schema para respuesta de actualizar estado
export const UpdateEstadoResponseSchema = BackendResponseSchema(
  z.object({
    _id: z.string(),
    estado: z.enum(['activo', 'pendiente', 'bloqueado']),
  })
)

// Schema para respuesta de eliminar amigo
export const DeleteAmigoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Tipos TypeScript derivados
export type Amigo = z.infer<typeof AmigoSchema>
export type CreateAmigoRequest = z.infer<typeof CreateAmigoRequestSchema>
export type UpdateAmigoRequest = z.infer<typeof UpdateAmigoRequestSchema>
export type UpdateEstadoRequest = z.infer<typeof UpdateEstadoRequestSchema>
export type AmigosResponse = z.infer<typeof AmigosResponseSchema>
export type AmigoResponse = z.infer<typeof AmigoResponseSchema>
export type UpdateEstadoResponse = z.infer<typeof UpdateEstadoResponseSchema>
export type DeleteAmigoResponse = z.infer<typeof DeleteAmigoResponseSchema>

