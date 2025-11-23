# Integración Backend: Subcategorías en Estadísticas

## 📋 Objetivo

Este documento describe cómo implementar el soporte de **subcategorías** en el endpoint de estadísticas `GET /api/estadisticas/categorias`, permitiendo que el backend calcule y devuelva análisis detallado de gastos e ingresos agrupados por categorías principales y sus subcategorías.

---

## 🎯 Contexto

Actualmente, el endpoint `/api/estadisticas/categorias` devuelve análisis agrupados solo por categorías principales. Con esta integración, el backend debe:

1. **Calcular estadísticas por subcategoría** dentro de cada categoría principal
2. **Incluir subcategorías en la respuesta** del endpoint de estadísticas
3. **Mantener retrocompatibilidad** con clientes que no esperan subcategorías
4. **Optimizar el rendimiento** usando aggregation pipelines de MongoDB

---

## 📊 Estructura de Datos Esperada

### Request (sin cambios)

El endpoint mantiene los mismos parámetros de query:

```
GET /api/estadisticas/categorias?periodo=mensual&tipo=gastos&limite=10&carteraId=xxx
```

### Response (modificado)

**Antes:**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "categoriasGastos": [
      {
        "categoria": "Ropa",
        "monto": 150.00,
        "porcentaje": 15.00,
        "cantidad": 5,
        "promedio": 30.00,
        "tendencia": "estable"
      }
    ],
    "totalGastos": 1000.00,
    "totalIngresos": 2500.00
  }
}
```

**Después (con subcategorías):**
```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "categoriasGastos": [
      {
        "categoria": "Ropa",
        "monto": 150.00,
        "porcentaje": 15.00,
        "cantidad": 5,
        "promedio": 30.00,
        "tendencia": "estable",
        "subcategorias": [
          {
            "nombre": "Calzado",
            "monto": 100.00,
            "porcentaje": 66.67,
            "cantidad": 3,
            "promedio": 33.33
          },
          {
            "nombre": "Prendas",
            "monto": 50.00,
            "porcentaje": 33.33,
            "cantidad": 2,
            "promedio": 25.00
          }
        ]
      }
    ],
    "totalGastos": 1000.00,
    "totalIngresos": 2500.00
  }
}
```

### Campos de Subcategoría

Cada objeto en el array `subcategorias` debe incluir:

- **`nombre`** (string, requerido): Nombre de la subcategoría
- **`monto`** (number, requerido): Suma total de gastos/ingresos en esta subcategoría
- **`porcentaje`** (number, requerido): Porcentaje del monto de la subcategoría respecto al **total de la categoría principal** (no del total general)
- **`cantidad`** (number, requerido): Número de transacciones en esta subcategoría
- **`promedio`** (number, requerido): Promedio por transacción (monto / cantidad)

**Nota importante sobre porcentajes:**
- El `porcentaje` de la subcategoría debe ser relativo al monto total de su categoría principal
- Ejemplo: Si "Ropa" tiene 150€ y "Calzado" tiene 100€, el porcentaje de "Calzado" es `(100 / 150) * 100 = 66.67%`
- El `porcentaje` de la categoría principal sigue siendo relativo al total general

---

## 🏗️ Implementación Backend

### 1. Modelos Requeridos

Asegúrate de que los modelos `Gasto` e `Ingreso` tengan el campo `subcategoria`:

```javascript
// models/Gasto.js
const gastoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
  categoria: { type: String, required: true },
  subcategoria: { type: String, default: null }, // Campo de subcategoría
  mes: { type: String, required: true },
  carteraId: { type: mongoose.Schema.Types.ObjectId, default: null },
  dividido: [{
    amigoId: { type: String, required: true },
    amigoNombre: { type: String, required: true },
    montoDividido: { type: Number, required: true },
    pagado: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});
```

### 2. Modificación del Controlador

**Archivo:** `controllers/estadisticas.controller.js`

```javascript
const { ObjectId } = require('mongoose').Types;
const Gasto = require('../models/Gasto');
const Ingreso = require('../models/Ingreso');
const Categoria = require('../models/Categoria');

/**
 * Calcula el rango de fechas según el periodo
 */
