// Utilidades para agrupar y analizar gastos e ingresos por diferentes periodos
// Funciones simples para generar distribuciones de gastos e ingresos mensuales

import { getGastos, getResumenPorCategorias, type Gasto } from './gastos'
import { getIngresos, getResumenPorCategorias as getResumenIngresosPorCategorias, type Ingreso } from './ingresos'
import { getUsuarioActual } from './auth'

// Lista de meses del año
const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

const nombresMeses: { [key: string]: string } = {
  enero: 'Enero',
  febrero: 'Febrero',
  marzo: 'Marzo',
  abril: 'Abril',
  mayo: 'Mayo',
  junio: 'Junio',
  julio: 'Julio',
  agosto: 'Agosto',
  septiembre: 'Septiembre',
  octubre: 'Octubre',
  noviembre: 'Noviembre',
  diciembre: 'Diciembre'
}

// Interfaz para periodos de distribución
export interface PeriodoDistribucion {
  nombre: string
  total: number
  cantidad: number
  gastos: Gasto[]
}

// Función para obtener todos los gastos de un año
async function getAllGastosAnuales(año: number, userId?: string): Promise<Gasto[]> {
  const todosGastos: Gasto[] = []
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  
  // Usar Promise.all para obtener todos los gastos en paralelo
  const promesasGastos = meses.map(mes => getGastos(mes, usuarioId))
  const arraysGastos = await Promise.all(promesasGastos)
  
  // Filtrar gastos del año especificado y aplanar
  arraysGastos.forEach(gastosMes => {
    const gastosAño = gastosMes.filter(gasto => {
      const fecha = new Date(gasto.fecha)
      return fecha.getFullYear() === año
    })
    todosGastos.push(...gastosAño)
  })
  
  return todosGastos
}

