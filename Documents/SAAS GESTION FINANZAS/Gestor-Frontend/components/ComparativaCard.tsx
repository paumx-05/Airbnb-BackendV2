'use client'

// Componente de tarjeta de comparativa
// Muestra comparativa entre dos periodos con cambios porcentuales

import type { CambioFinanciero } from '@/models/estadisticas'

interface ComparativaCardProps {
  titulo: string
  valorActual: number
  valorAnterior: number
  cambio: CambioFinanciero
  formato?: 'currency' | 'number' | 'percentage'
  icono?: string
}

export default function ComparativaCard({
  titulo,
  valorActual,
  valorAnterior,
  cambio,
  formato = 'currency',
  icono,
}: ComparativaCardProps) {
  // Formatear valor según el tipo
  const formatearValor = (val: number): string => {
    switch (formato) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(val)
      case 'percentage':
        return `${val.toFixed(2)}%`
      case 'number':
        return new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val)
      default:
        return val.toString()
    }
  }

  const esPositivo = cambio.tipo === 'aumento'
  const colorCambio = esPositivo ? '#10b981' : '#ef4444'
  const iconoCambio = esPositivo ? '↑' : '↓'

  return (
    <div className="comparativa-card">
      <div className="comparativa-card-header">
        {icono && <span className="comparativa-card-icon">{icono}</span>}
        <h3 className="comparativa-card-titulo">{titulo}</h3>
      </div>
      <div className="comparativa-card-body">
        <div className="comparativa-card-valores">
          <div className="comparativa-card-valor-actual">
            <span className="comparativa-card-label">Actual:</span>
            <span className="comparativa-card-valor">
              {formatearValor(valorActual)}
            </span>
          </div>
          <div className="comparativa-card-valor-anterior">
            <span className="comparativa-card-label">Anterior:</span>
            <span className="comparativa-card-valor">
              {formatearValor(valorAnterior)}
            </span>
          </div>
        </div>
        <div
          className={`comparativa-card-cambio ${
            esPositivo ? 'aumento' : 'disminucion'
          }`}
          style={{ color: colorCambio }}
        >
          <span className="comparativa-card-cambio-icono">{iconoCambio}</span>
          <span className="comparativa-card-cambio-valor">
            {Math.abs(cambio.porcentaje).toFixed(1)}%
          </span>
          <span className="comparativa-card-cambio-absoluto">
            ({cambio.valor >= 0 ? '+' : ''}
            {formatearValor(cambio.valor)})
          </span>
        </div>
      </div>
    </div>
  )
}

