// Modelos de notificaciones
// Define las interfaces y tipos relacionados con notificaciones
// Alineados con la respuesta del backend

export interface Notificacion {
  _id: string
  userId: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: string // ISO date string
}

// Request para crear una notificación
export interface CreateNotificacionRequest {
  tipo: 'info' | 'success' | 'warning' | 'error'
  titulo: string
  mensaje: string
  leida?: boolean
}

// Parámetros para obtener notificaciones con filtros
export interface GetNotificacionesParams {
  leida?: boolean
  tipo?: 'info' | 'success' | 'warning' | 'error'
}

// Respuesta del backend para obtener notificaciones
export interface BackendNotificacionesResponse {
  success: boolean
  data: Notificacion[]
}

// Respuesta del backend para obtener una notificación
export interface BackendNotificacionResponse {
  success: boolean
  data: Notificacion
  message?: string
}

// Respuesta del backend para marcar como leída
export interface BackendMarkLeidaResponse {
  success: boolean
  data: Notificacion
  message?: string
}

// Respuesta del backend para marcar todas como leídas
export interface BackendMarkAllLeidasResponse {
  success: boolean
  data: {
    modificadas: number
  }
  message?: string
}

// Respuesta del backend para eliminar notificación
export interface BackendDeleteNotificacionResponse {
  success: boolean
  message: string
}

// Respuesta del backend para eliminar todas las notificaciones
export interface BackendDeleteAllNotificacionesResponse {
  success: boolean
  data: {
    eliminadas: number
  }
  message?: string
}

// Error del backend
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para notificaciones
export interface NotificacionError {
  message: string
  status?: number
}

