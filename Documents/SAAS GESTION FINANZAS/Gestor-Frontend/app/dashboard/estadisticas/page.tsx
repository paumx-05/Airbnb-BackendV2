'use client'

// Página de Estadísticas
// Muestra análisis financieros detallados con soporte para diferentes periodos temporales
// Integración completa con backend MongoDB - NO USAR MOCK

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from '@/lib/auth'
import { estadisticasService } from '@/services/estadisticas.service'
import { useCartera } from '@/hooks/useCartera'
import type {
  ResumenEstadisticas,
  TendenciasTemporales,
  AnalisisCategorias,
  MetricasComportamiento,
  PeriodoEstadisticas,
} from '@/models/estadisticas'
import EstadisticasCard from '@/components/EstadisticasCard'
import PeriodSelector from '@/components/PeriodSelector'
import ComparativaCard from '@/components/ComparativaCard'
import LineChart from '@/components/LineChart'
import PieChart from '@/components/PieChart'

export default function EstadisticasPage() {
  const router = useRouter()
  const { carteraActivaId } = useCartera()

  // Estados
  const [periodo, setPeriodo] = useState<PeriodoEstadisticas>('mensual')
  const [resumen, setResumen] = useState<ResumenEstadisticas | null>(null)
  const [tendencias, setTendencias] = useState<TendenciasTemporales | null>(null)
  const [analisisCategorias, setAnalisisCategorias] = useState<AnalisisCategorias | null>(null)
  const [metricasComportamiento, setMetricasComportamiento] = useState<MetricasComportamiento | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendNoDisponible, setBackendNoDisponible] = useState(false)

  // Verificar autenticación al cargar
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [router])

  // Función para cargar todos los datos
  const cargarDatos = useCallback(async () => {
    if (!getAuth()) return

    let cancelled = false
    setLoading(true)
    setError(null)

    try {
      const carteraId = carteraActivaId || undefined

      console.log('[ESTADISTICAS] Cargando datos para periodo:', periodo, 'carteraId:', carteraId)

      // Cargar todos los datos en paralelo
      const [resumenData, tendenciasData, categoriasData, comportamientoData] = await Promise.all([
        estadisticasService.getResumen(periodo, carteraId),
        estadisticasService.getTendencias(periodo, carteraId),
        estadisticasService.getAnalisisCategorias(periodo, carteraId, undefined, 'ambos', 10),
        estadisticasService.getMetricasComportamiento(periodo, carteraId),
      ])

      // Verificar si el efecto fue cancelado
      if (cancelled) {
        console.log('[ESTADISTICAS] Carga cancelada - periodo o cartera cambió')
        return
      }

      console.log('[ESTADISTICAS] Datos cargados correctamente')

      // Actualizar estados
      setResumen(resumenData)
      setTendencias(tendenciasData)
      setAnalisisCategorias(categoriasData)
      setMetricasComportamiento(comportamientoData)
    } catch (error: any) {
      if (!cancelled) {
        console.error('[ESTADISTICAS] Error al cargar datos:', error)
        
        // Manejar errores según código de estado
        if (error.status === 404) {
          setBackendNoDisponible(false)
          setError('No se encontraron datos para el periodo seleccionado. Intenta con otro periodo o cartera.')
        } else {
          setBackendNoDisponible(false)
          setError(error.error || error.message || 'Error al cargar las estadísticas. Por favor, intenta de nuevo.')
        }
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }

    return () => {
      cancelled = true
    }
  }, [periodo, carteraActivaId])

  // Cargar datos cuando cambia el periodo o la cartera
  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Formatear fecha para mostrar
  const formatearRangoFechas = (fechaInicio: string, fechaFin: string): string => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (periodo === 'anual') {
      return `${inicio.getFullYear()}`
    } else if (periodo === 'mensual') {
      return inicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    } else {
      // Semanal
      const inicioStr = inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      const finStr = fin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${inicioStr} - ${finStr}`
    }
  }

  // Preparar datos para gráfico de categorías
  const COLORS = [
    '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  const pieChartData = analisisCategorias?.categoriasGastos.map((item, index) => ({
    categoria: item.categoria,
    monto: item.monto,
    porcentaje: item.porcentaje,
    color: COLORS[index % COLORS.length],
  })) || []

  const totalGastosChart = analisisCategorias?.totalGastos || 0

  // Calcular datos acumulados para el gráfico
  const datosGraficoAcumulados = useMemo(() => {
    if (!tendencias?.datosGrafico || tendencias.datosGrafico.length === 0) {
      return []
    }

    let ingresosAcumulados = 0
    let gastosAcumulados = 0

    return tendencias.datosGrafico.map((punto) => {
      // Sumar los valores del punto actual a los acumulados
      ingresosAcumulados += punto.ingresos
      gastosAcumulados += punto.gastos

      return {
        fecha: punto.fecha,
        ingresos: ingresosAcumulados,
        gastos: gastosAcumulados,
        balance: ingresosAcumulados - gastosAcumulados,
        // Mantener los valores del periodo para el tooltip
        ingresoPeriodo: punto.ingresos,
        gastoPeriodo: punto.gastos
      }
    })
  }, [tendencias?.datosGrafico])

  // Mostrar estado de carga
  if (loading && !resumen) {
    return (
      <div className="estadisticas-page">
        <div className="estadisticas-container">
          <div className="estadisticas-loading">
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar estado de error (especialmente para backend no disponible)
  if (error && !resumen) {
    return (
      <div className="estadisticas-page">
        <div className="estadisticas-container">
          <div className="estadisticas-header">
            <div>
              <h1 className="estadisticas-title">Estadísticas Financieras</h1>
              <p className="estadisticas-subtitle">
                Análisis detallado de tus finanzas
              </p>
            </div>
          </div>
          
          <div className={`estadisticas-error ${backendNoDisponible ? 'backend-no-disponible' : ''}`}>
            {backendNoDisponible ? (
              <>
                <div className="estadisticas-error-icon">🚧</div>
                <h2 className="estadisticas-error-title">Funcionalidad en Desarrollo</h2>
                <p className="estadisticas-error-message">
                  La sección de estadísticas está actualmente en desarrollo. 
                  El backend aún no está implementado, pero el frontend ya está listo.
                </p>
                <div className="estadisticas-error-details">
                  <p><strong>Estado:</strong> Frontend completado ✅</p>
                  <p><strong>Estado:</strong> Backend pendiente ⏳</p>
                  <p className="estadisticas-error-note">
                    Una vez que el backend esté implementado según la documentación en 
                    <code>Doc_backend/estadisticas-integracion.md</code>, 
                    esta funcionalidad estará completamente operativa.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="estadisticas-error-icon">❌</div>
                <p className="estadisticas-error-message">{error}</p>
                <button onClick={() => cargarDatos()} className="btn btn-primary">
                  Reintentar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="estadisticas-page">
      <div className="estadisticas-container">
        {/* Header */}
        <div className="estadisticas-header">
          <div>
            <h1 className="estadisticas-title">Estadísticas Financieras</h1>
            <p className="estadisticas-subtitle">
              Análisis detallado de tus finanzas
            </p>
          </div>
        </div>

        {/* Selector de periodo */}
        <div className="estadisticas-controls">
          <PeriodSelector periodo={periodo} onChange={setPeriodo} />
          {resumen && (
            <div className="estadisticas-periodo-info">
              <span className="estadisticas-periodo-label">
                {formatearRangoFechas(resumen.fechaInicio, resumen.fechaFin)}
              </span>
            </div>
          )}
        </div>

        {/* Mensaje de error si hay datos parciales */}
        {error && resumen && (
          <div className="estadisticas-error-partial">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Indicador de carga parcial */}
        {loading && resumen && (
          <div className="estadisticas-loading-partial">
            <p>Actualizando datos...</p>
          </div>
        )}

        {/* Resumen principal */}
        {resumen && (
          <div className="estadisticas-resumen-grid">
            <EstadisticasCard
              titulo="Total Ingresos"
              valor={resumen.ingresos.total}
              subtitulo={`${resumen.ingresos.cantidad} transacciones`}
              icono="💰"
              color="success"
              formato="currency"
            />
            <EstadisticasCard
              titulo="Total Gastos"
              valor={resumen.gastos.total}
              subtitulo={`${resumen.gastos.cantidad} transacciones`}
              icono="💸"
              color="danger"
              formato="currency"
            />
            <EstadisticasCard
              titulo="Balance Neto"
              valor={resumen.balance.total}
              subtitulo={`Promedio diario: ${resumen.balance.promedioDiario.toFixed(2)}€`}
              icono="💵"
              color={resumen.balance.total >= 0 ? 'success' : 'danger'}
              formato="currency"
            />
            <EstadisticasCard
              titulo="Tasa de Ahorro"
              valor={resumen.tasaAhorro}
              subtitulo="% del total de ingresos"
              icono="📈"
              color="info"
              formato="percentage"
            />
            <EstadisticasCard
              titulo="Ratio Gastos/Ingresos"
              valor={resumen.ratioGastosIngresos}
              subtitulo="% de ingresos gastados"
              icono="📊"
              color="warning"
              formato="percentage"
            />
          </div>
        )}

        {/* Tendencias y comparativas */}
        {tendencias && (
          <div className="estadisticas-tendencias-section">
            <h2 className="estadisticas-section-title">Tendencias Temporales</h2>
            
            {/* Gráfico de líneas */}
            <div className="estadisticas-chart-card">
              <h3 className="estadisticas-chart-title">Evolución Acumulada de Ingresos y Gastos</h3>
              <LineChart 
                data={datosGraficoAcumulados} 
                width={800} 
                height={400}
                showArea={true}
                showBalanceLine={true}
              />
            </div>

            {/* Comparativas */}
            <div className="estadisticas-comparativas-grid">
              <ComparativaCard
                titulo="Ingresos"
                valorActual={tendencias.periodoActual.ingresos}
                valorAnterior={tendencias.periodoAnterior.ingresos}
                cambio={tendencias.cambios.ingresos}
                formato="currency"
                icono="💰"
              />
              <ComparativaCard
                titulo="Gastos"
                valorActual={tendencias.periodoActual.gastos}
                valorAnterior={tendencias.periodoAnterior.gastos}
                cambio={tendencias.cambios.gastos}
                formato="currency"
                icono="💸"
              />
              <ComparativaCard
                titulo="Balance"
                valorActual={tendencias.periodoActual.balance}
                valorAnterior={tendencias.periodoAnterior.balance}
                cambio={tendencias.cambios.balance}
                formato="currency"
                icono="💵"
              />
            </div>
          </div>
        )}

        {/* Análisis por categorías */}
        {analisisCategorias && (
          <div className="estadisticas-categorias-section">
            <h2 className="estadisticas-section-title">Análisis por Categorías</h2>
            
            <div className="estadisticas-categorias-grid">
              {/* Gráfico circular de gastos */}
              {analisisCategorias.categoriasGastos.length > 0 && (
                <div className="estadisticas-chart-card">
                  <h3 className="estadisticas-chart-title">Distribución de Gastos</h3>
                  <PieChart data={pieChartData} total={totalGastosChart} size={350} />
                </div>
              )}

              {/* Tabla de categorías de gastos */}
              <div className="estadisticas-categorias-table-card">
                <h3 className="estadisticas-chart-title">Top Categorías de Gastos</h3>
                {analisisCategorias.categoriasGastos.length > 0 ? (
                  <table className="estadisticas-table">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Monto</th>
                        <th>%</th>
                        <th>Transacciones</th>
                        <th>Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analisisCategorias.categoriasGastos.map((cat, index) => (
                        <tr key={index}>
                          <td>
                            <span
                              className="estadisticas-categoria-color"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            {cat.categoria}
                          </td>
                          <td>
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(cat.monto)}
                          </td>
                          <td>{cat.porcentaje.toFixed(1)}%</td>
                          <td>{cat.cantidad}</td>
                          <td>
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(cat.promedio)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="estadisticas-empty">No hay gastos registrados en este periodo</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Métricas de comportamiento */}
        {metricasComportamiento && (
          <div className="estadisticas-comportamiento-section">
            <h2 className="estadisticas-section-title">Métricas de Comportamiento</h2>
            
            <div className="estadisticas-comportamiento-grid">
              <EstadisticasCard
                titulo="Total Transacciones"
                valor={metricasComportamiento.transacciones.total}
                subtitulo={`${metricasComportamiento.transacciones.ingresos} ingresos, ${metricasComportamiento.transacciones.gastos} gastos`}
                icono="📝"
                color="info"
                formato="number"
              />
              <EstadisticasCard
                titulo="Promedio Diario"
                valor={metricasComportamiento.transacciones.promedioDiario.toFixed(1)}
                subtitulo="Transacciones por día"
                icono="📅"
                color="primary"
                formato="number"
              />
              <EstadisticasCard
                titulo="Gasto Promedio"
                valor={metricasComportamiento.gastoPromedio.porTransaccion}
                subtitulo="Por transacción"
                icono="💳"
                color="warning"
                formato="currency"
              />
              <EstadisticasCard
                titulo="Días Activos"
                valor={metricasComportamiento.diasActivos.conGastos}
                subtitulo={`${metricasComportamiento.diasActivos.porcentajeActividad.toFixed(1)}% de actividad`}
                icono="📊"
                color="success"
                formato="number"
              />
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !resumen && !error && (
          <div className="estadisticas-empty-state">
            <p>No hay datos disponibles para mostrar</p>
            <p className="estadisticas-empty-subtitle">
              Registra ingresos y gastos para ver tus estadísticas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