function calcularRangoFechas(periodo, fechaReferencia) {
  const fecha = fechaReferencia ? new Date(fechaReferencia) : new Date();
  let inicio, fin;

  switch (periodo) {
    case 'semanal':
      // Lunes a domingo de la semana
      const diaSemana = fecha.getDay();
      const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
      inicio = new Date(fecha);
      inicio.setDate(fecha.getDate() + diferenciaLunes);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      break;

    case 'mensual':
      inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;

    case 'anual':
      inicio = new Date(fecha.getFullYear(), 0, 1);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(fecha.getFullYear(), 11, 31);
      fin.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error('Periodo inválido');
  }

  return { inicio, fin };
}

/**
 * Obtiene análisis por categorías con subcategorías
 */
exports.getAnalisisCategorias = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodo, carteraId, fechaReferencia, tipo = 'ambos', limite = 10 } = req.query;

    // Validaciones
    if (!periodo || !['anual', 'mensual', 'semanal'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        error: 'Periodo inválido. Debe ser: anual, mensual o semanal'
      });
    }

    if (!['gastos', 'ingresos', 'ambos'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
    }

    // Calcular rango de fechas
    const { inicio, fin } = calcularRangoFechas(periodo, fechaReferencia);

    // Construir filtro base
    const filtroBase = {
      userId: new ObjectId(userId),
      fecha: { $gte: inicio, $lte: fin }
    };

    // Agregar filtro de cartera si se proporciona
    if (carteraId) {
      // Validar que la cartera pertenece al usuario
      const cartera = await Cartera.findOne({
        _id: new ObjectId(carteraId),
        userId: new ObjectId(userId)
      });

      if (!cartera) {
        return res.status(404).json({
          success: false,
          error: 'Cartera no encontrada'
        });
      }

      filtroBase.carteraId = new ObjectId(carteraId);
    } else {
      // Si no se proporciona carteraId, filtrar por carteraId null
      filtroBase.carteraId = null;
    }

    const resultados = {
      categoriasGastos: [],
      categoriasIngresos: [],
      totalGastos: 0,
      totalIngresos: 0
    };

    // ============================================
    // PROCESAR GASTOS CON SUBCATEGORÍAS
    // ============================================
    if (tipo === 'gastos' || tipo === 'ambos') {
      // 1. Obtener total de gastos
      const totalGastosResult = await Gasto.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: null,
            total: { $sum: '$monto' }
          }
        }
      ]);

      resultados.totalGastos = totalGastosResult[0]?.total || 0;

      // 2. Obtener gastos agrupados por categoría (sin subcategorías aún)
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

      // 3. Para cada categoría, obtener sus subcategorías
      const categoriasGastosConSubcategorias = await Promise.all(
        gastosPorCategoria.map(async (categoriaItem) => {
          const categoriaNombre = categoriaItem._id;
          const montoCategoria = categoriaItem.monto;

          // Obtener subcategorías de esta categoría
          const subcategoriasAgrupadas = await Gasto.aggregate([
            {
              $match: {
                ...filtroBase,
                categoria: categoriaNombre,
                subcategoria: { $ne: null, $exists: true } // Solo gastos con subcategoría
              }
            },
            {
              $group: {
                _id: '$subcategoria',
                monto: { $sum: '$monto' },
                cantidad: { $sum: 1 }
              }
            },
            { $sort: { monto: -1 } }
          ]);

          // Formatear subcategorías
          const subcategorias = subcategoriasAgrupadas.map(sub => {
            const montoSub = sub.monto;
            const cantidadSub = sub.cantidad;
            const promedioSub = cantidadSub > 0 ? montoSub / cantidadSub : 0;
            
            // Porcentaje relativo al monto de la categoría principal
            const porcentajeSub = montoCategoria > 0 
              ? (montoSub / montoCategoria) * 100 
              : 0;

            return {
              nombre: sub._id,
              monto: parseFloat(montoSub.toFixed(2)),
              porcentaje: parseFloat(porcentajeSub.toFixed(2)),
              cantidad: cantidadSub,
              promedio: parseFloat(promedioSub.toFixed(2))
            };
          });

          // Calcular porcentaje de la categoría respecto al total
          const porcentajeCategoria = resultados.totalGastos > 0
            ? (montoCategoria / resultados.totalGastos) * 100
            : 0;

          return {
            categoria: categoriaNombre,
            monto: parseFloat(montoCategoria.toFixed(2)),
            porcentaje: parseFloat(porcentajeCategoria.toFixed(2)),
            cantidad: categoriaItem.cantidad,
            promedio: parseFloat((montoCategoria / categoriaItem.cantidad).toFixed(2)),
            tendencia: 'estable', // TODO: Implementar comparativa con periodo anterior
            subcategorias: subcategorias.length > 0 ? subcategorias : undefined // Opcional: solo incluir si hay subcategorías
          };
        })
      );

      resultados.categoriasGastos = categoriasGastosConSubcategorias;
    }

    // ============================================
    // PROCESAR INGRESOS CON SUBCATEGORÍAS
    // ============================================
    if (tipo === 'ingresos' || tipo === 'ambos') {
      // 1. Obtener total de ingresos
      const totalIngresosResult = await Ingreso.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: null,
            total: { $sum: '$monto' }
          }
        }
      ]);

      resultados.totalIngresos = totalIngresosResult[0]?.total || 0;

      // 2. Obtener ingresos agrupados por categoría
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

      // 3. Para cada categoría, obtener sus subcategorías
      const categoriasIngresosConSubcategorias = await Promise.all(
        ingresosPorCategoria.map(async (categoriaItem) => {
          const categoriaNombre = categoriaItem._id;
          const montoCategoria = categoriaItem.monto;

          // Obtener subcategorías de esta categoría
          const subcategoriasAgrupadas = await Ingreso.aggregate([
            {
              $match: {
                ...filtroBase,
                categoria: categoriaNombre,
                subcategoria: { $ne: null, $exists: true }
              }
            },
            {
              $group: {
                _id: '$subcategoria',
                monto: { $sum: '$monto' },
                cantidad: { $sum: 1 }
              }
            },
            { $sort: { monto: -1 } }
          ]);

          // Formatear subcategorías
          const subcategorias = subcategoriasAgrupadas.map(sub => {
            const montoSub = sub.monto;
            const cantidadSub = sub.cantidad;
            const promedioSub = cantidadSub > 0 ? montoSub / cantidadSub : 0;
            
            // Porcentaje relativo al monto de la categoría principal
            const porcentajeSub = montoCategoria > 0 
              ? (montoSub / montoCategoria) * 100 
              : 0;

            return {
              nombre: sub._id,
              monto: parseFloat(montoSub.toFixed(2)),
              porcentaje: parseFloat(porcentajeSub.toFixed(2)),
              cantidad: cantidadSub,
              promedio: parseFloat(promedioSub.toFixed(2))
            };
          });

          // Calcular porcentaje de la categoría respecto al total
          const porcentajeCategoria = resultados.totalIngresos > 0
            ? (montoCategoria / resultados.totalIngresos) * 100
            : 0;

          return {
            categoria: categoriaNombre,
            monto: parseFloat(montoCategoria.toFixed(2)),
            porcentaje: parseFloat(porcentajeCategoria.toFixed(2)),
            cantidad: categoriaItem.cantidad,
            promedio: parseFloat((montoCategoria / categoriaItem.cantidad).toFixed(2)),
            tendencia: 'estable',
            subcategorias: subcategorias.length > 0 ? subcategorias : undefined
          };
        })
      );

      resultados.categoriasIngresos = categoriasIngresosConSubcategorias;
    }

    // Respuesta final
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
      error: 'Error al obtener análisis por categorías',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

