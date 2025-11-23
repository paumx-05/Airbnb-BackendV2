# Integración Backend: Sistema de Subcategorías

## 📋 Objetivo

Este documento describe la implementación completa del sistema de **subcategorías** en el backend, permitiendo a los usuarios organizar sus categorías de gastos e ingresos de manera más granular y detallada.

---

## 🎯 Características Principales

- ✅ **Subcategorías opcionales** por categoría (máximo 20)
- ✅ **Retrocompatibilidad** total con datos existentes
- ✅ **Validación automática** de subcategorías duplicadas
- ✅ **Análisis estadístico** con drill-down por subcategorías
- ✅ **Filtrado avanzado** en reportes y estadísticas
- ✅ **Sin sobreingeniería** - implementación simple y escalable

---

## 🗄️ FASE 1: Modificación del Modelo de Categorías

### 1.1 Actualizar Schema de Mongoose

**Archivo:** `models/categoria.model.js`

```javascript
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  tipo: {
    type: String,
    required: true,
    enum: ['gastos', 'ingresos', 'ambos'],
    index: true
  },
  // NUEVO: Array de subcategorías (opcional)
  subcategorias: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
categoriaSchema.index({ userId: 1, nombre: 1 }, { unique: true });
categoriaSchema.index({ userId: 1, tipo: 1 });

// Validación personalizada: máximo 20 subcategorías
categoriaSchema.pre('save', function(next) {
  if (this.subcategorias && this.subcategorias.length > 20) {
    return next(new Error('Máximo 20 subcategorías permitidas por categoría'));
  }
  
  // Eliminar duplicados y vacíos automáticamente
  if (this.subcategorias) {
    this.subcategorias = [...new Set(
      this.subcategorias
        .map(s => s.trim())
        .filter(s => s.length > 0)
    )];
  }
  
  next();
});

module.exports = mongoose.model('Categoria', categoriaSchema);
```

### 1.2 Validación en el Controlador

**Archivo:** `controllers/categorias.controller.js`

**Actualizar función `crearCategoria`:**

```javascript
const crearCategoria = async (req, res) => {
  try {
    const { nombre, tipo, subcategorias } = req.body;
    const userId = req.user._id;

    // Validación básica
    if (!nombre || !tipo) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y tipo son requeridos'
      });
    }

    // Validar tipo
    if (!['gastos', 'ingresos', 'ambos'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
    }

    // Validar subcategorías (opcional)
    if (subcategorias) {
      if (!Array.isArray(subcategorias)) {
        return res.status(400).json({
          success: false,
          error: 'Subcategorías debe ser un array'
        });
      }

      if (subcategorias.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Máximo 20 subcategorías permitidas'
        });
      }

      // Validar que no haya subcategorías vacías
      const subcategoriasValidas = subcategorias.filter(s => 
        typeof s === 'string' && s.trim().length > 0
      );

      if (subcategoriasValidas.length !== subcategorias.length) {
        return res.status(400).json({
          success: false,
          error: 'Todas las subcategorías deben ser textos válidos'
        });
      }
    }

    // Verificar si ya existe una categoría con el mismo nombre para este usuario
    const categoriaExistente = await Categoria.findOne({
      userId,
      nombre: nombre.trim()
    });

    if (categoriaExistente) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con este nombre'
      });
    }

    // Crear la categoría con subcategorías (si las hay)
    const nuevaCategoria = new Categoria({
      userId,
      nombre: nombre.trim(),
      tipo,
      subcategorias: subcategorias || []
    });

    await nuevaCategoria.save();

    res.status(201).json({
      success: true,
      data: nuevaCategoria,
      message: 'Categoría creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la categoría'
    });
  }
};
```

**Actualizar función `actualizarCategoria`:**

