// Servicio de chat
// Maneja las llamadas HTTP al backend para mensajes de chat entre usuarios
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  SendMensajeRequest,
  BackendChatsResponse,
  BackendMensajesChatResponse,
  BackendMensajeChatResponse,
  BackendMarkChatLeidoResponse,
  BackendError,
  ChatError,
  MensajeChat,
  Chat
} from '@/models/chat'
import { 
  ChatsResponseSchema,
  MensajesChatResponseSchema,
  MensajeChatResponseSchema,
  MarkChatLeidoResponseSchema,
  SendMensajeRequestSchema
} from '@/schemas/chat.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[CHAT API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[CHAT API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
      console.log('[CHAT API DEBUG]', {
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
      
      const error: ChatError = {
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
        console.error('[CHAT VALIDATION ERROR]', validated.error)
        throw {
          message: 'Respuesta del servidor inválida',
          status: response.status,
        } as ChatError
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
      } as ChatError
    }
    
    throw error
  }
}

/**
 * Servicio de chat
 */
export const chatService = {
  /**
   * Obtiene la lista de chats con todos los amigos
   */
  async getChatsList(): Promise<Chat[]> {
    const response = await fetchAPI<BackendChatsResponse>(
      API_CONFIG.ENDPOINTS.CHAT.GET_CHATS,
      {
        method: 'GET',
      },
      ChatsResponseSchema
    )
    
    return response.data
  },

  /**
   * Obtiene los mensajes de un chat con un amigo específico
   */
  async getMensajesByAmigo(amigoId: string): Promise<MensajeChat[]> {
    const response = await fetchAPI<BackendMensajesChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.GET_MENSAJES(amigoId),
      {
        method: 'GET',
      },
      MensajesChatResponseSchema
    )
    
    return response.data
  },

  /**
   * Envía un mensaje en un chat con un amigo
   */
  async sendMensaje(amigoId: string, mensajeData: SendMensajeRequest): Promise<MensajeChat> {
    // Validar request
    const validated = SendMensajeRequestSchema.safeParse(mensajeData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as ChatError
    }
    
    const response = await fetchAPI<BackendMensajeChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.SEND_MENSAJE(amigoId),
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      MensajeChatResponseSchema
    )
    
    return response.data
  },

  /**
   * Marca todos los mensajes no leídos de un chat como leídos
   */
  async markChatAsLeido(amigoId: string): Promise<{ mensajesActualizados: number }> {
    const response = await fetchAPI<BackendMarkChatLeidoResponse>(
      API_CONFIG.ENDPOINTS.CHAT.MARK_AS_LEIDO(amigoId),
      {
        method: 'PUT',
      },
      MarkChatLeidoResponseSchema
    )
    
    return response.data
  },

  /**
   * Marca TODOS los mensajes de un chat como leídos (incluso los que ya estaban leídos)
   * Útil para forzar la actualización del estado de lectura
   */
  async markAllChatAsLeidos(amigoId: string): Promise<{ mensajesActualizados: number }> {
    const response = await fetchAPI<BackendMarkChatLeidoResponse>(
      API_CONFIG.ENDPOINTS.CHAT.MARK_ALL_AS_LEIDOS(amigoId),
      {
        method: 'PUT',
      },
      MarkChatLeidoResponseSchema
    )
    
    return response.data
  },
}

