import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Gasto } from '../models/Gasto.model';
import { Ingreso } from '../models/Ingreso.model';
import { Cartera } from '../models/Cartera.model';

// Helper: Calcular rango de fechas según periodo
const calcularRangoFechas = (
  periodo: 'anual' | 'mensual' | 'semanal',
  fechaReferencia: Date = new Date()
): { inicio: Date; fin: Date } => {
  const fecha = new Date(fechaReferencia);
  let inicio: Date;
  let fin: Date;

  if (periodo === 'semanal') {
    // Obtener lunes de la semana
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar para que lunes sea 1
    inicio = new Date(fecha.setDate(diff));
    inicio.setHours(0, 0, 0, 0);

    // Obtener domingo de la semana
    fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
  } else if (periodo === 'mensual') {
    inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    inicio.setHours(0, 0, 0, 0);

    fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    fin.setHours(23, 59, 59, 999);
  } else {
    // anual
    inicio = new Date(fecha.getFullYear(), 0, 1);
    inicio.setHours(0, 0, 0, 0);

    fin = new Date(fecha.getFullYear(), 11, 31);
    fin.setHours(23, 59, 59, 999);
  }

  return { inicio, fin };
};

// Helper: Construir filtro base con validación de cartera
const construirFiltroBase = async (
  userId: string | mongoose.Types.ObjectId,
  inicio: Date,
  fin: Date,
  carteraId?: string
): Promise<{
  userId: mongoose.Types.ObjectId;
  fecha: { $gte: Date; $lte: Date };
  carteraId?: mongoose.Types.ObjectId | null;
}> => {
  const userIdObj =
    typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;

  const filtro: any = {
    userId: userIdObj,
    fecha: {
      $gte: inicio,
      $lte: fin
    }
  };

  if (carteraId) {
    // Validar que la cartera pertenece al usuario
    if (!mongoose.Types.ObjectId.isValid(carteraId)) {
      throw new Error('ID de cartera inválido');
    }

    const cartera = await Cartera.findOne({
      _id: carteraId,
      userId: userIdObj
    });

    if (!cartera) {
      throw new Error('Cartera no encontrada o no pertenece al usuario');
    }

    filtro.carteraId = new mongoose.Types.ObjectId(carteraId);
  } else {
    // Filtrar por datos sin cartera (carteraId = null)
    filtro.carteraId = null;
  }

  return filtro;
};

