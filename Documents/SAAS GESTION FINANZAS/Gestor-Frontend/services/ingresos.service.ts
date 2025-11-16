// Servicio de ingresos
// Maneja las llamadas HTTP al backend para ingresos
// Integración completa con backend MongoDB

import { API_CONFIG } from '@/config/api'
import type { 
  CreateIngresoRequest,
  UpdateIngresoRequest,
  BackendIngresosResponse,
  BackendIngresoResponse,
  BackendTotalIngresosResponse,
  BackendIngresosByCategoriaResponse,
  BackendDeleteIngresoResponse,
  BackendError,
  IngresoError,
  Ingreso,
  MesValido
} from '@/models/ingresos'
import { 
  IngresosResponseSchema,
  IngresoResponseSchema,
  TotalIngresosResponseSchema,
  IngresosByCategoriaResponseSchema,
  DeleteIngresoResponseSchema,
  CreateIngresoRequestSchema,
  UpdateIngresoRequestSchema
} from '@/schemas/ingresos.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens, decodeToken } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[INGRESOS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[INGRESOS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
        console.log('[INGRESOS API] Token decodificado:', {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        })
      } else {
        console.log('[INGRESOS API] Token no pudo ser decodificado (puede ser mock)')
      }
    } catch (e) {
      console.log('[INGRESOS API] Error al decodificar token:', e)
    }
  } else {
    console.warn('[INGRESOS API] No hay token disponible')
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
      console.log('[INGRESOS API DEBUG]', {
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
      console.error('[INGRESOS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as IngresoError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      const error: IngresoError = {
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
      console.log('[INGRESOS API] Validando respuesta con schema:', data)
      const validated = schema.safeParse(data)
      if (!validated.success) {
        console.error('[INGRESOS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          message: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as IngresoError
      }
      console.log('[INGRESOS API] Validación exitosa:', validated.data)
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
      } as IngresoError
    }
    
    throw error
  }
}

/**
 * Servicio de ingresos
 */
export const ingresosService = {
  /**
   * Obtiene todos los ingresos de un mes específico
   */
  async getIngresosByMes(mes: MesValido): Promise<Ingreso[]> {
    const response = await fetchAPI<BackendIngresosResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.GET_BY_MES(mes),
      {
        method: 'GET',
      },
      IngresosResponseSchema
    )
    
    // Log para depuración
    console.log('[INGRESOS SERVICE] Respuesta del backend:', {
      mes,
      cantidadIngresos: response.data?.length || 0,
      ingresos: response.data,
      userIdsEnIngresos: response.data?.map((i: any) => i.userId) || []
    })
    
    return response.data || []
  },

  /**
   * Crea un nuevo ingreso
   */
  async createIngreso(ingresoData: CreateIngresoRequest): Promise<Ingreso> {
    // Normalizar fecha a ISO string si es Date
    const normalizedData = {
      ...ingresoData,
      fecha: ingresoData.fecha instanceof Date 
        ? ingresoData.fecha.toISOString() 
        : ingresoData.fecha
    }
    
    // Validar request
    const validated = CreateIngresoRequestSchema.safeParse(normalizedData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as IngresoError
    }
    
    console.log('[INGRESOS SERVICE] Creando ingreso:', {
      descripcion: validated.data.descripcion,
      monto: validated.data.monto,
      fecha: validated.data.fecha,
      categoria: validated.data.categoria,
      mes: validated.data.mes,
    })
    
    const response = await fetchAPI<BackendIngresoResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
      IngresoResponseSchema
    )
    
    console.log('[INGRESOS SERVICE] Ingreso creado exitosamente:', {
      id: response.data._id,
      userId: response.data.userId,
      descripcion: response.data.descripcion
    })
    
    return response.data
  },

  /**
   * Actualiza un ingreso existente
   */
  async updateIngreso(id: string, ingresoData: UpdateIngresoRequest): Promise<Ingreso> {
    // Normalizar fecha a ISO string si es Date
    const normalizedData = {
      ...ingresoData,
      fecha: ingresoData.fecha instanceof Date 
        ? ingresoData.fecha.toISOString() 
        : ingresoData.fecha instanceof String
        ? ingresoData.fecha
        : undefined
    }
    
    // Validar request
    const validated = UpdateIngresoRequestSchema.safeParse(normalizedData)
    if (!validated.success) {
      throw {
        message: validated.error.issues[0].message,
        status: 400,
      } as IngresoError
    }
    
    const response = await fetchAPI<BackendIngresoResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
      IngresoResponseSchema
    )
    
    return response.data
  },

  /**
   * Elimina un ingreso
   */
  async deleteIngreso(id: string): Promise<void> {
    await fetchAPI<BackendDeleteIngresoResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.DELETE(id),
      {
        method: 'DELETE',
      },
      DeleteIngresoResponseSchema
    )
  },

  /**
   * Obtiene el total de ingresos de un mes
   */
  async getTotalByMes(mes: MesValido): Promise<number> {
    const response = await fetchAPI<BackendTotalIngresosResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.GET_TOTAL(mes),
      {
        method: 'GET',
      },
      TotalIngresosResponseSchema
    )
    
    return response.data.total || 0
  },

  /**
   * Obtiene ingresos filtrados por categoría en un mes
   */
  async getIngresosByCategoria(mes: MesValido, categoria: string): Promise<{ ingresos: Ingreso[]; total: number }> {
    const response = await fetchAPI<BackendIngresosByCategoriaResponse>(
      API_CONFIG.ENDPOINTS.INGRESOS.GET_BY_CATEGORIA(mes, categoria),
      {
        method: 'GET',
      },
      IngresosByCategoriaResponseSchema
    )
    
    return {
      ingresos: response.data || [],
      total: response.total || 0,
    }
  },
}