### 3. Optimización con Un Solo Pipeline (Alternativa)

Si prefieres una implementación más eficiente con un solo pipeline de aggregation:

```javascript
// Versión optimizada con un solo pipeline
if (tipo === 'gastos' || tipo === 'ambos') {
  // Pipeline único que agrupa por categoría y subcategoría
  const pipeline = [
    { $match: filtroBase },
    {
      $group: {
        _id: {
          categoria: '$categoria',
          subcategoria: { $ifNull: ['$subcategoria', null] }
        },
        monto: { $sum: '$monto' },
        cantidad: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.categoria',
        montoTotal: { $sum: '$monto' },
        cantidadTotal: { $sum: '$cantidad' },
        subcategorias: {
          $push: {
            $cond: [
              { $ne: ['$_id.subcategoria', null] },
              {
                nombre: '$_id.subcategoria',
                monto: '$monto',
                cantidad: '$cantidad'
              },
              '$$REMOVE'
            ]
          }
        }
      }
    },
    { $sort: { montoTotal: -1 } },
    { $limit: parseInt(limite) }
  ];

  const categoriasAgrupadas = await Gasto.aggregate(pipeline);

  // Calcular total de gastos
  const totalGastosResult = await Gasto.aggregate([
    { $match: filtroBase },
    {
      $group: {
        _id: null,
        total: { $sum: '$monto' }
      }
    }
  ]);

  resultados.totalGastos = totalGastosResult[0]?.total || 0;

  // Formatear resultados
  resultados.categoriasGastos = categoriasAgrupadas.map(cat => {
    const montoCategoria = cat.montoTotal;
    const porcentajeCategoria = resultados.totalGastos > 0
      ? (montoCategoria / resultados.totalGastos) * 100
      : 0;

    // Procesar subcategorías
    const subcategorias = (cat.subcategorias || [])
      .filter(sub => sub !== null)
      .map(sub => {
        const porcentajeSub = montoCategoria > 0
          ? (sub.monto / montoCategoria) * 100
          : 0;

        return {
          nombre: sub.nombre,
          monto: parseFloat(sub.monto.toFixed(2)),
          porcentaje: parseFloat(porcentajeSub.toFixed(2)),
          cantidad: sub.cantidad,
          promedio: parseFloat((sub.monto / sub.cantidad).toFixed(2))
        };
      })
      .sort((a, b) => b.monto - a.monto); // Ordenar por monto descendente

    return {
      categoria: cat._id,
      monto: parseFloat(montoCategoria.toFixed(2)),
      porcentaje: parseFloat(porcentajeCategoria.toFixed(2)),
      cantidad: cat.cantidadTotal,
      promedio: parseFloat((montoCategoria / cat.cantidadTotal).toFixed(2)),
      tendencia: 'estable',
      subcategorias: subcategorias.length > 0 ? subcategorias : undefined
    };
  });
}
```

