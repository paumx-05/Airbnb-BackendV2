// Esquemas Zod para validación de estadísticas
// Valida requests y responses del backend según estadisticas-integracion.md

import { z } from 'zod'

// Schema para respuesta del backend (wrapper estándar)
export const BackendResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Schema para periodo
export const PeriodoEstadisticasSchema = z.enum(['anual', 'mensual', 'semanal'])

// Schema para resumen financiero
export const ResumenFinancieroSchema = z.object({
  total: z.number().min(0),
  promedioDiario: z.number().min(0),
  cantidad: z.number().int().min(0),
})

// Schema para resumen de balance
export const ResumenBalanceSchema = z.object({
  total: z.number(),
  promedioDiario: z.number(),
})

// Schema para resumen de estadísticas
export const ResumenEstadisticasSchema = z.object({
  periodo: PeriodoEstadisticasSchema,
  fechaInicio: z.string(), // ISO date string
  fechaFin: z.string(), // ISO date string
  ingresos: ResumenFinancieroSchema,
  gastos: ResumenFinancieroSchema,
  balance: ResumenBalanceSchema,
  tasaAhorro: z.number().min(0).max(100),
  ratioGastosIngresos: z.number().min(0).max(100),
})

// Schema para cambio financiero
export const CambioFinancieroSchema = z.object({
  valor: z.number(),
  porcentaje: z.number(),
  tipo: z.enum(['aumento', 'disminucion']),
})

// Schema para datos de periodo
export const DatosPeriodoSchema = z.object({
  fechaInicio: z.string(), // ISO date string
  fechaFin: z.string(), // ISO date string
  ingresos: z.number().min(0),
  gastos: z.number().min(0),
  balance: z.number(),
})

// Schema para punto de gráfico
export const PuntoGraficoSchema = z.object({
  fecha: z.string(), // YYYY-MM-DD
  ingresos: z.number().min(0),
  gastos: z.number().min(0),
})

// Schema para tendencias temporales
export const TendenciasTemporalesSchema = z.object({
  periodo: PeriodoEstadisticasSchema,
  periodoActual: DatosPeriodoSchema,
  periodoAnterior: DatosPeriodoSchema,
  cambios: z.object({
    ingresos: CambioFinancieroSchema,
    gastos: CambioFinancieroSchema,
    balance: CambioFinancieroSchema,
  }),
  datosGrafico: z.array(PuntoGraficoSchema),
})

// Schema para categoría con análisis
export const CategoriaAnalisisSchema = z.object({
  categoria: z.string(),
  monto: z.number().min(0),
  porcentaje: z.number().min(0).max(100),
  cantidad: z.number().int().min(0),
  promedio: z.number().min(0),
  tendencia: z.enum(['aumento', 'disminucion', 'estable']),
})

// Schema para análisis por categorías
export const AnalisisCategoriasSchema = z.object({
  periodo: PeriodoEstadisticasSchema,
  categoriasGastos: z.array(CategoriaAnalisisSchema),
  categoriasIngresos: z.array(CategoriaAnalisisSchema),
  totalGastos: z.number().min(0),
  totalIngresos: z.number().min(0),
})

// Schema para métricas de transacciones
export const MetricasTransaccionesSchema = z.object({
  total: z.number().int().min(0),
  ingresos: z.number().int().min(0),
  gastos: z.number().int().min(0),
  promedioDiario: z.number().min(0),
})

// Schema para métricas de gasto promedio
export const MetricasGastoPromedioSchema = z.object({
  porTransaccion: z.number().min(0),
  porDia: z.number().min(0),
})

// Schema para métricas de días activos
export const MetricasDiasActivosSchema = z.object({
  total: z.number().int().min(0),
  conGastos: z.number().int().min(0),
  conIngresos: z.number().int().min(0),
  porcentajeActividad: z.number().min(0).max(100),
})

// Schema para frecuencia de categoría
export const FrecuenciaCategoriaSchema = z.object({
  categoria: z.string(),
  frecuencia: z.number().int().min(0),
  porcentaje: z.number().min(0).max(100),
})

// Schema para métricas de comportamiento
export const MetricasComportamientoSchema = z.object({
  periodo: PeriodoEstadisticasSchema,
  transacciones: MetricasTransaccionesSchema,
  gastoPromedio: MetricasGastoPromedioSchema,
  diasActivos: MetricasDiasActivosSchema,
  frecuenciaCategorias: z.array(FrecuenciaCategoriaSchema),
})

// Schemas de respuesta del backend
export const ResumenEstadisticasResponseSchema = BackendResponseSchema(ResumenEstadisticasSchema)

export const TendenciasResponseSchema = BackendResponseSchema(TendenciasTemporalesSchema)

export const AnalisisCategoriasResponseSchema = BackendResponseSchema(AnalisisCategoriasSchema)

export const MetricasComportamientoResponseSchema = BackendResponseSchema(MetricasComportamientoSchema)

