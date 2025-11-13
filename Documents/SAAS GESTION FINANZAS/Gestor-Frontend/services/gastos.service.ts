// Servicio de gastos
// Maneja las llamadas HTTP al backend para gastos
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreateGastoRequest,
  UpdateGastoRequest,
  BackendGastosResponse,
  BackendGastoResponse,
  BackendTotalGastosResponse,
  BackendDeleteGastoResponse,
  BackendError,
  GastoError,
  Gasto
} from '@/models/gastos'
import { 
  GastosResponseSchema,
  GastoResponseSchema,
  TotalGastosResponseSchema,
  DeleteGastoResponseSchema,
  CreateGastoRequestSchema,
  UpdateGastoRequestSchema
} from '@/schemas/gastos.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens, decodeToken } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[GASTOS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[GASTOS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
  
  // Log del token para depuración
  if (token) {
    try {
      const decoded = decodeToken(token)
      if (decoded) {
        console.log('[GASTOS API] Token decodificado:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        })
      } else {
        console.log('[GASTOS API] Token no pudo ser decodificado (puede ser mock)')
      }
    } catch (e) {
      console.log('[GASTOS API] Error al decodificar token:', e)
    }
  } else {
    console.warn('[GASTOS API] No hay token disponible')
  }
  
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
    if (process.env.NODE_ENV === 'development' || true) {
      console.log('[GASTOS API DEBUG]', {
        method: options.method || 'GET',
        url,
        headers: requestOptions.headers,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      })
    }
    
    const response = await fetch(url, requestOptions)
    
    // Log de respuesta cruda
    const responseText = await response.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[GASTOS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as GastoError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: GastoError = {
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
      console.log('[GASTOS API] Validando respuesta con schema:', data)
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[GASTOS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          message: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as GastoError
      }
      console.log('[GASTOS API] Validación exitosa:', validated.data)
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
      } as GastoError
    }
    
    throw error
  }
}

/**
 * Servicio de gastos
 */
export const gastosService = {
  /**
   * Obtiene todos los gastos de un mes específico
   */
  async getGastosByMes(mes: string): Promise<{ gastos: Gasto[]; total: number }> {
    const response = await fetchAPI<BackendGastosResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.GET_BY_MES(mes),
      {
        method: 'GET',
      },
      GastosResponseSchema
    )
    
    // Calcular total si no viene del backend
    const totalCalculado = response.total !== undefined 
      ? response.total 
      : (response.data || []).reduce((sum: number, gasto: Gasto) => sum + gasto.monto, 0)
    
    // Log para depuración
    console.log('[GASTOS SERVICE] Respuesta del backend:', {
      mes,
      cantidadGastos: response.data?.length || 0,
      totalDelBackend: response.total,
      totalCalculado: totalCalculado,
      gastos: response.data,
      userIdsEnGastos: response.data?.map((g: any) => g.userId) || []
    })
    
    // El backend devuelve { success: true, data: [...], total: ... }
    // Si total no viene, lo calculamos sumando los montos
    return {
      gastos: response.data || [],
      total: totalCalculado,
    }
  },

  /**
   * Crea un nuevo gasto
   */
  async createGasto(gastoData: CreateGastoRequest): Promise<Gasto> {
    // Validar request
    const validated = CreateGastoRequestSchema.safeParse(gastoData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as GastoError
    }
    
    console.log('[GASTOS SERVICE] Creando gasto:', {
      descripcion: validated.data.descripcion,
      monto: validated.data.monto,
      fecha: validated.data.fecha,
      categoria: validated.data.categoria,
      mes: validated.data.mes,
      dividido: validated.data.dividido
    })
    
    const response = await fetchAPI<BackendGastoResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      GastoResponseSchema
    )
    
    console.log('[GASTOS SERVICE] Gasto creado exitosamente:', {
      id: response.data._id,
      userId: response.data.userId,
      descripcion: response.data.descripcion
    })
    
    return response.data
  },

  /**
   * Actualiza un gasto existente
   */
  async updateGasto(id: string, gastoData: UpdateGastoRequest): Promise<Gasto> {
    // Validar request
    const validated = UpdateGastoRequestSchema.safeParse(gastoData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as GastoError
    }
    
    const response = await fetchAPI<BackendGastoResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
      GastoResponseSchema
    )
    
    return response.data
  },

  /**
   * Elimina un gasto
   */
  async deleteGasto(id: string): Promise<void> {
    await fetchAPI<BackendDeleteGastoResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.DELETE(id),
      {
        method: 'DELETE',
      },
      DeleteGastoResponseSchema
    )
  },

  /**
   * Obtiene el total de gastos de un mes
   */
  async getTotalByMes(mes: string): Promise<number> {
    const response = await fetchAPI<BackendTotalGastosResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.GET_TOTAL(mes),
      {
        method: 'GET',
      },
      TotalGastosResponseSchema
    )
    
    return response.data.total || 0
  },

  /**
   * Obtiene gastos filtrados por categoría en un mes
   */
  async getGastosByCategoria(mes: string, categoria: string): Promise<{ gastos: Gasto[]; total: number }> {
    const response = await fetchAPI<BackendGastosResponse>(
      API_CONFIG.ENDPOINTS.GASTOS.GET_BY_CATEGORIA(mes, categoria),
      {
        method: 'GET',
      },
      GastosResponseSchema
    )
    
    // Calcular total si no viene del backend
    const totalCalculado = response.total !== undefined 
      ? response.total 
      : (response.data || []).reduce((sum: number, gasto: Gasto) => sum + gasto.monto, 0)
    
    // El backend devuelve { success: true, data: [...], total: ... }
    // Si total no viene, lo calculamos sumando los montos
    return {
      gastos: response.data || [],
      total: totalCalculado,
    }
  },
}