---

## 🔍 Validaciones Importantes

### 1. Validar Campo `subcategoria`

El campo `subcategoria` puede ser:
- `null` (cuando no hay subcategoría)
- `undefined` (en documentos antiguos)
- `string` (nombre de la subcategoría)
- `""` (string vacío, debe tratarse como `null`)

**Filtro recomendado:**
```javascript
subcategoria: { 
  $ne: null, 
  $exists: true,
  $not: { $eq: "" } // Excluir strings vacíos
}
```

O más simple:
```javascript
{
  $match: {
    ...filtroBase,
    categoria: categoriaNombre,
    subcategoria: { $exists: true, $ne: null, $ne: "" }
  }
}
```

### 2. Manejo de Case-Insensitive

Si las categorías pueden tener diferentes mayúsculas/minúsculas, normaliza antes de agrupar:

```javascript
{
  $group: {
    _id: {
      categoria: { $toLower: '$categoria' },
      subcategoria: { 
        $cond: [
          { $ne: ['$subcategoria', null] },
          { $toLower: '$subcategoria' },
          null
        ]
      }
    },
    // ...
  }
}
```

### 3. Retrocompatibilidad

El campo `subcategorias` es **opcional** en la respuesta. Los clientes antiguos que no esperan subcategorías seguirán funcionando:

```javascript
subcategorias: subcategorias.length > 0 ? subcategorias : undefined
```

Si prefieres siempre incluir el array (aunque esté vacío):
```javascript
subcategorias: subcategorias // Siempre incluir, puede ser array vacío []
```

---

## 📝 Ejemplo de Respuesta Completa