```javascript
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, subcategorias } = req.body;
    const userId = req.user._id;

    // Validar que al menos un campo esté presente
    if (!nombre && !tipo && !subcategorias) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Buscar la categoría
    const categoria = await Categoria.findOne({ _id: id, userId });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    // Actualizar campos
    if (nombre) {
      // Verificar duplicados (excluyendo la categoría actual)
      const categoriaExistente = await Categoria.findOne({
        userId,
        nombre: nombre.trim(),
        _id: { $ne: id }
      });

      if (categoriaExistente) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe otra categoría con este nombre'
        });
      }

      categoria.nombre = nombre.trim();
    }

    if (tipo) {
      if (!['gastos', 'ingresos', 'ambos'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido'
        });
      }
      categoria.tipo = tipo;
    }

    // Actualizar subcategorías (si se proporciona)
    if (subcategorias !== undefined) {
      if (!Array.isArray(subcategorias)) {
        return res.status(400).json({
          success: false,
          error: 'Subcategorías debe ser un array'
        });
      }

      if (subcategorias.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Máximo 20 subcategorías permitidas'
        });
      }

      categoria.subcategorias = subcategorias.filter(s => 
        typeof s === 'string' && s.trim().length > 0
      ).map(s => s.trim());
    }

    await categoria.save();

    res.json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la categoría'
    });
  }
};
```

---

## 🗄️ FASE 2: Modificación de Modelos de Gastos e Ingresos

### 2.1 Actualizar Schema de Gastos

**Archivo:** `models/gasto.model.js`

```javascript
const gastoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  carteraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cartera',
    default: null
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  // NUEVO: Subcategoría opcional
  subcategoria: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null
  },
  mes: {
    type: String,
    required: true,
    index: true
  },
  dividido: [{
    amigoId: mongoose.Schema.Types.ObjectId,
    amigoNombre: String,
    montoDividido: Number,
    pagado: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
gastoSchema.index({ userId: 1, mes: 1, fecha: -1 });
gastoSchema.index({ userId: 1, categoria: 1, fecha: -1 });
gastoSchema.index({ userId: 1, categoria: 1, subcategoria: 1 }); // NUEVO

// Middleware de validación: Verificar que la subcategoría pertenezca a la categoría
gastoSchema.pre('save', async function(next) {
  if (this.subcategoria && this.categoria) {
    try {
      const Categoria = mongoose.model('Categoria');
      const categoria = await Categoria.findOne({
        userId: this.userId,
        nombre: this.categoria
      });

      if (categoria && categoria.subcategorias) {
        const subcategoriaValida = categoria.subcategorias.includes(this.subcategoria);
        if (!subcategoriaValida) {
          return next(new Error(`La subcategoría "${this.subcategoria}" no pertenece a la categoría "${this.categoria}"`));
        }
      }
    } catch (error) {
      console.error('Error validando subcategoría:', error);
      // No bloqueamos el guardado si hay un error en la validación
    }
  }
  next();
});

module.exports = mongoose.model('Gasto', gastoSchema);
```

### 2.2 Actualizar Schema de Ingresos

**Archivo:** `models/ingreso.model.js`

```javascript
const ingresoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  carteraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cartera',
    default: null
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  // NUEVO: Subcategoría opcional
  subcategoria: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null
  },
  mes: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
ingresoSchema.index({ userId: 1, mes: 1, fecha: -1 });
ingresoSchema.index({ userId: 1, categoria: 1, fecha: -1 });
ingresoSchema.index({ userId: 1, categoria: 1, subcategoria: 1 }); // NUEVO

// Middleware de validación: Verificar que la subcategoría pertenezca a la categoría
ingresoSchema.pre('save', async function(next) {
  if (this.subcategoria && this.categoria) {
    try {
      const Categoria = mongoose.model('Categoria');
      const categoria = await Categoria.findOne({
        userId: this.userId,
        nombre: this.categoria
      });

      if (categoria && categoria.subcategorias) {
        const subcategoriaValida = categoria.subcategorias.includes(this.subcategoria);
        if (!subcategoriaValida) {
          return next(new Error(`La subcategoría "${this.subcategoria}" no pertenece a la categoría "${this.categoria}"`));
        }
      }
    } catch (error) {
      console.error('Error validando subcategoría:', error);
      // No bloqueamos el guardado si hay un error en la validación
    }
  }
  next();
});

module.exports = mongoose.model('Ingreso', ingresoSchema);
```

