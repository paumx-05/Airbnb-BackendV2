// Utilidades para manejar gastos con API del backend
// Funciones que integran con el servicio de gastos del backend
// Mantiene compatibilidad con la interfaz anterior

import { getUsuarioActual } from './auth'
import { gastosService } from '@/services/gastos.service'
import type { Gasto as BackendGasto } from '@/models/gastos'

// Interfaz local para compatibilidad con código existente
export interface Gasto {
  id: string
  descripcion: string
  monto: number
  fecha: string
  mes: string
  categoria: string
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado: boolean
  }>
}

// Función helper para convertir Gasto del backend a Gasto local
function adaptBackendGastoToLocal(backendGasto: BackendGasto): Gasto {
  return {
    id: backendGasto._id,
    descripcion: backendGasto.descripcion,
    monto: backendGasto.monto,
    fecha: backendGasto.fecha,
    mes: backendGasto.mes,
    categoria: backendGasto.categoria,
    dividido: backendGasto.dividido,
  }
}

// Lista de categorías predefinidas para gastos
export const categoriasGastos = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Compras',
  'Restaurantes',
  'Otros'
]

// Función para obtener todos los gastos de un mes desde el backend
export async function getGastos(mes: string, userId?: string): Promise<Gasto[]> {
  try {
    console.log('[LIB GASTOS] Obteniendo gastos para mes:', mes)
    const { gastos } = await gastosService.getGastosByMes(mes)
    console.log('[LIB GASTOS] Gastos recibidos del servicio:', gastos.length, gastos)
    const gastosAdaptados = gastos.map(adaptBackendGastoToLocal)
    console.log('[LIB GASTOS] Gastos adaptados:', gastosAdaptados.length, gastosAdaptados)
    return gastosAdaptados
  } catch (error) {
    console.error('[LIB GASTOS] Error al obtener gastos:', error)
    // En caso de error, retornar array vacío
    return []
  }
}

// Función para guardar gastos de un mes (deprecated - usar addGasto)
// Mantenida para compatibilidad pero no hace nada ya que los gastos se guardan en el backend
export function saveGastos(mes: string, gastos: Gasto[], userId?: string): void {
  // Deprecated: Los gastos ahora se guardan directamente en el backend
  console.warn('saveGastos está deprecated. Los gastos se guardan automáticamente en el backend.')
}

// Función para agregar un nuevo gasto al backend
// Ahora incluye soporte completo para gastos divididos
export async function addGasto(mes: string, gasto: Omit<Gasto, 'id'>, userId?: string): Promise<void> {
  try {
    // Convertir fecha a formato ISO si es necesario
    let fechaISO = gasto.fecha
    if (fechaISO && !fechaISO.includes('T')) {
      // Si la fecha está en formato YYYY-MM-DD, convertir a ISO
      fechaISO = new Date(fechaISO).toISOString()
    }
    
    // Preparar el objeto dividido si existe
    // Asegurar que todos los objetos tengan el campo pagado (default: false)
    const dividido = gasto.dividido?.map(item => ({
      amigoId: item.amigoId,
      amigoNombre: item.amigoNombre,
      montoDividido: item.montoDividido,
      pagado: item.pagado ?? false, // Default false si no está definido
    }))
    
    await gastosService.createGasto({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha: fechaISO,
      categoria: gasto.categoria,
      mes: gasto.mes || mes,
      dividido: dividido, // Enviar el array de división si existe
    })
  } catch (error: any) {
    console.error('Error al crear gasto:', error)
    throw error
  }
}

// Función para eliminar un gasto del backend
export async function deleteGasto(mes: string, id: string, userId?: string): Promise<void> {
  try {
    await gastosService.deleteGasto(id)
  } catch (error) {
    console.error('Error al eliminar gasto:', error)
    throw error
  }
}

// Función para obtener el total de gastos de un mes desde el backend
export async function getTotalGastos(mes: string, userId?: string): Promise<number> {
  try {
    return await gastosService.getTotalByMes(mes)
  } catch (error) {
    console.error('Error al obtener total de gastos:', error)
    return 0
  }
}

// Función para obtener gastos por categoría desde el backend
export async function getGastosPorCategoria(mes: string, categoria: string, userId?: string): Promise<Gasto[]> {
  try {
    const { gastos } = await gastosService.getGastosByCategoria(mes, categoria)
    return gastos.map(adaptBackendGastoToLocal)
  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error)
    return []
  }
}

// Función para obtener el total de gastos por categoría
export async function getTotalPorCategoria(mes: string, categoria: string, userId?: string): Promise<number> {
  try {
    const { total } = await gastosService.getGastosByCategoria(mes, categoria)
    return total
  } catch (error) {
    console.error('Error al obtener total por categoría:', error)
    return 0
  }
}

// Función para obtener resumen por categorías desde el backend
export async function getResumenPorCategorias(mes: string, userId?: string): Promise<{ [categoria: string]: number }> {
  try {
    const gastos = await getGastos(mes, userId)
    const resumen: { [categoria: string]: number } = {}
    
    gastos.forEach(gasto => {
      if (resumen[gasto.categoria]) {
        resumen[gasto.categoria] += gasto.monto
      } else {
        resumen[gasto.categoria] = gasto.monto
      }
    })
    
    return resumen
  } catch (error) {
    console.error('Error al obtener resumen por categorías:', error)
    return {}
  }
}

// Función para actualizar un gasto (útil para actualizar el estado de pago en gastos divididos)
export async function updateGasto(gastoId: string, updates: {
  descripcion?: string
  monto?: number
  fecha?: string
  categoria?: string
  mes?: string
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado?: boolean
  }>
}): Promise<void> {
  try {
    await gastosService.updateGasto(gastoId, updates)
  } catch (error: any) {
    console.error('Error al actualizar gasto:', error)
    throw error
  }
}

// Función helper para marcar un amigo como pagado en un gasto dividido
// Requiere pasar el array dividido actualizado del gasto
export async function marcarAmigoComoPagado(
  gastoId: string, 
  amigoId: string, 
  divididoActual: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado: boolean
  }>
): Promise<void> {
  try {
    // Actualizar el array dividido marcando el amigo como pagado
    const divididoActualizado = divididoActual.map(item => {
      if (item.amigoId === amigoId) {
        return { ...item, pagado: true }
      }
      return item
    })
    
    // Actualizar el gasto con el array dividido actualizado
    await updateGasto(gastoId, { dividido: divididoActualizado })
  } catch (error: any) {
    console.error('Error al marcar amigo como pagado:', error)
    throw error
  }
}