// Helper: Generar datos para gráfico
const generarDatosGrafico = async (
  periodo: 'anual' | 'mensual' | 'semanal',
  _inicio: Date,
  _fin: Date,
  filtroBase: any
): Promise<Array<{ fecha: string; ingresos: number; gastos: number }>> => {
  let groupBy: any;

  if (periodo === 'semanal' || periodo === 'mensual') {
    // Agrupar por día
    groupBy = {
      year: { $year: '$fecha' },
      month: { $month: '$fecha' },
      day: { $dayOfMonth: '$fecha' }
    };
  } else {
    // anual - agrupar por mes
    groupBy = {
      year: { $year: '$fecha' },
      month: { $month: '$fecha' }
    };
  }

  const [ingresosData, gastosData] = await Promise.all([
    Ingreso.aggregate([
      { $match: filtroBase },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$monto' },
          fecha: { $first: '$fecha' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Gasto.aggregate([
      { $match: filtroBase },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$monto' },
          fecha: { $first: '$fecha' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Combinar y formatear datos
  const datosMap = new Map<string, { fecha: string; ingresos: number; gastos: number }>();

  ingresosData.forEach((item) => {
    const fecha = new Date(item.fecha).toISOString().split('T')[0];
    if (!datosMap.has(fecha)) {
      datosMap.set(fecha, { fecha, ingresos: 0, gastos: 0 });
    }
    datosMap.get(fecha)!.ingresos = item.total;
  });

  gastosData.forEach((item) => {
    const fecha = new Date(item.fecha).toISOString().split('T')[0];
    if (!datosMap.has(fecha)) {
      datosMap.set(fecha, { fecha, ingresos: 0, gastos: 0 });
    }
    datosMap.get(fecha)!.gastos = item.total;
  });

  return Array.from(datosMap.values()).sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
};

// 1. Obtener Resumen de Estadísticas
export const getResumenEstadisticas = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const userId = req.user.userId;
    const { periodo, carteraId, fechaReferencia } = req.query;

    // Validar periodo
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo as string)) {
      res.status(400).json({
        success: false,
        error: 'Periodo inválido. Debe ser: anual, mensual o semanal'
      });
      return;
    }

    // Validar y convertir fechaReferencia
    const fechaRef = fechaReferencia
      ? new Date(fechaReferencia as string)
      : new Date();
    if (isNaN(fechaRef.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Fecha de referencia inválida'
      });
      return;
    }

    // Calcular rango de fechas
    const { inicio, fin } = calcularRangoFechas(
      periodo as 'anual' | 'mensual' | 'semanal',
      fechaRef
    );

    // Construir filtro base
    const filtroBase = await construirFiltroBase(
      userId,
      inicio,
      fin,
      carteraId as string | undefined
    );

    // Calcular días del periodo
    const diasPeriodo =
      Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Agregar ingresos
    const ingresosResult = await Ingreso.aggregate([
      { $match: filtroBase },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Agregar gastos
    const gastosResult = await Gasto.aggregate([
      { $match: filtroBase },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    const totalIngresos = ingresosResult[0]?.total || 0;
    const cantidadIngresos = ingresosResult[0]?.cantidad || 0;
    const totalGastos = gastosResult[0]?.total || 0;
    const cantidadGastos = gastosResult[0]?.cantidad || 0;
    const balance = totalIngresos - totalGastos;

    const promedioDiarioIngresos =
      diasPeriodo > 0 ? totalIngresos / diasPeriodo : 0;
    const promedioDiarioGastos = diasPeriodo > 0 ? totalGastos / diasPeriodo : 0;
    const promedioDiarioBalance = diasPeriodo > 0 ? balance / diasPeriodo : 0;

    const tasaAhorro =
      totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0;
    const ratioGastosIngresos =
      totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        periodo,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
        ingresos: {
          total: parseFloat(totalIngresos.toFixed(2)),
          promedioDiario: parseFloat(promedioDiarioIngresos.toFixed(2)),
          cantidad: cantidadIngresos
        },
        gastos: {
          total: parseFloat(totalGastos.toFixed(2)),
          promedioDiario: parseFloat(promedioDiarioGastos.toFixed(2)),
          cantidad: cantidadGastos
        },
        balance: {
          total: parseFloat(balance.toFixed(2)),
          promedioDiario: parseFloat(promedioDiarioBalance.toFixed(2))
        },
        tasaAhorro: parseFloat(tasaAhorro.toFixed(2)),
        ratioGastosIngresos: parseFloat(ratioGastosIngresos.toFixed(2))
      }
    });
  } catch (error: any) {
    if (
      error.message === 'Cartera no encontrada o no pertenece al usuario' ||
      error.message === 'ID de cartera inválido'
    ) {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Error en getResumenEstadisticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de estadísticas'
    });
  }
};

// 2. Obtener Tendencias Temporales
export const getTendenciasTemporales = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const userId = req.user.userId;
    const { periodo, carteraId, fechaReferencia } = req.query;

    // Validar periodo
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo as string)) {
      res.status(400).json({
        success: false,
        error: 'Periodo inválido'
      });
      return;
    }

    const fechaRef = fechaReferencia
      ? new Date(fechaReferencia as string)
      : new Date();
    const { inicio, fin } = calcularRangoFechas(
      periodo as 'anual' | 'mensual' | 'semanal',
      fechaRef
    );

    // Calcular periodo anterior
    let inicioAnterior: Date;
    let finAnterior: Date;
    if (periodo === 'semanal') {
      inicioAnterior = new Date(inicio);
      inicioAnterior.setDate(inicioAnterior.getDate() - 7);
      finAnterior = new Date(fin);
      finAnterior.setDate(finAnterior.getDate() - 7);
    } else if (periodo === 'mensual') {
      inicioAnterior = new Date(inicio.getFullYear(), inicio.getMonth() - 1, 1);
      finAnterior = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        0
      );
      finAnterior.setHours(23, 59, 59, 999);
    } else {
      // anual
      inicioAnterior = new Date(inicio.getFullYear() - 1, 0, 1);
      finAnterior = new Date(inicio.getFullYear() - 1, 11, 31);
      finAnterior.setHours(23, 59, 59, 999);
    }

    // Construir filtros
    const filtroBase = await construirFiltroBase(
      userId,
      inicio,
      fin,
      carteraId as string | undefined
    );

    const filtroAnterior = await construirFiltroBase(
      userId,
      inicioAnterior,
      finAnterior,
      carteraId as string | undefined
    );

    // Obtener datos del periodo actual
    const [ingresosActual, gastosActual] = await Promise.all([
      Ingreso.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Gasto.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ])
    ]);

    // Obtener datos del periodo anterior
    const [ingresosAnterior, gastosAnterior] = await Promise.all([
      Ingreso.aggregate([
        { $match: filtroAnterior },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Gasto.aggregate([
        { $match: filtroAnterior },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ])
    ]);

    const ingresosActualTotal = ingresosActual[0]?.total || 0;
    const gastosActualTotal = gastosActual[0]?.total || 0;
    const balanceActual = ingresosActualTotal - gastosActualTotal;

    const ingresosAnteriorTotal = ingresosAnterior[0]?.total || 0;
    const gastosAnteriorTotal = gastosAnterior[0]?.total || 0;
    const balanceAnterior = ingresosAnteriorTotal - gastosAnteriorTotal;

    // Calcular cambios
    const cambioIngresos = ingresosActualTotal - ingresosAnteriorTotal;
    const cambioGastos = gastosActualTotal - gastosAnteriorTotal;
    const cambioBalance = balanceActual - balanceAnterior;

    const porcentajeIngresos =
      ingresosAnteriorTotal > 0
        ? (cambioIngresos / ingresosAnteriorTotal) * 100
        : ingresosActualTotal > 0
        ? 100
        : 0;

    const porcentajeGastos =
      gastosAnteriorTotal > 0
        ? (cambioGastos / gastosAnteriorTotal) * 100
        : gastosAnteriorTotal > 0
        ? -100
        : 0;

    const porcentajeBalance =
      balanceAnterior !== 0
        ? (cambioBalance / Math.abs(balanceAnterior)) * 100
        : balanceActual !== 0
        ? 100
        : 0;

    // Generar datos para gráfico
    const datosGrafico = await generarDatosGrafico(
      periodo as 'anual' | 'mensual' | 'semanal',
      inicio,
      fin,
      filtroBase
    );

    res.status(200).json({
      success: true,
      data: {
        periodo,
        periodoActual: {
          fechaInicio: inicio.toISOString(),
          fechaFin: fin.toISOString(),
          ingresos: parseFloat(ingresosActualTotal.toFixed(2)),
          gastos: parseFloat(gastosActualTotal.toFixed(2)),
          balance: parseFloat(balanceActual.toFixed(2))
        },
        periodoAnterior: {
          fechaInicio: inicioAnterior.toISOString(),
          fechaFin: finAnterior.toISOString(),
          ingresos: parseFloat(ingresosAnteriorTotal.toFixed(2)),
          gastos: parseFloat(gastosAnteriorTotal.toFixed(2)),
          balance: parseFloat(balanceAnterior.toFixed(2))
        },
        cambios: {
          ingresos: {
            valor: parseFloat(cambioIngresos.toFixed(2)),
            porcentaje: parseFloat(porcentajeIngresos.toFixed(2)),
            tipo: cambioIngresos >= 0 ? 'aumento' : 'disminucion'
          },
          gastos: {
            valor: parseFloat(cambioGastos.toFixed(2)),
            porcentaje: parseFloat(porcentajeGastos.toFixed(2)),
            tipo: cambioGastos >= 0 ? 'aumento' : 'disminucion'
          },
          balance: {
            valor: parseFloat(cambioBalance.toFixed(2)),
            porcentaje: parseFloat(porcentajeBalance.toFixed(2)),
            tipo: cambioBalance >= 0 ? 'aumento' : 'disminucion'
          }
        },
        datosGrafico
      }
    });
  } catch (error: any) {
    if (
      error.message === 'Cartera no encontrada o no pertenece al usuario' ||
      error.message === 'ID de cartera inválido'
    ) {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Error en getTendenciasTemporales:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tendencias temporales'
    });
  }
};