// Función para obtener el número de semana del año
function getSemanaAño(fecha: Date): number {
  const inicioAño = new Date(fecha.getFullYear(), 0, 1)
  const dias = Math.floor((fecha.getTime() - inicioAño.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((dias + inicioAño.getDay() + 1) / 7)
}

// Función para obtener gastos agrupados por semanas
export async function getGastosPorSemanas(año: number, userId?: string): Promise<PeriodoDistribucion[]> {
  const gastos = await getAllGastosAnuales(año, userId)
  const semanas: { [semana: number]: Gasto[] } = {}
  
  gastos.forEach(gasto => {
    const fecha = new Date(gasto.fecha)
    const semana = getSemanaAño(fecha)
    
    if (!semanas[semana]) {
      semanas[semana] = []
    }
    semanas[semana].push(gasto)
  })
  
  return Object.keys(semanas)
    .map(Number)
    .sort((a, b) => a - b)
    .map(semana => {
      const gastosSemana = semanas[semana]
      return {
        nombre: `Semana ${semana}`,
        total: gastosSemana.reduce((sum, g) => sum + g.monto, 0),
        cantidad: gastosSemana.length,
        gastos: gastosSemana
      }
    })
}

// Función para obtener gastos agrupados por meses
export async function getGastosPorMeses(año: number, userId?: string): Promise<PeriodoDistribucion[]> {
  const distribucion: PeriodoDistribucion[] = []
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  
  // Obtener todos los gastos en paralelo
  const promesasGastos = meses.map(mes => getGastos(mes, usuarioId))
  const arraysGastos = await Promise.all(promesasGastos)
  
  // Procesar cada mes
  meses.forEach((mes, index) => {
    const gastosMes = arraysGastos[index]
    // Filtrar gastos del año especificado
    const gastosAño = gastosMes.filter(gasto => {
      const fecha = new Date(gasto.fecha)
      return fecha.getFullYear() === año
    })
    
    distribucion.push({
      nombre: nombresMeses[mes],
      total: gastosAño.reduce((sum, g) => sum + g.monto, 0),
      cantidad: gastosAño.length,
      gastos: gastosAño
    })
  })
  
  return distribucion
}

// Función para obtener gastos agrupados por trimestres
export async function getGastosPorTrimestres(año: number, userId?: string): Promise<PeriodoDistribucion[]> {
  const trimestres: { [trimestre: number]: Gasto[] } = {
    1: [], // Ene-Mar
    2: [], // Abr-Jun
    3: [], // Jul-Sep
    4: []  // Oct-Dic
  }
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  
  // Obtener todos los gastos en paralelo
  const promesasGastos = meses.map(mes => getGastos(mes, usuarioId))
  const arraysGastos = await Promise.all(promesasGastos)
  
  meses.forEach((mes, index) => {
    const trimestre = Math.floor(index / 3) + 1
    const gastosMes = arraysGastos[index]
    
    const gastosAño = gastosMes.filter(gasto => {
      const fecha = new Date(gasto.fecha)
      return fecha.getFullYear() === año
    })
    
    trimestres[trimestre].push(...gastosAño)
  })
  
  const nombresTrimestres: { [key: number]: string } = {
    1: 'Q1 (Ene-Mar)',
    2: 'Q2 (Abr-Jun)',
    3: 'Q3 (Jul-Sep)',
    4: 'Q4 (Oct-Dic)'
  }
  
  return [1, 2, 3, 4].map(trimestre => ({
    nombre: nombresTrimestres[trimestre],
    total: trimestres[trimestre].reduce((sum, g) => sum + g.monto, 0),
    cantidad: trimestres[trimestre].length,
    gastos: trimestres[trimestre]
  }))
}

// Función para obtener gastos agrupados por cuatrimestres
export async function getGastosPorCuatrimestres(año: number, userId?: string): Promise<PeriodoDistribucion[]> {
  const cuatrimestres: { [cuatrimestre: number]: Gasto[] } = {
    1: [], // Ene-Abr
    2: [], // May-Ago
    3: []  // Sep-Dic
  }
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  
  // Obtener todos los gastos en paralelo
  const promesasGastos = meses.map(mes => getGastos(mes, usuarioId))
  const arraysGastos = await Promise.all(promesasGastos)
  
  meses.forEach((mes, index) => {
    const cuatrimestre = Math.floor(index / 4) + 1
    const gastosMes = arraysGastos[index]
    
    const gastosAño = gastosMes.filter(gasto => {
      const fecha = new Date(gasto.fecha)
      return fecha.getFullYear() === año
    })
    
    cuatrimestres[cuatrimestre].push(...gastosAño)
  })
  
  const nombresCuatrimestres: { [key: number]: string } = {
    1: 'Cuatrimestre 1 (Ene-Abr)',
    2: 'Cuatrimestre 2 (May-Ago)',
    3: 'Cuatrimestre 3 (Sep-Dic)'
  }
  
  return [1, 2, 3].map(cuatrimestre => ({
    nombre: nombresCuatrimestres[cuatrimestre],
    total: cuatrimestres[cuatrimestre].reduce((sum, g) => sum + g.monto, 0),
    cantidad: cuatrimestres[cuatrimestre].length,
    gastos: cuatrimestres[cuatrimestre]
  }))
}

// Función para obtener gastos anuales
export async function getGastosAnuales(año: number, userId?: string): Promise<PeriodoDistribucion> {
  const gastos = await getAllGastosAnuales(año, userId)
  
  return {
    nombre: `Año ${año}`,
    total: gastos.reduce((sum, g) => sum + g.monto, 0),
    cantidad: gastos.length,
    gastos: gastos
  }
}

// Interfaz para distribución mensual por categorías
export interface DistribucionCategoria {
  categoria: string
  tipo: 'ingreso' | 'gasto'
  total: number
  cantidad: number
  porcentaje: number // Porcentaje sobre el total de ingresos del mes
}

// Función para obtener distribución mensual por categorías (incluyendo ingresos y gastos)
export async function getDistribucionMensualPorCategorias(mes: string, userId?: string): Promise<DistribucionCategoria[]> {
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  const [resumenGastos, resumenIngresos, gastos, ingresos] = await Promise.all([
    getResumenPorCategorias(mes, usuarioId),
    Promise.resolve(getResumenIngresosPorCategorias(mes, usuarioId)), // getResumenIngresosPorCategorias no es async
    getGastos(mes, usuarioId),
    Promise.resolve(getIngresos(mes, usuarioId)) // getIngresos no es async
  ])
  
  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const totalMes = totalIngresos + totalGastos
  
  // Si no hay ingresos ni gastos, retornar array vacío
  if (totalIngresos === 0 && totalGastos === 0) {
    return []
  }
  
  // Convertir el resumen en array de distribución
  const distribucion: DistribucionCategoria[] = []
  
  // Agregar ingresos por categorías
  Object.keys(resumenIngresos).forEach(categoria => {
    const total = resumenIngresos[categoria]
    const cantidad = ingresos.filter(i => i.categoria === categoria).length
    // Porcentaje sobre el total de ingresos
    const porcentaje = totalIngresos > 0 ? (total / totalIngresos) * 100 : 0
    
    distribucion.push({
      categoria: `${categoria} (Ingreso)`,
      tipo: 'ingreso',
      total,
      cantidad,
      porcentaje
    })
  })
  
  // Agregar gastos por categorías
  Object.keys(resumenGastos).forEach(categoria => {
    const total = resumenGastos[categoria]
    const cantidad = gastos.filter(g => g.categoria === categoria).length
    // Porcentaje sobre el total de ingresos (para ver qué % de ingresos se gasta)
    const porcentaje = totalIngresos > 0 ? (total / totalIngresos) * 100 : 0
    
    distribucion.push({
      categoria: `${categoria} (Gasto)`,
      tipo: 'gasto',
      total,
      cantidad,
      porcentaje
    })
  })
  
  // Ordenar por total descendente
  return distribucion.sort((a, b) => b.total - a.total)
}

// Función para obtener resumen mensual completo (ingresos, gastos, balance)
export interface ResumenMensual {
  totalIngresos: number
  totalGastos: number
  balance: number
  porcentajeGastos: number // % de ingresos que se gasta
}

export async function getResumenMensual(mes: string, userId?: string): Promise<ResumenMensual> {
  const usuarioId = userId || (typeof window !== 'undefined' ? getUsuarioActual()?.id : undefined) || 'default'
  const ingresos = getIngresos(mes, usuarioId) // getIngresos no es async
  const gastos = await getGastos(mes, usuarioId)
  
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const balance = totalIngresos - totalGastos
  const porcentajeGastos = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0
  
  return {
    totalIngresos,
    totalGastos,
    balance,
    porcentajeGastos
  }
}

