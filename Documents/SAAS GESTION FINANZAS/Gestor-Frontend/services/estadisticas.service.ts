// Servicio de estadísticas
// Maneja las llamadas HTTP al backend para las estadísticas financieras
// Integración completa con backend MongoDB - NO USAR MOCK

import { API_CONFIG } from '@/config/api'
import type {
  ResumenEstadisticas,
  TendenciasTemporales,
  AnalisisCategorias,
  MetricasComportamiento,
  PeriodoEstadisticas,
  EstadisticasError,
} from '@/models/estadisticas'
import {
  ResumenEstadisticasResponseSchema,
  TendenciasResponseSchema,
  AnalisisCategoriasResponseSchema,
  MetricasComportamientoResponseSchema,
} from '@/schemas/estadisticas.schema'
import { BackendErrorSchema } from '@/schemas/auth.schema'
import { getToken, clearTokens } from '@/utils/jwt'
import { z } from 'zod'

// Telemetría básica: logs de red y latencia
const logRequest = (endpoint: string, method: string, startTime: number) => {
  const duration = Date.now() - startTime
  console.log(`[ESTADISTICAS API] ${method} ${endpoint} - ${duration}ms`)
}

const logError = (endpoint: string, method: string, status: number, error: string) => {
  console.error(`[ESTADISTICAS API ERROR] ${method} ${endpoint} - ${status}: ${error}`)
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
      console.log('[ESTADISTICAS API DEBUG]', {
        method: options.method || 'GET',
        url,
        headers: requestOptions.headers,
      })
    }
    
    const response = await fetch(url, requestOptions)
    
    // Log de respuesta cruda
    const responseText = await response.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[ESTADISTICAS API] Error al parsear respuesta JSON:', responseText)
      throw {
        message: 'Respuesta inválida del servidor',
        status: response.status,
      } as EstadisticasError
    }
    
    // Log de request
    logRequest(endpoint, options.method || 'GET', startTime)
    
    if (!response.ok) {
      // Intentar parsear como error del backend
      const errorData = BackendErrorSchema.safeParse(data)
      
      let errorMessage = errorData.success 
        ? errorData.data.error 
        : data.error || data.message || `Error ${response.status}: ${response.statusText}`
      
      // Mejorar mensaje para errores 404
      if (response.status === 404) {
        if (errorMessage.toLowerCase().includes('ruta no encontrada') || 
            errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'Recurso no encontrado. Verifica que el endpoint esté disponible.'
        }
      }
      
      const error: EstadisticasError = {
        error: errorMessage,
        status: response.status,
      }
      
      logError(endpoint, options.method || 'GET', response.status, errorMessage)
      
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
        console.error('[ESTADISTICAS VALIDATION ERROR]', {
          issues: validated.error.issues,
          data: data,
        })
        throw {
          error: `Respuesta del servidor inválida: ${validated.error.issues[0]?.message || 'Error de validación'}`,
          status: response.status,
        } as EstadisticasError
      }
      return validated.data
    }
    
    return data
  } catch (error: any) {
    logError(endpoint, options.method || 'GET', error.status || 0, error.error || error.message || 'Network error')
    
    // Si es error de timeout o red
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      throw {
        error: 'Error de conexión. Verifica que el servidor esté disponible.',
        status: 0,
      } as EstadisticasError
    }
    
    throw error
  }
}

/**
 * Construye query string para parámetros opcionales
 */
function buildQueryString(params: Record<string, string | undefined>): string {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value)
    }
  })
  
  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Servicio de estadísticas
 */
