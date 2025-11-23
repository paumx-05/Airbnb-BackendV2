# Integración Backend: Endpoints de Estadísticas

## Objetivo
Este documento describe la implementación de los endpoints de estadísticas del backend, proporcionando análisis financieros detallados con soporte para diferentes periodos temporales (Anual, Mensual, Semanal) y filtrado por cartera.

---

## 🎯 Flujo del Sistema de Estadísticas

El sistema de estadísticas proporciona análisis financieros avanzados para visualizar el estado y tendencias de las finanzas del usuario:

1. **Resumen de Estadísticas** → Totales y métricas básicas por periodo
2. **Tendencias Temporales** → Comparativas y evolución en el tiempo
3. **Análisis por Categorías** → Distribución y ranking de categorías
4. **Métricas de Comportamiento** → Patrones de gasto e ingresos
5. **Indicadores de Salud Financiera** → Ratios y alertas proactivas

**Importante:** Los usuarios solo pueden acceder a sus propios datos. Todas las operaciones están protegidas por autenticación.

**Características especiales:**
- **Múltiples periodos**: Soporte para Anual, Mensual y Semanal
- **Filtrado por cartera**: Todos los endpoints soportan filtrado opcional por `carteraId`
- **Cálculos optimizados**: Uso de aggregation pipelines de MongoDB para rendimiento
- **Comparativas automáticas**: Comparación con periodos anteriores
- **Validación estricta**: Validación de parámetros y fechas

---

## 🏗️ Estructura del Backend (MVC)

### Modelos Involucrados

- `Ingreso` - Modelo de ingresos
- `Gasto` - Modelo de gastos
- `Cartera` - Modelo de carteras (para validación)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Estadísticas

### 1. Obtener Resumen de Estadísticas

**Endpoint:**
```
GET /api/estadisticas/resumen
```

**Descripción:** Obtiene un resumen completo de estadísticas financieras para un periodo específico (Anual, Mensual o Semanal).

**Query Parameters:**
- `periodo` (string, requerido): `'anual'` | `'mensual'` | `'semanal'`
- `carteraId` (string, opcional): ID de la cartera para filtrar los datos
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/resumen?periodo=mensual&carteraId=507f1f77bcf86cd799439011
GET /api/estadisticas/resumen?periodo=anual&fechaReferencia=2024-01-01
GET /api/estadisticas/resumen?periodo=semanal
```

**Lógica de Periodos:**

**Semanal:**
- Rango: Lunes a domingo de la semana que contiene `fechaReferencia`
- Si `fechaReferencia` es `2024-11-20` (miércoles), el rango es `2024-11-18` (lunes) a `2024-11-24` (domingo)

**Mensual:**
- Rango: Primer día a último día del mes que contiene `fechaReferencia`
- Si `fechaReferencia` es `2024-11-20`, el rango es `2024-11-01` a `2024-11-30`

**Anual:**
- Rango: 1 de enero a 31 de diciembre del año que contiene `fechaReferencia`
- Si `fechaReferencia` es `2024-11-20`, el rango es `2024-01-01` a `2024-12-31`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "fechaInicio": "2024-11-01T00:00:00.000Z",
    "fechaFin": "2024-11-30T23:59:59.999Z",
    "ingresos": {
      "total": 2500.00,
      "promedioDiario": 83.33,
      "cantidad": 15
    },
    "gastos": {
      "total": 1800.50,
      "promedioDiario": 60.02,
      "cantidad": 42
    },
    "balance": {
      "total": 699.50,
      "promedioDiario": 23.32
    },
    "tasaAhorro": 27.98,
    "ratioGastosIngresos": 72.02
  }
}
```

**Campos de respuesta:**
- `periodo`: Periodo solicitado (`'anual'` | `'mensual'` | `'semanal'`)
- `fechaInicio`: Fecha de inicio del periodo (ISO string)
- `fechaFin`: Fecha de fin del periodo (ISO string)
- `ingresos`:
  - `total`: Total de ingresos en el periodo
  - `promedioDiario`: Promedio diario de ingresos
  - `cantidad`: Número de transacciones de ingresos
- `gastos`:
  - `total`: Total de gastos en el periodo
  - `promedioDiario`: Promedio diario de gastos
  - `cantidad`: Número de transacciones de gastos
- `balance`:
  - `total`: Balance neto (ingresos - gastos)
  - `promedioDiario`: Promedio diario de balance
- `tasaAhorro`: Porcentaje de ahorro ((balance / ingresos) * 100)
- `ratioGastosIngresos`: Porcentaje de gastos sobre ingresos ((gastos / ingresos) * 100)