```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "categoriasGastos": [
      {
        "categoria": "Ropa",
        "monto": 150.00,
        "porcentaje": 15.00,
        "cantidad": 5,
        "promedio": 30.00,
        "tendencia": "estable",
        "subcategorias": [
          {
            "nombre": "Calzado",
            "monto": 100.00,
            "porcentaje": 66.67,
            "cantidad": 3,
            "promedio": 33.33
          },
          {
            "nombre": "Prendas",
            "monto": 50.00,
            "porcentaje": 33.33,
            "cantidad": 2,
            "promedio": 25.00
          }
        ]
      },
      {
        "categoria": "Alimentación",
        "monto": 300.00,
        "porcentaje": 30.00,
        "cantidad": 12,
        "promedio": 25.00,
        "tendencia": "aumento"
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
    "totalGastos": 1000.00,
    "totalIngresos": 2500.00
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Verificar que los modelos `Gasto` e `Ingreso` tengan el campo `subcategoria`
- [ ] Modificar el controlador `getAnalisisCategorias` para incluir subcategorías
- [ ] Implementar aggregation pipeline para agrupar por categoría y subcategoría
- [ ] Calcular porcentajes correctamente (subcategoría relativo a categoría principal)
- [ ] Validar que el campo `subcategoria` maneje `null`, `undefined` y strings vacíos
- [ ] Incluir `subcategorias` como campo opcional en la respuesta
- [ ] Probar con categorías que tienen subcategorías
- [ ] Probar con categorías que NO tienen subcategorías
- [ ] Probar con gastos/ingresos que tienen `subcategoria: null`
- [ ] Verificar que los porcentajes sumen correctamente
- [ ] Optimizar queries con índices si es necesario
- [ ] Agregar logging para debugging
- [ ] Documentar cambios en el código

---

## 🧪 Casos de Prueba

### Test 1: Categoría con subcategorías
**Setup:**
- Crear gastos en categoría "Ropa" con subcategorías "Calzado" (100€) y "Prendas" (50€)

**Expected:**
- La categoría "Ropa" debe tener `monto: 150.00`
- Debe incluir array `subcategorias` con 2 elementos
- "Calzado" debe tener `porcentaje: 66.67` (100/150 * 100)
- "Prendas" debe tener `porcentaje: 33.33` (50/150 * 100)

### Test 2: Categoría sin subcategorías
**Setup:**
- Crear gastos en categoría "Alimentación" sin subcategorías

**Expected:**
- La categoría "Alimentación" debe tener `monto` correcto
- El campo `subcategorias` debe ser `undefined` o array vacío `[]`

### Test 3: Gastos con subcategoria null
**Setup:**
- Crear gastos en categoría "Transporte" con `subcategoria: null`

**Expected:**
- La categoría "Transporte" debe aparecer normalmente
- No debe incluir subcategorías con nombre `null`

### Test 4: Filtrado por cartera
**Setup:**
- Crear gastos con subcategorías en diferentes carteras

**Expected:**
- Al filtrar por `carteraId`, solo deben aparecer subcategorías de esa cartera

### Test 5: Periodo temporal
**Setup:**
- Crear gastos con subcategorías en diferentes meses

**Expected:**
- Al filtrar por periodo "mensual", solo deben aparecer subcategorías del mes correspondiente

---

## 🚀 Optimizaciones Recomendadas

### 1. Índices de MongoDB

Crear índices para mejorar el rendimiento:

```javascript
// En el modelo Gasto
gastoSchema.index({ userId: 1, fecha: 1, categoria: 1, subcategoria: 1 });
gastoSchema.index({ userId: 1, fecha: 1, carteraId: 1 });

// En el modelo Ingreso
ingresoSchema.index({ userId: 1, fecha: 1, categoria: 1, subcategoria: 1 });
ingresoSchema.index({ userId: 1, fecha: 1, carteraId: 1 });
```

### 2. Cache (Opcional)

Para periodos que no cambian frecuentemente (ej: meses pasados), considerar cache:

```javascript
const cacheKey = `estadisticas:${userId}:${periodo}:${carteraId || 'all'}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return res.json(JSON.parse(cached));
}
// ... calcular resultados ...
await redis.setex(cacheKey, 3600, JSON.stringify(resultados)); // Cache 1 hora
```

### 3. Paginación de Subcategorías (Opcional)

Si una categoría tiene muchas subcategorías, considerar limitar:

```javascript
subcategorias: subcategorias.slice(0, 20) // Máximo 20 subcategorías por categoría
```

---

## 📞 Contacto y Referencias

- **Documentación de subcategorías:** `Doc_backend/subcategorias-integracion.md`
- **Documentación de estadísticas:** `Doc_backend/estadisticas-integracion.md`
- **Documentación de gastos:** `Doc_backend/gastos-subcategorias-frontend.md`

---

## 🔄 Migración de Datos (Si es necesario)

Si hay documentos antiguos sin el campo `subcategoria`, puedes ejecutar una migración:

```javascript
// Script de migración (ejecutar una sola vez)
async function migrarSubcategorias() {
  await Gasto.updateMany(
    { subcategoria: { $exists: false } },
    { $set: { subcategoria: null } }
  );
  
  await Ingreso.updateMany(
    { subcategoria: { $exists: false } },
    { $set: { subcategoria: null } }
  );
  
  console.log('Migración completada');
}
```

---

**Última actualización:** 2024-11-23
**Versión:** 1.0.0

