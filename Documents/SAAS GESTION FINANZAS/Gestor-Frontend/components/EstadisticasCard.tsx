'use client'

// Componente de tarjeta de estadística
// Muestra una métrica individual con título, valor y opcionalmente un cambio porcentual

interface EstadisticasCardProps {
  titulo: string
  valor: number | string
  subtitulo?: string
  icono?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  cambio?: {
    valor: number
    porcentaje: number
    tipo: 'aumento' | 'disminucion'
  }
  formato?: 'currency' | 'number' | 'percentage' | 'text'
}

export default function EstadisticasCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color = 'primary',
  cambio,
  formato = 'number',
}: EstadisticasCardProps) {
  // Formatear valor según el tipo
  const formatearValor = (val: number | string): string => {
    if (typeof val === 'string') return val
    
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

  // Colores según el tipo
  const colores = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  }

  const colorClase = `estadisticas-card-${color}`
  const colorValor = colores[color]

  return (
    <div className={`estadisticas-card ${colorClase}`}>
      <div className="estadisticas-card-header">
        {icono && <span className="estadisticas-card-icon">{icono}</span>}
        <h3 className="estadisticas-card-titulo">{titulo}</h3>
      </div>
      <div className="estadisticas-card-body">
        <div className="estadisticas-card-valor" style={{ color: colorValor }}>
          {formatearValor(valor)}
        </div>
        {subtitulo && (
          <div className="estadisticas-card-subtitulo">{subtitulo}</div>
        )}
        {cambio && (
          <div
            className={`estadisticas-card-cambio ${
              cambio.tipo === 'aumento' ? 'aumento' : 'disminucion'
            }`}
          >
            <span className="estadisticas-card-cambio-icono">
              {cambio.tipo === 'aumento' ? '↑' : '↓'}
            </span>
            <span className="estadisticas-card-cambio-valor">
              {Math.abs(cambio.porcentaje).toFixed(1)}%
            </span>
            <span className="estadisticas-card-cambio-texto">
              vs periodo anterior
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