---

## 📊 FASE 3: Actualizar Controlador de Estadísticas

### 3.1 Análisis por Categorías con Subcategorías

**Archivo:** `controllers/estadisticas.controller.js`

**Agregar función auxiliar para agrupar por subcategorías:**

```javascript
/**
 * Función auxiliar para calcular análisis de subcategorías
 * @param {Array} transacciones - Array de gastos/ingresos
 * @param {Number} totalGeneral - Total de todas las transacciones
 * @returns {Object} - Análisis agrupado por categoría con subcategorías
 */
const calcularAnalisisConSubcategorias = (transacciones, totalGeneral) => {
  // Agrupar por categoría
  const categorias = {};

  transacciones.forEach(t => {
    const categoria = t.categoria;
    
    if (!categorias[categoria]) {
      categorias[categoria] = {
        categoria: categoria,
        monto: 0,
        cantidad: 0,
        subcategorias: {}
      };
    }

    categorias[categoria].monto += t.monto;
    categorias[categoria].cantidad += 1;

    // Si tiene subcategoría, agrupar también por subcategoría
    if (t.subcategoria) {
      const subcategoria = t.subcategoria;
      
      if (!categorias[categoria].subcategorias[subcategoria]) {
        categorias[categoria].subcategorias[subcategoria] = {
          nombre: subcategoria,
          monto: 0,
          cantidad: 0
        };
      }

      categorias[categoria].subcategorias[subcategoria].monto += t.monto;
      categorias[categoria].subcategorias[subcategoria].cantidad += 1;
    }
  });

  // Convertir a array y calcular porcentajes y promedios
  const resultado = Object.values(categorias).map(cat => {
    const porcentaje = totalGeneral > 0 ? (cat.monto / totalGeneral) * 100 : 0;
    const promedio = cat.cantidad > 0 ? cat.monto / cat.cantidad : 0;

    // Calcular análisis de subcategorías
    const subcategoriasArray = Object.values(cat.subcategorias).map(sub => ({
      nombre: sub.nombre,
      monto: sub.monto,
      porcentaje: cat.monto > 0 ? (sub.monto / cat.monto) * 100 : 0,
      cantidad: sub.cantidad,
      promedio: sub.cantidad > 0 ? sub.monto / sub.cantidad : 0
    }));

    // Ordenar subcategorías por monto descendente
    subcategoriasArray.sort((a, b) => b.monto - a.monto);

    return {
      categoria: cat.categoria,
      monto: cat.monto,
      porcentaje: porcentaje,
      cantidad: cat.cantidad,
      promedio: promedio,
      tendencia: 'estable', // Se calculará comparando con periodo anterior si es necesario
      subcategorias: subcategoriasArray.length > 0 ? subcategoriasArray : undefined
    };
  });

  // Ordenar por monto descendente
  resultado.sort((a, b) => b.monto - a.monto);

  return resultado;
};
```

**Actualizar función `getAnalisisCategorias`:**