**Errores posibles:**
- `400`: Parámetro `periodo` inválido o faltante
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario (si se proporciona `carteraId`)
- `500`: Error del servidor

**Implementación sugerida (Mongoose):**
```javascript
const { ObjectId } = require('mongoose').Types;

// Función auxiliar para calcular rango de fechas
function calcularRangoFechas(periodo, fechaReferencia = new Date()) {
  const fecha = new Date(fechaReferencia);
  let inicio, fin;
  
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
  } else if (periodo === 'anual') {
    inicio = new Date(fecha.getFullYear(), 0, 1);
    inicio.setHours(0, 0, 0, 0);
    
    fin = new Date(fecha.getFullYear(), 11, 31);
    fin.setHours(23, 59, 59, 999);
  } else {
    throw new Error('Periodo inválido');
  }
  
  return { inicio, fin };
}

// Controller
exports.getResumenEstadisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodo, carteraId, fechaReferencia } = req.query;
    
    // Validar periodo
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        error: 'Periodo inválido. Debe ser: anual, mensual o semanal'
      });
    }
    
    // Validar y convertir fechaReferencia
    const fechaRef = fechaReferencia ? new Date(fechaReferencia) : new Date();
    if (isNaN(fechaRef.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Fecha de referencia inválida'
      });
    }
    
    // Calcular rango de fechas
    const { inicio, fin } = calcularRangoFechas(periodo, fechaRef);
    
    // Construir filtro base
    const filtroBase = {
      userId: new ObjectId(userId),
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    };
    
    // Validar y agregar filtro de cartera si se proporciona
    if (carteraId) {
      const cartera = await Cartera.findOne({
        _id: new ObjectId(carteraId),
        userId: new ObjectId(userId)
      });
      
      if (!cartera) {
        return res.status(404).json({
          success: false,
          error: 'Cartera no encontrada o no pertenece al usuario'
        });
      }
      
      filtroBase.carteraId = new ObjectId(carteraId);
    } else {
      filtroBase.carteraId = null;
    }
    
    // Calcular días del periodo
    const diasPeriodo = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
    
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
    
    const promedioDiarioIngresos = diasPeriodo > 0 ? totalIngresos / diasPeriodo : 0;
    const promedioDiarioGastos = diasPeriodo > 0 ? totalGastos / diasPeriodo : 0;
    const promedioDiarioBalance = diasPeriodo > 0 ? balance / diasPeriodo : 0;
    
    const tasaAhorro = totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0;
    const ratioGastosIngresos = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
    
    res.json({
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
  } catch (error) {
    console.error('Error en getResumenEstadisticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de estadísticas'
    });
  }
};
```

---

### 2. Obtener Tendencias Temporales

**Endpoint:**
```
GET /api/estadisticas/tendencias
```

**Descripción:** Obtiene datos de tendencias temporales con comparativa con el periodo anterior.