// 3. Obtener Análisis por Categorías
export const getAnalisisCategorias = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const userId = req.user.userId;
    const {
      periodo,
      carteraId,
      fechaReferencia,
      tipo = 'ambos',
      limite = '10'
    } = req.query;

    // Validaciones
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo as string)) {
      res.status(400).json({
        success: false,
        error: 'Periodo inválido'
      });
      return;
    }

    if (!['gastos', 'ingresos', 'ambos'].includes(tipo as string)) {
      res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
      return;
    }

    const fechaRef = fechaReferencia
      ? new Date(fechaReferencia as string)
      : new Date();
    const { inicio, fin } = calcularRangoFechas(
      periodo as 'anual' | 'mensual' | 'semanal',
      fechaRef
    );

    const filtroBase = await construirFiltroBase(
      userId,
      inicio,
      fin,
      carteraId as string | undefined
    );

    const resultados: {
      categoriasGastos: Array<{
        categoria: string;
        monto: number;
        porcentaje: number;
        cantidad: number;
        promedio: number;
        tendencia: string;
      }>;
      categoriasIngresos: Array<{
        categoria: string;
        monto: number;
        porcentaje: number;
        cantidad: number;
        promedio: number;
        tendencia: string;
      }>;
      totalGastos: number;
      totalIngresos: number;
    } = {
      categoriasGastos: [],
      categoriasIngresos: [],
      totalGastos: 0,
      totalIngresos: 0
    };

    // Obtener gastos por categoría
    if (tipo === 'gastos' || tipo === 'ambos') {
      const gastosPorCategoria = await Gasto.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: '$categoria',
            monto: { $sum: '$monto' },
            cantidad: { $sum: 1 }
          }
        },
        { $sort: { monto: -1 } },
        { $limit: parseInt(limite as string) }
      ]);

      const totalGastos = await Gasto.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]);

      resultados.totalGastos = totalGastos[0]?.total || 0;

      resultados.categoriasGastos = gastosPorCategoria.map((item) => ({
        categoria: item._id,
        monto: parseFloat(item.monto.toFixed(2)),
        porcentaje:
          resultados.totalGastos > 0
            ? parseFloat(((item.monto / resultados.totalGastos) * 100).toFixed(2))
            : 0,
        cantidad: item.cantidad,
        promedio: parseFloat((item.monto / item.cantidad).toFixed(2)),
        tendencia: 'estable' // TODO: Implementar comparativa con periodo anterior
      }));
    }

    // Obtener ingresos por categoría
    if (tipo === 'ingresos' || tipo === 'ambos') {
      const ingresosPorCategoria = await Ingreso.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: '$categoria',
            monto: { $sum: '$monto' },
            cantidad: { $sum: 1 }
          }
        },
        { $sort: { monto: -1 } },
        { $limit: parseInt(limite as string) }
      ]);

      const totalIngresos = await Ingreso.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]);

      resultados.totalIngresos = totalIngresos[0]?.total || 0;

      resultados.categoriasIngresos = ingresosPorCategoria.map((item) => ({
        categoria: item._id,
        monto: parseFloat(item.monto.toFixed(2)),
        porcentaje:
          resultados.totalIngresos > 0
            ? parseFloat(
                ((item.monto / resultados.totalIngresos) * 100).toFixed(2)
              )
            : 0,
        cantidad: item.cantidad,
        promedio: parseFloat((item.monto / item.cantidad).toFixed(2)),
        tendencia: 'estable' // TODO: Implementar comparativa con periodo anterior
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        periodo,
        ...resultados
      }
    });
  } catch (error: any) {
    if (
      error.message === 'Cartera no encontrada o no pertenece al usuario' ||
      error.message === 'ID de cartera inválido'
    ) {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Error en getAnalisisCategorias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener análisis por categorías'
    });
  }
};