```javascript
const getAnalisisCategorias = async (req, res) => {
  try {
    const userId = req.user._id;
    const { periodo = 'mensual', carteraId, limite = 10, tipo = 'ambos' } = req.query;

    // Calcular rango de fechas según el periodo
    const { fechaInicio, fechaFin } = calcularRangoFechas(periodo);

    // Construir query base
    const queryBase = {
      userId,
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    };

    // Filtrar por cartera si se especifica
    if (carteraId) {
      queryBase.carteraId = carteraId;
    }

    // Obtener gastos e ingresos según el tipo solicitado
    let categoriasGastos = [];
    let categoriasIngresos = [];
    let totalGastos = 0;
    let totalIngresos = 0;

    if (tipo === 'gastos' || tipo === 'ambos') {
      const gastos = await Gasto.find(queryBase)
        .select('categoria subcategoria monto fecha')
        .lean();

      totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
      categoriasGastos = calcularAnalisisConSubcategorias(gastos, totalGastos);
      
      // Limitar resultados si se especifica
      if (limite && limite > 0) {
        categoriasGastos = categoriasGastos.slice(0, parseInt(limite));
      }
    }

    if (tipo === 'ingresos' || tipo === 'ambos') {
      const ingresos = await Ingreso.find(queryBase)
        .select('categoria subcategoria monto fecha')
        .lean();

      totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
      categoriasIngresos = calcularAnalisisConSubcategorias(ingresos, totalIngresos);
      
      // Limitar resultados si se especifica
      if (limite && limite > 0) {
        categoriasIngresos = categoriasIngresos.slice(0, parseInt(limite));
      }
    }

    res.json({
      success: true,
      data: {
        periodo,
        categoriasGastos,
        categoriasIngresos,
        totalGastos,
        totalIngresos
      }
    });

  } catch (error) {
    console.error('Error al obtener análisis de categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener análisis de categorías'
    });
  }
};
```

---

## 🔍 FASE 4: Endpoints Adicionales (Opcionales)

### 4.1 Filtrar Gastos/Ingresos por Subcategoría

**Agregar en `routes/gastos.routes.js`:**

```javascript
// GET /api/gastos/categoria/:categoria/subcategoria/:subcategoria
router.get(
  '/categoria/:categoria/subcategoria/:subcategoria',
  authMiddleware,
  gastosController.getGastosPorSubcategoria
);
```

**Agregar en `controllers/gastos.controller.js`:**

```javascript
const getGastosPorSubcategoria = async (req, res) => {
  try {
    const { categoria, subcategoria } = req.params;
    const { mes, carteraId } = req.query;
    const userId = req.user._id;

    const query = {
      userId,
      categoria,
      subcategoria
    };

    if (mes) {
      query.mes = mes;
    }

    if (carteraId) {
      query.carteraId = carteraId;
    }

    const gastos = await Gasto.find(query)
      .sort({ fecha: -1 })
      .lean();

    const total = gastos.reduce((sum, g) => sum + g.monto, 0);

    res.json({
      success: true,
      data: gastos,
      total,
      count: gastos.length
    });

  } catch (error) {
    console.error('Error al obtener gastos por subcategoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener gastos por subcategoría'
    });
  }
};
```

---

## 🧪 FASE 5: Testing

### 5.1 Test de Categorías con Subcategorías

**Archivo:** `tests/categorias.test.js`