**Query Parameters:**
- `periodo` (string, requerido): `'anual'` | `'mensual'` | `'semanal'`
- `carteraId` (string, opcional): ID de la cartera para filtrar
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/tendencias?periodo=mensual
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "periodoActual": {
      "fechaInicio": "2024-11-01T00:00:00.000Z",
      "fechaFin": "2024-11-30T23:59:59.999Z",
      "ingresos": 2500.00,
      "gastos": 1800.50,
      "balance": 699.50
    },
    "periodoAnterior": {
      "fechaInicio": "2024-10-01T00:00:00.000Z",
      "fechaFin": "2024-10-31T23:59:59.999Z",
      "ingresos": 2300.00,
      "gastos": 1950.00,
      "balance": 350.00
    },
    "cambios": {
      "ingresos": {
        "valor": 200.00,
        "porcentaje": 8.70,
        "tipo": "aumento"
      },
      "gastos": {
        "valor": -149.50,
        "porcentaje": -7.67,
        "tipo": "disminucion"
      },
      "balance": {
        "valor": 349.50,
        "porcentaje": 99.86,
        "tipo": "aumento"
      }
    },
    "datosGrafico": [
      {
        "fecha": "2024-11-01",
        "ingresos": 0,
        "gastos": 0
      },
      {
        "fecha": "2024-11-05",
        "ingresos": 500,
        "gastos": 300
      }
    ]
  }
}
```

**Campos de respuesta:**
- `periodoActual`: Datos del periodo actual
- `periodoAnterior`: Datos del periodo anterior (calculado automáticamente)
- `cambios`: Comparativa entre periodos
  - `valor`: Diferencia absoluta
  - `porcentaje`: Cambio porcentual
  - `tipo`: `'aumento'` | `'disminucion'`
- `datosGrafico`: Array de puntos para gráfico de líneas (agrupado por día/semana/mes según periodo)

**Implementación sugerida:**
```javascript
exports.getTendenciasTemporales = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodo, carteraId, fechaReferencia } = req.query;
    
    // Validar periodo
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        error: 'Periodo inválido'
      });
    }
    
    const fechaRef = fechaReferencia ? new Date(fechaReferencia) : new Date();
    const { inicio, fin } = calcularRangoFechas(periodo, fechaRef);
    
    // Calcular periodo anterior
    let inicioAnterior, finAnterior;
    if (periodo === 'semanal') {
      inicioAnterior = new Date(inicio);
      inicioAnterior.setDate(inicioAnterior.getDate() - 7);
      finAnterior = new Date(fin);
      finAnterior.setDate(finAnterior.getDate() - 7);
    } else if (periodo === 'mensual') {
      inicioAnterior = new Date(inicio.getFullYear(), inicio.getMonth() - 1, 1);
      finAnterior = new Date(inicio.getFullYear(), inicio.getMonth(), 0);
      finAnterior.setHours(23, 59, 59, 999);
    } else { // anual
      inicioAnterior = new Date(inicio.getFullYear() - 1, 0, 1);
      finAnterior = new Date(inicio.getFullYear() - 1, 11, 31);
      finAnterior.setHours(23, 59, 59, 999);
    }
    
    // Construir filtros
    const filtroBase = {
      userId: new ObjectId(userId),
      ...(carteraId ? { carteraId: new ObjectId(carteraId) } : { carteraId: null })
    };
    
    // Obtener datos del periodo actual
    const [ingresosActual, gastosActual] = await Promise.all([
      Ingreso.aggregate([
        { $match: { ...filtroBase, fecha: { $gte: inicio, $lte: fin } } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Gasto.aggregate([
        { $match: { ...filtroBase, fecha: { $gte: inicio, $lte: fin } } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ])
    ]);
    
    // Obtener datos del periodo anterior
    const [ingresosAnterior, gastosAnterior] = await Promise.all([
      Ingreso.aggregate([
        { $match: { ...filtroBase, fecha: { $gte: inicioAnterior, $lte: finAnterior } } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]),
      Gasto.aggregate([
        { $match: { ...filtroBase, fecha: { $gte: inicioAnterior, $lte: finAnterior } } },
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
    
    const porcentajeIngresos = ingresosAnteriorTotal > 0 
      ? (cambioIngresos / ingresosAnteriorTotal) * 100 
      : (ingresosActualTotal > 0 ? 100 : 0);
    
    const porcentajeGastos = gastosAnteriorTotal > 0 
      ? (cambioGastos / gastosAnteriorTotal) * 100 
      : (gastosAnteriorTotal > 0 ? -100 : 0);
    
    const porcentajeBalance = balanceAnterior !== 0 
      ? (cambioBalance / Math.abs(balanceAnterior)) * 100 
      : (balanceActual !== 0 ? 100 : 0);
    
    // Generar datos para gráfico (agrupado por día/semana/mes)
    const datosGrafico = await generarDatosGrafico(periodo, inicio, fin, filtroBase);
    
    res.json({
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
  } catch (error) {
    console.error('Error en getTendenciasTemporales:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tendencias temporales'
    });
  }
};

// Función auxiliar para generar datos del gráfico
async function generarDatosGrafico(periodo, inicio, fin, filtroBase) {
  let groupBy;
  
  if (periodo === 'semanal') {
    groupBy = { $dayOfMonth: '$fecha' };
  } else if (periodo === 'mensual') {
    groupBy = { $dayOfMonth: '$fecha' };
  } else { // anual
    groupBy = { $month: '$fecha' };
  }
  
  const [ingresosData, gastosData] = await Promise.all([
    Ingreso.aggregate([
      { $match: { ...filtroBase, fecha: { $gte: inicio, $lte: fin } } },
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
      { $match: { ...filtroBase, fecha: { $gte: inicio, $lte: fin } } },
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
  const datosMap = new Map();
  
  ingresosData.forEach(item => {
    const fecha = new Date(item.fecha).toISOString().split('T')[0];
    if (!datosMap.has(fecha)) {
      datosMap.set(fecha, { fecha, ingresos: 0, gastos: 0 });
    }
    datosMap.get(fecha).ingresos = item.total;
  });
  
  gastosData.forEach(item => {
    const fecha = new Date(item.fecha).toISOString().split('T')[0];
    if (!datosMap.has(fecha)) {
      datosMap.set(fecha, { fecha, ingresos: 0, gastos: 0 });
    }
    datosMap.get(fecha).gastos = item.total;
  });
  
  return Array.from(datosMap.values()).sort((a, b) => 
    new Date(a.fecha) - new Date(b.fecha)
  );
}
```

---

### 3. Obtener Análisis por Categorías

**Endpoint:**
```
GET /api/estadisticas/categorias
```

**Descripción:** Obtiene análisis detallado de gastos e ingresos agrupados por categorías.

**Query Parameters:**
- `periodo` (string, requerido): `'anual'` | `'mensual'` | `'semanal'`
- `carteraId` (string, opcional): ID de la cartera
- `fechaReferencia` (string, opcional): Fecha de referencia
- `tipo` (string, opcional): `'gastos'` | `'ingresos'` | `'ambos'` (default: `'ambos'`)
- `limite` (number, opcional): Número máximo de categorías a retornar (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/categorias?periodo=mensual&tipo=gastos&limite=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "categoriasGastos": [
      {
        "categoria": "Alimentación",
        "monto": 650.00,
        "porcentaje": 36.11,
        "cantidad": 18,
        "promedio": 36.11,
        "tendencia": "aumento"
      },
      {
        "categoria": "Transporte",
        "monto": 450.50,
        "porcentaje": 25.03,
        "cantidad": 12,
        "promedio": 37.54,
        "tendencia": "disminucion"
      }
    ],
    "categoriasIngresos": [
      {
        "categoria": "Salario",
        "monto": 2000.00,
        "porcentaje": 80.00,
        "cantidad": 1,
        "promedio": 2000.00,
        "tendencia": "estable"
      }
    ],
    "totalGastos": 1800.50,
    "totalIngresos": 2500.00
  }
}
```

**Implementación sugerida:**
```javascript
exports.getAnalisisCategorias = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodo, carteraId, fechaReferencia, tipo = 'ambos', limite = 10 } = req.query;
    
    // Validaciones
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        error: 'Periodo inválido'
      });
    }
    
    if (!['gastos', 'ingresos', 'ambos'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
    }
    
    const fechaRef = fechaReferencia ? new Date(fechaReferencia) : new Date();
    const { inicio, fin } = calcularRangoFechas(periodo, fechaRef);
    
    const filtroBase = {
      userId: new ObjectId(userId),
      fecha: { $gte: inicio, $lte: fin },
      ...(carteraId ? { carteraId: new ObjectId(carteraId) } : { carteraId: null })
    };
    
    const resultados = {
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
        { $limit: parseInt(limite) }
      ]);
      
      const totalGastos = await Gasto.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]);
      
      resultados.totalGastos = totalGastos[0]?.total || 0;
      
      resultados.categoriasGastos = gastosPorCategoria.map(item => ({
        categoria: item._id,
        monto: parseFloat(item.monto.toFixed(2)),
        porcentaje: resultados.totalGastos > 0 
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
        { $limit: parseInt(limite) }
      ]);
      
      const totalIngresos = await Ingreso.aggregate([
        { $match: filtroBase },
        { $group: { _id: null, total: { $sum: '$monto' } } }
      ]);
      
      resultados.totalIngresos = totalIngresos[0]?.total || 0;
      
      resultados.categoriasIngresos = ingresosPorCategoria.map(item => ({
        categoria: item._id,
        monto: parseFloat(item.monto.toFixed(2)),
        porcentaje: resultados.totalIngresos > 0
          ? parseFloat(((item.monto / resultados.totalIngresos) * 100).toFixed(2))
          : 0,
        cantidad: item.cantidad,
        promedio: parseFloat((item.monto / item.cantidad).toFixed(2)),
        tendencia: 'estable' // TODO: Implementar comparativa con periodo anterior
      }));
    }
    
    res.json({
      success: true,
      data: {
        periodo,
        ...resultados
      }
    });
  } catch (error) {
    console.error('Error en getAnalisisCategorias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener análisis por categorías'
    });
  }
};
```

---

### 4. Obtener Métricas de Comportamiento

**Endpoint:**
```
GET /api/estadisticas/comportamiento
```

**Descripción:** Obtiene métricas sobre patrones de comportamiento financiero.

**Query Parameters:**
- `periodo` (string, requerido): `'anual'` | `'mensual'` | `'semanal'`
- `carteraId` (string, opcional): ID de la cartera
- `fechaReferencia` (string, opcional): Fecha de referencia

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "transacciones": {
      "total": 57,
      "ingresos": 15,
      "gastos": 42,
      "promedioDiario": 1.9
    },
    "gastoPromedio": {
      "porTransaccion": 42.87,
      "porDia": 60.02
    },
    "diasActivos": {
      "total": 25,
      "conGastos": 20,
      "conIngresos": 5,
      "porcentajeActividad": 83.33
    },
    "frecuenciaCategorias": [
      {
        "categoria": "Alimentación",
        "frecuencia": 18,
        "porcentaje": 42.86
      }
    ]
  }
}
```

---

## 🔧 Estructura de Rutas (Express)

```javascript
// routes/estadisticas.routes.js
const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticas.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/resumen', estadisticasController.getResumenEstadisticas);
router.get('/tendencias', estadisticasController.getTendenciasTemporales);
router.get('/categorias', estadisticasController.getAnalisisCategorias);
router.get('/comportamiento', estadisticasController.getMetricasComportamiento);

module.exports = router;
```

```javascript
// app.js o server.js
const estadisticasRoutes = require('./routes/estadisticas.routes');
app.use('/api/estadisticas', estadisticasRoutes);
```

---

## 📝 Notas de Implementación

### Validación de Cartera

**IMPORTANTE:** Siempre validar que la cartera pertenece al usuario antes de filtrar:

```javascript
if (carteraId) {
  const cartera = await Cartera.findOne({
    _id: new ObjectId(carteraId),
    userId: new ObjectId(userId)
  });
  
  if (!cartera) {
    return res.status(404).json({
      success: false,
      error: 'Cartera no encontrada o no pertenece al usuario'
    });
  }
  
  filtroBase.carteraId = new ObjectId(carteraId);
} else {
  filtroBase.carteraId = null; // Solo datos sin cartera
}
```

### Optimización de Consultas

1. **Índices recomendados:**
   ```javascript
   // En los modelos Ingreso y Gasto
   schema.index({ userId: 1, fecha: 1, carteraId: 1 });
   schema.index({ userId: 1, categoria: 1, fecha: 1 });
   ```

2. **Uso de aggregation pipelines:** Siempre usar `aggregate()` en lugar de múltiples `find()` para mejor rendimiento.

3. **Paralelización:** Usar `Promise.all()` para consultas independientes.

### Manejo de Fechas

- Siempre trabajar con fechas en UTC
- Usar `setHours(0, 0, 0, 0)` para inicio del día
- Usar `setHours(23, 59, 59, 999)` para fin del día
- Validar que las fechas sean válidas antes de usar

### Errores Comunes a Evitar

1. ❌ No validar que `carteraId` pertenece al usuario
2. ❌ No filtrar correctamente cuando `carteraId` es `null` (debe ser igualdad estricta)
3. ❌ No calcular correctamente los rangos de fechas para periodos anteriores
4. ❌ No manejar casos donde no hay datos (divisiones por cero)
5. ❌ No redondear correctamente los valores numéricos

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Resumen mensual sin cartera
```
GET /api/estadisticas/resumen?periodo=mensual
```
**Verificar:** Datos solo de registros con `carteraId = null`

### Test 2: Resumen semanal con cartera
```
GET /api/estadisticas/resumen?periodo=semanal&carteraId=507f1f77bcf86cd799439011
```
**Verificar:** Datos solo de la cartera especificada

### Test 3: Tendencias con periodo anterior
```
GET /api/estadisticas/tendencias?periodo=mensual
```
**Verificar:** Comparativa correcta entre mes actual y mes anterior

### Test 4: Análisis de categorías limitado
```
GET /api/estadisticas/categorias?periodo=anual&limite=5&tipo=gastos
```
**Verificar:** Solo top 5 categorías de gastos

### Test 5: Validación de cartera inválida
```
GET /api/estadisticas/resumen?periodo=mensual&carteraId=invalid
```
**Verificar:** Error 404 con mensaje apropiado

---

## 📞 Contacto

Si hay dudas sobre la implementación, revisar:
- `Doc_backend/dashboard-integracion.md` - Estructura similar de dashboard
- `Doc_backend/carteras-integracion.md` - Manejo de carteras
- Modelos: `Ingreso`, `Gasto`, `Cartera`

---

**Última actualización:** 2024-11-22
**Prioridad:** 🟢 ALTA - Nueva funcionalidad crítica para análisis financiero

