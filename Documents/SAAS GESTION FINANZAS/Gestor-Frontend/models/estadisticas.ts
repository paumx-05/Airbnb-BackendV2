// Modelos de estadísticas
// Define las interfaces y tipos relacionados con las estadísticas financieras
// Alineados con la respuesta del backend según estadisticas-integracion.md

// Tipo de periodo
export type PeriodoEstadisticas = 'anual' | 'mensual' | 'semanal'

// Resumen de ingresos/gastos
export interface ResumenFinanciero {
  total: number
  promedioDiario: number
  cantidad: number
}

// Resumen de balance
export interface ResumenBalance {
  total: number
  promedioDiario: number
}

// Resumen de estadísticas
export interface ResumenEstadisticas {
  periodo: PeriodoEstadisticas
  fechaInicio: string // ISO date string
  fechaFin: string // ISO date string
  ingresos: ResumenFinanciero
  gastos: ResumenFinanciero
  balance: ResumenBalance
  tasaAhorro: number
  ratioGastosIngresos: number
}

// Cambio financiero (para comparativa)
export interface CambioFinanciero {
  valor: number
  porcentaje: number
  tipo: 'aumento' | 'disminucion'
}

// Datos de un periodo
export interface DatosPeriodo {
  fechaInicio: string // ISO date string
  fechaFin: string // ISO date string
  ingresos: number
  gastos: number
  balance: number
}

// Punto de datos para gráfico
export interface PuntoGrafico {
  fecha: string // YYYY-MM-DD
  ingresos: number
  gastos: number
}

// Tendencias temporales
export interface TendenciasTemporales {
  periodo: PeriodoEstadisticas
  periodoActual: DatosPeriodo
  periodoAnterior: DatosPeriodo
  cambios: {
    ingresos: CambioFinanciero
    gastos: CambioFinanciero
    balance: CambioFinanciero
  }
  datosGrafico: PuntoGrafico[]
}

// Categoría con análisis
export interface CategoriaAnalisis {
  categoria: string
  monto: number
  porcentaje: number
  cantidad: number
  promedio: number
  tendencia: 'aumento' | 'disminucion' | 'estable'
}

// Análisis por categorías
export interface AnalisisCategorias {
  periodo: PeriodoEstadisticas
  categoriasGastos: CategoriaAnalisis[]
  categoriasIngresos: CategoriaAnalisis[]
  totalGastos: number
  totalIngresos: number
}

// Métricas de transacciones
export interface MetricasTransacciones {
  total: number
  ingresos: number
  gastos: number
  promedioDiario: number
}

// Métricas de gasto promedio
export interface MetricasGastoPromedio {
  porTransaccion: number
  porDia: number
}

// Métricas de días activos
export interface MetricasDiasActivos {
  total: number
  conGastos: number
  conIngresos: number
  porcentajeActividad: number
}

// Frecuencia de categoría
export interface FrecuenciaCategoria {
  categoria: string
  frecuencia: number
  porcentaje: number
}

// Métricas de comportamiento
export interface MetricasComportamiento {
  periodo: PeriodoEstadisticas
  transacciones: MetricasTransacciones
  gastoPromedio: MetricasGastoPromedio
  diasActivos: MetricasDiasActivos
  frecuenciaCategorias: FrecuenciaCategoria[]
}

// Respuestas del backend
export interface BackendResumenEstadisticasResponse {
  success: boolean
  data: ResumenEstadisticas
}

export interface BackendTendenciasResponse {
  success: boolean
  data: TendenciasTemporales
}

export interface BackendAnalisisCategoriasResponse {
  success: boolean
  data: AnalisisCategorias
}

export interface BackendMetricasComportamientoResponse {
  success: boolean
  data: MetricasComportamiento
}

// Errores
export interface EstadisticasError {
  error: string
  status?: number
}