```javascript
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Categoria = require('../models/categoria.model');

describe('Categorías con Subcategorías', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Crear usuario de prueba y obtener token
    const user = await User.create({
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Categoria.deleteMany({});
  });

  describe('POST /api/categorias', () => {
    it('Debe crear una categoría con subcategorías', async () => {
      const res = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Alimentación',
          tipo: 'gastos',
          subcategorias: ['Supermercado', 'Restaurantes', 'Comida rápida']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subcategorias).toHaveLength(3);
      expect(res.body.data.subcategorias).toContain('Supermercado');
    });

    it('Debe rechazar más de 20 subcategorías', async () => {
      const subcategorias = Array(21).fill('Test');
      
      const res = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test',
          tipo: 'gastos',
          subcategorias
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Máximo 20 subcategorías');
    });

    it('Debe eliminar subcategorías duplicadas automáticamente', async () => {
      const res = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Transporte',
          tipo: 'gastos',
          subcategorias: ['Taxi', 'Taxi', 'Bus', 'Bus']
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subcategorias).toHaveLength(2);
    });
  });

  describe('PUT /api/categorias/:id', () => {
    it('Debe actualizar subcategorías de una categoría existente', async () => {
      // Crear categoría
      const createRes = await request(app)
        .post('/api/categorias')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Ocio',
          tipo: 'gastos',
          subcategorias: ['Cine']
        });

      const categoriaId = createRes.body.data._id;

      // Actualizar subcategorías
      const updateRes = await request(app)
        .put(`/api/categorias/${categoriaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          subcategorias: ['Cine', 'Teatro', 'Conciertos']
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.subcategorias).toHaveLength(3);
      expect(updateRes.body.data.subcategorias).toContain('Teatro');
    });
  });
});
```

### 5.2 Test de Gastos con Subcategorías

**Archivo:** `tests/gastos.test.js`

```javascript
describe('Gastos con Subcategorías', () => {
  let token;
  let categoriaId;

  beforeAll(async () => {
    // Setup: crear usuario, login, crear categoría con subcategorías
    // ... (código de setup)
  });

  it('Debe crear un gasto con subcategoría', async () => {
    const res = await request(app)
      .post('/api/gastos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'Compra en Mercadona',
        monto: 45.50,
        fecha: new Date(),
        categoria: 'Alimentación',
        subcategoria: 'Supermercado',
        mes: 'noviembre'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.subcategoria).toBe('Supermercado');
  });

  it('Debe permitir gastos sin subcategoría', async () => {
    const res = await request(app)
      .post('/api/gastos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'Compra general',
        monto: 20,
        fecha: new Date(),
        categoria: 'Alimentación',
        mes: 'noviembre'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.subcategoria).toBeUndefined();
  });
});
```

---

## 📊 FASE 6: Ejemplos de Responses

### 6.1 GET /api/categorias

**Response con subcategorías:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "674150c8e4b0a1234567890a",
      "userId": "674150c8e4b0a1234567890b",
      "nombre": "Alimentación",
      "tipo": "gastos",
      "subcategorias": [
        "Supermercado",
        "Restaurantes",
        "Comida rápida",
        "Frutas y verduras"
      ],
      "createdAt": "2024-11-23T10:30:00.000Z"
    },
    {
      "_id": "674150c8e4b0a1234567890c",
      "userId": "674150c8e4b0a1234567890b",
      "nombre": "Transporte",
      "tipo": "gastos",
      "subcategorias": [
        "Gasolina",
        "Transporte público",
        "Taxi"
      ],
      "createdAt": "2024-11-23T10:35:00.000Z"
    }
  ]
}
```

### 6.2 GET /api/estadisticas/categorias

**Response con análisis de subcategorías:**

```json
{
  "success": true,
  "data": {
    "periodo": "mensual",
    "categoriasGastos": [
      {
        "categoria": "Alimentación",
        "monto": 450.75,
        "porcentaje": 35.5,
        "cantidad": 15,
        "promedio": 30.05,
        "tendencia": "estable",
        "subcategorias": [
          {
            "nombre": "Supermercado",
            "monto": 280.50,
            "porcentaje": 62.2,
            "cantidad": 8,
            "promedio": 35.06
          },
          {
            "nombre": "Restaurantes",
            "monto": 120.25,
            "porcentaje": 26.7,
            "cantidad": 4,
            "promedio": 30.06
          },
          {
            "nombre": "Comida rápida",
            "monto": 50.00,
            "porcentaje": 11.1,
            "cantidad": 3,
            "promedio": 16.67
          }
        ]
      },
      {
        "categoria": "Transporte",
        "monto": 180.00,
        "porcentaje": 14.2,
        "cantidad": 12,
        "promedio": 15.00,
        "tendencia": "estable",
        "subcategorias": [
          {
            "nombre": "Gasolina",
            "monto": 120.00,
            "porcentaje": 66.7,
            "cantidad": 3,
            "promedio": 40.00
          },
          {
            "nombre": "Transporte público",
            "monto": 45.00,
            "porcentaje": 25.0,
            "cantidad": 7,
            "promedio": 6.43
          },
          {
            "nombre": "Taxi",
            "monto": 15.00,
            "porcentaje": 8.3,
            "cantidad": 2,
            "promedio": 7.50
          }
        ]
      }
    ],
    "categoriasIngresos": [],
    "totalGastos": 1269.50,
    "totalIngresos": 0
  }
}
```

