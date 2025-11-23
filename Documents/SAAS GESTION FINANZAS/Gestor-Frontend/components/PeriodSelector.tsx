'use client'

// Componente selector de periodo temporal
// Permite seleccionar entre Anual, Mensual y Semanal

import type { PeriodoEstadisticas } from '@/models/estadisticas'

interface PeriodSelectorProps {
  periodo: PeriodoEstadisticas
  onChange: (periodo: PeriodoEstadisticas) => void
  className?: string
}

export default function PeriodSelector({
  periodo,
  onChange,
  className = '',
}: PeriodSelectorProps) {
  const periodos: Array<{ valor: PeriodoEstadisticas; label: string; icono: string }> = [
    { valor: 'semanal', label: 'Semanal', icono: '📅' },
    { valor: 'mensual', label: 'Mensual', icono: '📆' },
    { valor: 'anual', label: 'Anual', icono: '📊' },
  ]

  return (
    <div className={`period-selector ${className}`}>
      <label className="period-selector-label">Periodo:</label>
      <div className="period-selector-buttons">
        {periodos.map((p) => (
          <button
            key={p.valor}
            type="button"
            className={`period-selector-button ${
              periodo === p.valor ? 'active' : ''
            }`}
            onClick={() => onChange(p.valor)}
            title={`Ver estadísticas ${p.label.toLowerCase()}`}
          >
            <span className="period-selector-icon">{p.icono}</span>
            <span className="period-selector-text">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