// 4. Obtener Métricas de Comportamiento
export const getMetricasComportamiento = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const userId = req.user.userId;
    const { periodo, carteraId, fechaReferencia } = req.query;

    // Validar periodo
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo as string)) {
      res.status(400).json({
        success: false,
        error: 'Periodo inválido'
      });
      return;
    }

    const fechaRef = fechaReferencia
      ? new Date(fechaReferencia as string)
      : new Date();
    const { inicio, fin } = calcularRangoFechas(
      periodo as 'anual' | 'mensual' | 'semanal',
      fechaRef
    );

    const filtroBase = await construirFiltroBase(
      userId,
      inicio,
      fin,
      carteraId as string | undefined
    );

    // Calcular días del periodo
    const diasPeriodo =
      Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Obtener transacciones
    const [ingresos, gastos] = await Promise.all([
      Ingreso.find(filtroBase).lean(),
      Gasto.find(filtroBase).lean()
    ]);

    const totalIngresos = ingresos.length;
    const totalGastos = gastos.length;
    const totalTransacciones = totalIngresos + totalGastos;
    const promedioDiario = diasPeriodo > 0 ? totalTransacciones / diasPeriodo : 0;

    // Calcular gasto promedio
    const totalMontoGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const gastoPromedioPorTransaccion =
      totalGastos > 0 ? totalMontoGastos / totalGastos : 0;
    const gastoPromedioPorDia = diasPeriodo > 0 ? totalMontoGastos / diasPeriodo : 0;

    // Calcular días activos
    const diasConGastos = new Set(
      gastos.map((g) => new Date(g.fecha).toISOString().split('T')[0])
    ).size;
    const diasConIngresos = new Set(
      ingresos.map((i) => new Date(i.fecha).toISOString().split('T')[0])
    ).size;
    const diasActivos = new Set([
      ...gastos.map((g) => new Date(g.fecha).toISOString().split('T')[0]),
      ...ingresos.map((i) => new Date(i.fecha).toISOString().split('T')[0])
    ]).size;
    const porcentajeActividad =
      diasPeriodo > 0 ? (diasActivos / diasPeriodo) * 100 : 0;

    // Calcular frecuencia de categorías
    const frecuenciaCategorias: { [key: string]: number } = {};
    gastos.forEach((gasto) => {
      const categoria = gasto.categoria;
      frecuenciaCategorias[categoria] = (frecuenciaCategorias[categoria] || 0) + 1;
    });

    const frecuenciaCategoriasArray = Object.entries(frecuenciaCategorias)
      .map(([categoria, frecuencia]) => ({
        categoria,
        frecuencia,
        porcentaje:
          totalGastos > 0 ? parseFloat(((frecuencia / totalGastos) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        periodo,
        transacciones: {
          total: totalTransacciones,
          ingresos: totalIngresos,
          gastos: totalGastos,
          promedioDiario: parseFloat(promedioDiario.toFixed(2))
        },
        gastoPromedio: {
          porTransaccion: parseFloat(gastoPromedioPorTransaccion.toFixed(2)),
          porDia: parseFloat(gastoPromedioPorDia.toFixed(2))
        },
        diasActivos: {
          total: diasActivos,
          conGastos: diasConGastos,
          conIngresos: diasConIngresos,
          porcentajeActividad: parseFloat(porcentajeActividad.toFixed(2))
        },
        frecuenciaCategorias: frecuenciaCategoriasArray
      }
    });
  } catch (error: any) {
    if (
      error.message === 'Cartera no encontrada o no pertenece al usuario' ||
      error.message === 'ID de cartera inválido'
    ) {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    console.error('Error en getMetricasComportamiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas de comportamiento'
    });
  }
};