export const estadisticasService = {
  /**
   * Obtiene el resumen de estadísticas para un periodo específico
   * @param periodo - Periodo temporal: 'anual' | 'mensual' | 'semanal'
   * @param carteraId - ID de la cartera para filtrar (opcional)
   * @param fechaReferencia - Fecha de referencia en formato ISO (opcional)
   */
  async getResumen(
    periodo: PeriodoEstadisticas,
    carteraId?: string,
    fechaReferencia?: string
  ): Promise<ResumenEstadisticas> {
    const queryParams = buildQueryString({
      periodo,
      carteraId,
      fechaReferencia,
    })
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ESTADISTICAS.RESUMEN}${queryParams}`
    console.log('[ESTADISTICAS SERVICE] getResumen - endpoint:', endpoint)
    
    const response = await fetchAPI(
      endpoint,
      {
        method: 'GET',
      },
      ResumenEstadisticasResponseSchema
    )
    
    console.log('[ESTADISTICAS SERVICE] getResumen - respuesta:', response.data)
    return response.data
  },

  /**
   * Obtiene las tendencias temporales con comparativa del periodo anterior
   * @param periodo - Periodo temporal: 'anual' | 'mensual' | 'semanal'
   * @param carteraId - ID de la cartera para filtrar (opcional)
   * @param fechaReferencia - Fecha de referencia en formato ISO (opcional)
   */
  async getTendencias(
    periodo: PeriodoEstadisticas,
    carteraId?: string,
    fechaReferencia?: string
  ): Promise<TendenciasTemporales> {
    const queryParams = buildQueryString({
      periodo,
      carteraId,
      fechaReferencia,
    })
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ESTADISTICAS.TENDENCIAS}${queryParams}`
    console.log('[ESTADISTICAS SERVICE] getTendencias - endpoint:', endpoint)
    
    const response = await fetchAPI(
      endpoint,
      {
        method: 'GET',
      },
      TendenciasResponseSchema
    )
    
    console.log('[ESTADISTICAS SERVICE] getTendencias - respuesta:', response.data)
    return response.data
  },

  /**
   * Obtiene el análisis por categorías
   * @param periodo - Periodo temporal: 'anual' | 'mensual' | 'semanal'
   * @param carteraId - ID de la cartera para filtrar (opcional)
   * @param fechaReferencia - Fecha de referencia en formato ISO (opcional)
   * @param tipo - Tipo de análisis: 'gastos' | 'ingresos' | 'ambos' (default: 'ambos')
   * @param limite - Número máximo de categorías a retornar (default: 10)
   */
  async getAnalisisCategorias(
    periodo: PeriodoEstadisticas,
    carteraId?: string,
    fechaReferencia?: string,
    tipo: 'gastos' | 'ingresos' | 'ambos' = 'ambos',
    limite: number = 10
  ): Promise<AnalisisCategorias> {
    const queryParams = buildQueryString({
      periodo,
      carteraId,
      fechaReferencia,
      tipo,
      limite: limite.toString(),
    })
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ESTADISTICAS.CATEGORIAS}${queryParams}`
    console.log('[ESTADISTICAS SERVICE] getAnalisisCategorias - endpoint:', endpoint)
    
    const response = await fetchAPI(
      endpoint,
      {
        method: 'GET',
      },
      AnalisisCategoriasResponseSchema
    )
    
    console.log('[ESTADISTICAS SERVICE] getAnalisisCategorias - respuesta:', response.data)
    return response.data
  },

  /**
   * Obtiene las métricas de comportamiento financiero
   * @param periodo - Periodo temporal: 'anual' | 'mensual' | 'semanal'
   * @param carteraId - ID de la cartera para filtrar (opcional)
   * @param fechaReferencia - Fecha de referencia en formato ISO (opcional)
   */
  async getMetricasComportamiento(
    periodo: PeriodoEstadisticas,
    carteraId?: string,
    fechaReferencia?: string
  ): Promise<MetricasComportamiento> {
    const queryParams = buildQueryString({
      periodo,
      carteraId,
      fechaReferencia,
    })
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ESTADISTICAS.COMPORTAMIENTO}${queryParams}`
    console.log('[ESTADISTICAS SERVICE] getMetricasComportamiento - endpoint:', endpoint)
    
    const response = await fetchAPI(
      endpoint,
      {
        method: 'GET',
      },
      MetricasComportamientoResponseSchema
    )
    
    console.log('[ESTADISTICAS SERVICE] getMetricasComportamiento - respuesta:', response.data)
    return response.data
  },
}

