// Servicio de notificaciones
// Maneja las llamadas HTTP al backend para notificaciones del usuario
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreateNotificacionRequest,
  GetNotificacionesParams,
  BackendNotificacionesResponse,
  BackendNotificacionResponse,
  BackendMarkLeidaResponse,
  BackendMarkAllLeidasResponse,
  BackendDeleteNotificacionResponse,
  BackendDeleteAllNotificacionesResponse,
  BackendError,
  NotificacionError,
  Notificacion
} from '@/models/notificaciones'
import { 
  NotificacionesResponseSchema,
  NotificacionResponseSchema,
  MarkAllLeidasResponseSchema,
  DeleteNotificacionResponseSchema,
  DeleteAllNotificacionesResponseSchema,
  CreateNotificacionRequestSchema
} from '@/schemas/notificaciones.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[NOTIFICACIONES API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[NOTIFICACIONES API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
}

/**
 * Realiza una petición HTTP al backend con manejo de errores y validación
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const token = getToken()
  const startTime = Date.now()
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // Agregar token de autenticación si existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    }
    
    // Log detallado del request (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('[NOTIFICACIONES API DEBUG]', {
        method: options.method || 'GET',
        url,
        headers: requestOptions.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      })
    }
    
    const response = await fetch(url, requestOptions)
    
    const data = await response.json()
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: NotificacionError = {
        message: errorData.success 
          ? errorData.data.error 
          : data.error || data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
      }
      
      logError(endpoint, options.method || 'GET', response.status, error.message)
      
      // Si es 401, limpiar tokens automáticamente
      if (response.status === 401) {
        clearTokens()
      }
      
      throw error
    }
    
    // Validar respuesta con schema si se proporciona
    if (schema) {
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[NOTIFICACIONES VALIDATION ERROR]', validated.error)
        throw {
          message: 'Respuesta del servidor inválida',
          status: response.status,
        } as NotificacionError
      }
      return validated.data
    }
    
    return data
  } catch (error: any) {
    logError(endpoint, options.method || 'GET', error.status || 0, error.message || 'Network error')
    
    // Si es error de timeout o red
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw {
        message: 'Error de conexión. Verifica que el servidor esté disponible.',
        status: 0,
      } as NotificacionError
    }
    
    throw error
  }
}

/**
 * Servicio de notificaciones
 */
export const notificacionesService = {
  /**
   * Obtiene todas las notificaciones del usuario con filtros opcionales
   */
  async getNotificaciones(params?: GetNotificacionesParams): Promise<Notificacion[]> {
    const response = await fetchAPI<BackendNotificacionesResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_ALL(params),
      {
        method: 'GET',
      },
      NotificacionesResponseSchema
    )
    
    return response.data
  },

  /**
   * Obtiene una notificación específica por ID
   */
  async getNotificacionById(id: string): Promise<Notificacion> {
    const response = await fetchAPI<BackendNotificacionResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_BY_ID(id),
      {
        method: 'GET',
      },
      NotificacionResponseSchema
    )
    
    return response.data
  },

  /**
   * Obtiene todas las notificaciones filtradas por tipo
   */
  async getNotificacionesByTipo(tipo: 'info' | 'success' | 'warning' | 'error'): Promise<Notificacion[]> {
    const response = await fetchAPI<BackendNotificacionesResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.GET_BY_TIPO(tipo),
      {
        method: 'GET',
      },
      NotificacionesResponseSchema
    )
    
    return response.data
  },

  /**
   * Crea una nueva notificación
   */
  async createNotificacion(data: CreateNotificacionRequest): Promise<Notificacion> {
    // Validar request
    const validated = CreateNotificacionRequestSchema.safeParse(data)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as NotificacionError
    }
    
    const response = await fetchAPI<BackendNotificacionResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      NotificacionResponseSchema
    )
    
    return response.data
  },

  /**
   * Marca una notificación específica como leída
   */
  async markAsLeida(id: string): Promise<Notificacion> {
    const response = await fetchAPI<BackendMarkLeidaResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.MARK_AS_LEIDA(id),
      {
        method: 'PUT',
      },
      NotificacionResponseSchema
    )
    
    return response.data
  },

  /**
   * Marca todas las notificaciones no leídas como leídas
   */
  async markAllAsLeidas(): Promise<{ modificadas: number }> {
    const response = await fetchAPI<BackendMarkAllLeidasResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.MARK_ALL_AS_LEIDAS,
      {
        method: 'PUT',
      },
      MarkAllLeidasResponseSchema
    )
    
    return response.data
  },

  /**
   * Elimina una notificación específica por ID
   */
  async deleteNotificacion(id: string): Promise<void> {
    await fetchAPI<BackendDeleteNotificacionResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.DELETE(id),
      {
        method: 'DELETE',
      },
      DeleteNotificacionResponseSchema
    )
  },

  /**
   * Elimina todas las notificaciones del usuario
   */
  async deleteAllNotificaciones(): Promise<{ eliminadas: number }> {
    const response = await fetchAPI<BackendDeleteAllNotificacionesResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICACIONES.DELETE_ALL,
      {
        method: 'DELETE',
      },
      DeleteAllNotificacionesResponseSchema
    )
    
    return response.data
  },
}

