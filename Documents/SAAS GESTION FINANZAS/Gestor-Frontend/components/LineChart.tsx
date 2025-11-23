'use client'

// Componente de gráfico de líneas
// Muestra tendencias temporales de ingresos y gastos (acumulados)

import { useState } from 'react'
import type { PuntoGrafico } from '@/models/estadisticas'

interface PuntoGraficoConBalance extends PuntoGrafico {
  balance?: number
  ingresoPeriodo?: number // Ingreso individual del periodo (para tooltip)
  gastoPeriodo?: number // Gasto individual del periodo (para tooltip)
}

interface LineChartProps {
  data: PuntoGraficoConBalance[]
  width?: number
  height?: number
  showLegend?: boolean
  showArea?: boolean // Mostrar área sombreada entre líneas
  showBalanceLine?: boolean // Mostrar línea de balance neto
}

interface TooltipData {
  x: number
  y: number
  fecha: string
  ingresoPeriodo: number
  gastoPeriodo: number
  ingresoAcumulado: number
  gastoAcumulado: number
  balance: number
}

export default function LineChart({
  data,
  width = 800,
  height = 400,
  showLegend = true,
  showArea = false,
  showBalanceLine = false,
}: LineChartProps) {
  // Estado para el tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  if (data.length === 0) {
    return (
      <div className="line-chart-empty">
        <p>No hay datos disponibles para mostrar</p>
      </div>
    )
  }

  // Calcular valores máximos para escalar el gráfico
  const maxIngresos = Math.max(...data.map((d) => d.ingresos), 0)
  const maxGastos = Math.max(...data.map((d) => d.gastos), 0)
  const maxBalance = showBalanceLine 
    ? Math.max(...data.map((d) => Math.abs(d.balance || 0)), 0)
    : 0
  const maxValor = Math.max(maxIngresos, maxGastos, maxBalance) * 1.1 // 10% de margen

  // Dimensiones del gráfico
  const padding = { top: 20, right: 40, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Función para convertir valor a coordenada Y
  const valorAY = (valor: number) => {
    return chartHeight - (valor / maxValor) * chartHeight
  }

  // Función para convertir índice a coordenada X
  const indiceAX = (indice: number) => {
    return (indice / (data.length - 1 || 1)) * chartWidth
  }

  // Generar puntos para la línea de ingresos
  const puntosIngresos = data
    .map((d, i) => `${indiceAX(i)},${valorAY(d.ingresos)}`)
    .join(' ')

  // Generar puntos para la línea de gastos
  const puntosGastos = data
    .map((d, i) => `${indiceAX(i)},${valorAY(d.gastos)}`)
    .join(' ')

  // Generar puntos para la línea de balance (si está habilitada)
  const puntosBalance = showBalanceLine && data[0]?.balance !== undefined
    ? data
        .map((d, i) => `${indiceAX(i)},${valorAY(d.balance || 0)}`)
        .join(' ')
    : null

  // Generar área sombreada entre ingresos y gastos
  const generarAreaSombreada = () => {
    if (!showArea || data.length === 0) return null

    // Crear path para el área entre las dos líneas
    let path = `M ${padding.left + indiceAX(0)} ${padding.top + valorAY(data[0].ingresos)}`

    // Seguir la línea de ingresos
    for (let i = 1; i < data.length; i++) {
      path += ` L ${padding.left + indiceAX(i)} ${padding.top + valorAY(data[i].ingresos)}`
    }

    // Cerrar el área siguiendo la línea de gastos hacia atrás
    for (let i = data.length - 1; i >= 0; i--) {
      path += ` L ${padding.left + indiceAX(i)} ${padding.top + valorAY(data[i].gastos)}`
    }

    path += ' Z'
    return path
  }

  // Determinar el color del área según si gastos > ingresos
  const colorArea = data.length > 0 && data[data.length - 1].gastos > data[data.length - 1].ingresos
    ? 'rgba(239, 68, 68, 0.2)' // Rojo si gastos > ingresos
    : 'rgba(16, 185, 129, 0.2)' // Verde si ingresos > gastos

  // Formatear fecha para mostrar en el eje X
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }

  // Formatear fecha completa para el tooltip
  const formatearFechaCompleta = (fecha: string): string => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Formatear moneda
  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor)
  }

  // Manejar hover sobre puntos
  const handlePuntoHover = (
    punto: PuntoGraficoConBalance, 
    indice: number, 
    tipo: 'ingreso' | 'gasto'
  ) => {
    const x = padding.left + indiceAX(indice)
    const y = tipo === 'ingreso' 
      ? padding.top + valorAY(punto.ingresos)
      : padding.top + valorAY(punto.gastos)

    setTooltip({
      x,
      y,
      fecha: punto.fecha,
      ingresoPeriodo: punto.ingresoPeriodo || 0,
      gastoPeriodo: punto.gastoPeriodo || 0,
      ingresoAcumulado: punto.ingresos,
      gastoAcumulado: punto.gastos,
      balance: punto.balance || 0
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <div className="line-chart-container">
      <svg width={width} height={height} className="line-chart-svg">
        {/* Fondo */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Línea de referencia en 0 (si hay balance negativo) */}
        {showBalanceLine && (
          <line
            x1={padding.left}
            y1={padding.top + valorAY(0)}
            x2={padding.left + chartWidth}
            y2={padding.top + valorAY(0)}
            stroke="#64748b"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.5"
          />
        )}

        {/* Líneas de cuadrícula horizontales */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight
          const valor = maxValor * ratio
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(valor)}
              </text>
            </g>
          )
        })}

        {/* Área sombreada entre ingresos y gastos */}
        {showArea && generarAreaSombreada() && (
          <path
            d={generarAreaSombreada()!}
            fill={colorArea}
            stroke="none"
            opacity="0.3"
          />
        )}

        {/* Línea de ingresos */}
        <polyline
          points={puntosIngresos}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Línea de gastos */}
        <polyline
          points={puntosGastos}
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Línea de balance neto (opcional) */}
        {showBalanceLine && puntosBalance && (
          <polyline
            points={puntosBalance}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            transform={`translate(${padding.left}, ${padding.top})`}
            opacity="0.7"
          />
        )}

        {/* Puntos de datos - Ingresos */}
        {data.map((d, i) => (
          <g key={`ingresos-grupo-${i}`}>
            <circle
              cx={padding.left + indiceAX(i)}
              cy={padding.top + valorAY(d.ingresos)}
              r="8"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => handlePuntoHover(d, i, 'ingreso')}
              onMouseLeave={handleMouseLeave}
            />
            <circle
              cx={padding.left + indiceAX(i)}
              cy={padding.top + valorAY(d.ingresos)}
              r="4"
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}

        {/* Puntos de datos - Gastos */}
        {data.map((d, i) => (
          <g key={`gastos-grupo-${i}`}>
            <circle
              cx={padding.left + indiceAX(i)}
              cy={padding.top + valorAY(d.gastos)}
              r="8"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => handlePuntoHover(d, i, 'gasto')}
              onMouseLeave={handleMouseLeave}
            />
            <circle
              cx={padding.left + indiceAX(i)}
              cy={padding.top + valorAY(d.gastos)}
              r="4"
              fill="#ef4444"
              stroke="#0f172a"
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        ))}

        {/* Etiquetas del eje X */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={padding.left + indiceAX(i)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
          >
            {formatearFecha(d.fecha)}
          </text>
        ))}
      </svg>

      {/* Leyenda */}
      {showLegend && (
        <div className="line-chart-legend">
          <div className="line-chart-legend-item">
            <div
              className="line-chart-legend-color"
              style={{ backgroundColor: '#10b981' }}
            />
            <span className="line-chart-legend-label">Ingresos Acumulados</span>
          </div>
          <div className="line-chart-legend-item">
            <div
              className="line-chart-legend-color"
              style={{ backgroundColor: '#ef4444' }}
            />
            <span className="line-chart-legend-label">Gastos Acumulados</span>
          </div>
          {showBalanceLine && (
            <div className="line-chart-legend-item">
              <div
                className="line-chart-legend-color"
                style={{ backgroundColor: '#3b82f6' }}
              />
              <span className="line-chart-legend-label">Balance Neto</span>
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="line-chart-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x + 15,
            top: tooltip.y - 10,
            transform: tooltip.x > width - 250 ? 'translateX(-100%)' : 'none',
            marginLeft: tooltip.x > width - 250 ? '-30px' : '0',
          }}
        >
          <div className="line-chart-tooltip-header">
            {formatearFechaCompleta(tooltip.fecha)}
          </div>
          <div className="line-chart-tooltip-content">
            <div className="line-chart-tooltip-row">
              <span className="line-chart-tooltip-label">
                <span className="line-chart-tooltip-dot" style={{ backgroundColor: '#10b981' }} />
                Ingreso del periodo:
              </span>
              <span className="line-chart-tooltip-value">
                {formatearMoneda(tooltip.ingresoPeriodo)}
              </span>
            </div>
            <div className="line-chart-tooltip-row">
              <span className="line-chart-tooltip-label">
                <span className="line-chart-tooltip-dot" style={{ backgroundColor: '#ef4444' }} />
                Gasto del periodo:
              </span>
              <span className="line-chart-tooltip-value">
                {formatearMoneda(tooltip.gastoPeriodo)}
              </span>
            </div>
            <div className="line-chart-tooltip-divider" />
            <div className="line-chart-tooltip-row">
              <span className="line-chart-tooltip-label-secondary">
                Ingreso acumulado:
              </span>
              <span className="line-chart-tooltip-value-secondary">
                {formatearMoneda(tooltip.ingresoAcumulado)}
              </span>
            </div>
            <div className="line-chart-tooltip-row">
              <span className="line-chart-tooltip-label-secondary">
                Gasto acumulado:
              </span>
              <span className="line-chart-tooltip-value-secondary">
                {formatearMoneda(tooltip.gastoAcumulado)}
              </span>
            </div>
            <div className="line-chart-tooltip-divider" />
            <div className="line-chart-tooltip-row line-chart-tooltip-balance">
              <span className="line-chart-tooltip-label-balance">
                Balance:
              </span>
              <span 
                className="line-chart-tooltip-value-balance"
                style={{ 
                  color: tooltip.balance >= 0 ? '#10b981' : '#ef4444' 
                }}
              >
                {formatearMoneda(tooltip.balance)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