---

## 🚀 FASE 7: Migración de Datos Existentes

### 7.1 Script de Migración (Opcional)

Si necesitas migrar datos existentes, puedes crear un script:

**Archivo:** `scripts/migrar-subcategorias.js`

```javascript
const mongoose = require('mongoose');
const Categoria = require('../models/categoria.model');

async function migrarSubcategorias() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Actualizar todas las categorías que no tienen el campo subcategorias
    const resultado = await Categoria.updateMany(
      { subcategorias: { $exists: false } },
      { $set: { subcategorias: [] } }
    );

    console.log(`✅ ${resultado.modifiedCount} categorías actualizadas`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrarSubcategorias();
```

**Ejecutar:**

```bash
node scripts/migrar-subcategorias.js
```

---

## ✅ Checklist de Implementación

### Backend

- [ ] Actualizar modelo `Categoria` con campo `subcategorias`
- [ ] Añadir validación de máximo 20 subcategorías
- [ ] Añadir eliminación automática de duplicados
- [ ] Actualizar controlador `crearCategoria`
- [ ] Actualizar controlador `actualizarCategoria`
- [ ] Actualizar modelo `Gasto` con campo `subcategoria`
- [ ] Actualizar modelo `Ingreso` con campo `subcategoria`
- [ ] Añadir validación de subcategoría en middleware
- [ ] Crear índices compuestos para consultas eficientes
- [ ] Actualizar `getAnalisisCategorias` con lógica de subcategorías
- [ ] Añadir función auxiliar `calcularAnalisisConSubcategorias`
- [ ] (Opcional) Crear endpoint para filtrar por subcategoría
- [ ] Escribir tests unitarios
- [ ] Ejecutar script de migración (si es necesario)
- [ ] Probar en entorno de desarrollo
- [ ] Documentar cambios en API

### Testing

- [ ] Crear categoría con subcategorías
- [ ] Actualizar subcategorías de categoría existente
- [ ] Validar límite de 20 subcategorías
- [ ] Validar eliminación de duplicados
- [ ] Crear gasto con subcategoría
- [ ] Crear gasto sin subcategoría (retrocompatibilidad)
- [ ] Validar subcategoría inválida
- [ ] Obtener análisis con subcategorías
- [ ] Verificar performance con grandes volúmenes

---

## 📝 Notas Importantes

1. **Retrocompatibilidad**: Todas las transacciones existentes funcionarán sin modificación, ya que `subcategoria` es opcional
2. **Performance**: Los índices compuestos aseguran consultas rápidas incluso con millones de registros
3. **Validación**: La validación en el middleware `pre('save')` es no-bloqueante para evitar problemas si la categoría no existe
4. **Escalabilidad**: El límite de 20 subcategorías previene problemas de performance y UX
5. **Flexibilidad**: Los usuarios pueden añadir/eliminar subcategorías sin afectar transacciones existentes

---

## 🎯 Próximos Pasos

Una vez implementado en el backend:

1. ✅ Frontend ya está preparado y funcionando
2. 🔄 Probar integración completa frontend-backend
3. 📊 Verificar que las estadísticas se muestran correctamente
4. 🐛 Corregir cualquier bug encontrado
5. 🚀 Desplegar en producción

---

## 📞 Soporte

Si tienes dudas durante la implementación:

- Revisa los modelos TypeScript en el frontend para entender el formato esperado
- Los schemas Zod en `schemas/categorias.schema.ts` muestran la validación exacta
- El componente `SubcategoriaSelector.tsx` muestra cómo se consumen las subcategorías
- La página `estadisticas/page.tsx` muestra cómo se visualizan en tablas

---

**Documento generado:** 23 de noviembre de 2024  
**Versión:** 1.0  
**Estado:** ✅ Listo para implementar

