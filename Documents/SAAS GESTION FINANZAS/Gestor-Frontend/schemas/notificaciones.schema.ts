// Esquemas Zod para validación de notificaciones
// Valida requests y responses del backend

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para notificación del backend
export const NotificacionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  tipo: z.enum(['info', 'success', 'warning', 'error']),
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  createdAt: z.string(), // ISO date string
})

// Schema para request de crear notificación
export const CreateNotificacionRequestSchema = z.object({
  tipo: z.enum(['info', 'success', 'warning', 'error'], {
    errorMap: () => ({ message: 'El tipo debe ser: info, success, warning o error' }),
  }),
  titulo: z.string().min(1, 'El título es requerido y no puede estar vacío'),
  mensaje: z.string().min(1, 'El mensaje es requerido y no puede estar vacío'),
  leida: z.boolean().optional().default(false),
})

// Schema para respuesta de obtener notificaciones
export const NotificacionesResponseSchema = BackendResponseSchema(z.array(NotificacionSchema))

// Schema para respuesta de obtener/crear/marcar como leída notificación
export const NotificacionResponseSchema = BackendResponseSchema(NotificacionSchema)

// Schema para respuesta de marcar todas como leídas
export const MarkAllLeidasResponseSchema = BackendResponseSchema(
  z.object({
    modificadas: z.number(),
  })
)

// Schema para respuesta de eliminar notificación
export const DeleteNotificacionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// Schema para respuesta de eliminar todas las notificaciones
export const DeleteAllNotificacionesResponseSchema = BackendResponseSchema(
  z.object({
    eliminadas: z.number(),
  })
)

// Tipos TypeScript derivados
export type Notificacion = z.infer<typeof NotificacionSchema>
export type CreateNotificacionRequest = z.infer<typeof CreateNotificacionRequestSchema>
export type NotificacionesResponse = z.infer<typeof NotificacionesResponseSchema>
export type NotificacionResponse = z.infer<typeof NotificacionResponseSchema>
export type MarkAllLeidasResponse = z.infer<typeof MarkAllLeidasResponseSchema>
export type DeleteNotificacionResponse = z.infer<typeof DeleteNotificacionResponseSchema>
export type DeleteAllNotificacionesResponse = z.infer<typeof DeleteAllNotificacionesResponseSchema>

