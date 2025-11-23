# Integración Frontend: Endpoints de Estadísticas

## Objetivo
Este documento describe cómo integrar los endpoints de estadísticas del backend con el frontend, proporcionando análisis financieros detallados con soporte para diferentes periodos temporales (Anual, Mensual, Semanal) y filtrado por cartera.

---

## 🎯 Flujo del Sistema de Estadísticas

El sistema de estadísticas proporciona análisis financieros avanzados para visualizar el estado y tendencias de las finanzas del usuario:

1. **Resumen de Estadísticas** → Totales y métricas básicas por periodo
2. **Tendencias Temporales** → Comparativas y evolución en el tiempo
3. **Análisis por Categorías** → Distribución y ranking de categorías
4. **Métricas de Comportamiento** → Patrones de gasto e ingresos

**Importante:** Los usuarios solo pueden acceder a sus propios datos. Todas las operaciones están protegidas por autenticación.

**Características especiales:**
- **Múltiples periodos**: Soporte para Anual, Mensual y Semanal
- **Filtrado por cartera**: Todos los endpoints soportan filtrado opcional por `carteraId`
- **Cálculos optimizados**: Uso de aggregation pipelines de MongoDB para rendimiento
- **Comparativas automáticas**: Comparación con periodos anteriores
- **Validación estricta**: Validación de parámetros y fechas

---

## 🏗️ Estructura del Backend (MVC)

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
- `400`: Parámetro `periodo` inválido o faltante, fecha de referencia inválida
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario (si se proporciona `carteraId`)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface ResumenEstadisticas {
  periodo: 'anual' | 'mensual' | 'semanal';
  fechaInicio: string;
  fechaFin: string;
  ingresos: {
    total: number;
    promedioDiario: number;
    cantidad: number;
  };
  gastos: {
    total: number;
    promedioDiario: number;
    cantidad: number;
  };
  balance: {
    total: number;
    promedioDiario: number;
  };
  tasaAhorro: number;
  ratioGastosIngresos: number;
}

interface ResumenEstadisticasParams {
  periodo: 'anual' | 'mensual' | 'semanal';
  carteraId?: string;
  fechaReferencia?: string; // Formato: YYYY-MM-DD
}

const getResumenEstadisticas = async (
  params: ResumenEstadisticasParams
): Promise<ResumenEstadisticas> => {
  const token = localStorage.getItem('token');
  
  // Construir query string
  const queryParams = new URLSearchParams({
    periodo: params.periodo
  });
  
  if (params.carteraId) {
    queryParams.append('carteraId', params.carteraId);
  }
  
  if (params.fechaReferencia) {
    queryParams.append('fechaReferencia', params.fechaReferencia);
  }
  
  const response = await fetch(
    `http://localhost:4444/api/estadisticas/resumen?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener resumen de estadísticas');
  }

  const result = await response.json();
  return result.data;
};

// Ejemplo de uso
const resumen = await getResumenEstadisticas({
  periodo: 'mensual',
  carteraId: '507f1f77bcf86cd799439011'
});
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
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/tendencias?periodo=mensual
GET /api/estadisticas/tendencias?periodo=anual&carteraId=507f1f77bcf86cd799439011
GET /api/estadisticas/tendencias?periodo=semanal&fechaReferencia=2024-11-20
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
      },
      {
        "fecha": "2024-11-10",
        "ingresos": 800,
        "gastos": 450
      }
    ]
  }
}
```

**Campos de respuesta:**
- `periodoActual`: Datos del period actual
  - `fechaInicio`: Fecha de inicio del periodo
  - `fechaFin`: Fecha de fin del periodo
  - `ingresos`: Total de ingresos
  - `gastos`: Total de gastos
  - `balance`: Balance neto
- `periodoAnterior`: Datos del periodo anterior (calculado automáticamente)
  - Misma estructura que `periodoActual`
- `cambios`: Comparativa entre periodos
  - `ingresos`, `gastos`, `balance`:
    - `valor`: Diferencia absoluta (actual - anterior)
    - `porcentaje`: Cambio porcentual
    - `tipo`: `'aumento'` | `'disminucion'`
- `datosGrafico`: Array de puntos para gráfico de líneas (agrupado por día/semana/mes según periodo)
  - `fecha`: Fecha en formato YYYY-MM-DD
  - `ingresos`: Total de ingresos en esa fecha
  - `gastos`: Total de gastos en esa fecha

**Errores posibles:**
- `400`: Parámetro `periodo` inválido o faltante
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario (si se proporciona `carteraId`)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface PeriodoDatos {
  fechaInicio: string;
  fechaFin: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

interface Cambio {
  valor: number;
  porcentaje: number;
  tipo: 'aumento' | 'disminucion';
}

interface PuntoGrafico {
  fecha: string;
  ingresos: number;
  gastos: number;
}

interface TendenciasTemporales {
  periodo: 'anual' | 'mensual' | 'semanal';
  periodoActual: PeriodoDatos;
  periodoAnterior: PeriodoDatos;
  cambios: {
    ingresos: Cambio;
    gastos: Cambio;
    balance: Cambio;
  };
  datosGrafico: PuntoGrafico[];
}

interface TendenciasTemporalesParams {
  periodo: 'anual' | 'mensual' | 'semanal';
  carteraId?: string;
  fechaReferencia?: string;
}

const getTendenciasTemporales = async (
  params: TendenciasTemporalesParams
): Promise<TendenciasTemporales> => {
  const token = localStorage.getItem('token');
  
  const queryParams = new URLSearchParams({
    periodo: params.periodo
  });
  
  if (params.carteraId) {
    queryParams.append('carteraId', params.carteraId);
  }
  
  if (params.fechaReferencia) {
    queryParams.append('fechaReferencia', params.fechaReferencia);
  }
  
  const response = await fetch(
    `http://localhost:4444/api/estadisticas/tendencias?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener tendencias temporales');
  }

  const result = await response.json();
  return result.data;
};

// Ejemplo de uso con React/Chart.js
const TendenciasChart = () => {
  const [datos, setDatos] = useState<TendenciasTemporales | null>(null);
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const tendencias = await getTendenciasTemporales({
          periodo: 'mensual'
        });
        setDatos(tendencias);
      } catch (error) {
        console.error('Error al cargar tendencias:', error);
      }
    };
    
    cargarDatos();
  }, []);
  
  if (!datos) return <div>Cargando...</div>;
  
  return (
    <div>
      <h2>Tendencias {datos.periodo}</h2>
      <LineChart
        data={{
          labels: datos.datosGrafico.map(d => d.fecha),
          datasets: [
            {
              label: 'Ingresos',
              data: datos.datosGrafico.map(d => d.ingresos),
              borderColor: 'rgb(75, 192, 192)'
            },
            {
              label: 'Gastos',
              data: datos.datosGrafico.map(d => d.gastos),
              borderColor: 'rgb(255, 99, 132)'
            }
          ]
        }}
      />
      <div>
        <h3>Cambios vs periodo anterior</h3>
        <p>Ingresos: {datos.cambios.ingresos.porcentaje.toFixed(2)}% 
           ({datos.cambios.ingresos.tipo})</p>
        <p>Gastos: {datos.cambios.gastos.porcentaje.toFixed(2)}% 
           ({datos.cambios.gastos.tipo})</p>
        <p>Balance: {datos.cambios.balance.porcentaje.toFixed(2)}% 
           ({datos.cambios.balance.tipo})</p>
      </div>
    </div>
  );
};
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
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO (YYYY-MM-DD)
- `tipo` (string, opcional): `'gastos'` | `'ingresos'` | `'ambos'` (default: `'ambos'`)
- `limite` (number, opcional): Número máximo de categorías a retornar (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/categorias?periodo=mensual&tipo=gastos&limite=5
GET /api/estadisticas/categorias?periodo=anual&tipo=ambos&carteraId=507f1f77bcf86cd799439011
GET /api/estadisticas/categorias?periodo=semanal&limite=10
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
        "tendencia": "estable"
      },
      {
        "categoria": "Transporte",
        "monto": 450.50,
        "porcentaje": 25.03,
        "cantidad": 12,
        "promedio": 37.54,
        "tendencia": "disminucion"
      },
      {
        "categoria": "Entretenimiento",
        "monto": 300.00,
        "porcentaje": 16.67,
        "cantidad": 8,
        "promedio": 37.50,
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
      },
      {
        "categoria": "Freelance",
        "monto": 500.00,
        "porcentaje": 20.00,
        "cantidad": 3,
        "promedio": 166.67,
        "tendencia": "aumento"
      }
    ],
    "totalGastos": 1800.50,
    "totalIngresos": 2500.00
  }
}
```

**Campos de respuesta:**
- `periodo`: Periodo solicitado
- `categoriasGastos`: Array de categorías de gastos (ordenadas por monto descendente)
  - `categoria`: Nombre de la categoría
  - `monto`: Total gastado en esta categoría
  - `porcentaje`: Porcentaje del total de gastos
  - `cantidad`: Número de transacciones
  - `promedio`: Promedio por transacción
  - `tendencia`: `'aumento'` | `'disminucion'` | `'estable'` (actualmente siempre `'estable'`, pendiente de implementación)
- `categoriasIngresos`: Array de categorías de ingresos (misma estructura que `categoriasGastos`)
- `totalGastos`: Total de gastos en el periodo
- `totalIngresos`: Total de ingresos en el periodo

**Nota:** Si `tipo` es `'gastos'`, `categoriasIngresos` estará vacío. Si es `'ingresos'`, `categoriasGastos` estará vacío.

**Errores posibles:**
- `400`: Parámetro `periodo` o `tipo` inválido
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario (si se proporciona `carteraId`)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CategoriaAnalisis {
  categoria: string;
  monto: number;
  porcentaje: number;
  cantidad: number;
  promedio: number;
  tendencia: 'aumento' | 'disminucion' | 'estable';
}

interface AnalisisCategorias {
  periodo: 'anual' | 'mensual' | 'semanal';
  categoriasGastos: CategoriaAnalisis[];
  categoriasIngresos: CategoriaAnalisis[];
  totalGastos: number;
  totalIngresos: number;
}

interface AnalisisCategoriasParams {
  periodo: 'anual' | 'mensual' | 'semanal';
  carteraId?: string;
  fechaReferencia?: string;
  tipo?: 'gastos' | 'ingresos' | 'ambos';
  limite?: number;
}

const getAnalisisCategorias = async (
  params: AnalisisCategoriasParams
): Promise<AnalisisCategorias> => {
  const token = localStorage.getItem('token');
  
  const queryParams = new URLSearchParams({
    periodo: params.periodo
  });
  
  if (params.carteraId) {
    queryParams.append('carteraId', params.carteraId);
  }
  
  if (params.fechaReferencia) {
    queryParams.append('fechaReferencia', params.fechaReferencia);
  }
  
  if (params.tipo) {
    queryParams.append('tipo', params.tipo);
  }
  
  if (params.limite) {
    queryParams.append('limite', params.limite.toString());
  }
  
  const response = await fetch(
    `http://localhost:4444/api/estadisticas/categorias?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener análisis por categorías');
  }

  const result = await response.json();
  return result.data;
};

// Ejemplo de uso con gráfico de barras
const CategoriasChart = () => {
  const [datos, setDatos] = useState<AnalisisCategorias | null>(null);
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const analisis = await getAnalisisCategorias({
          periodo: 'mensual',
          tipo: 'gastos',
          limite: 5
        });
        setDatos(analisis);
      } catch (error) {
        console.error('Error al cargar análisis:', error);
      }
    };
    
    cargarDatos();
  }, []);
  
  if (!datos) return <div>Cargando...</div>;
  
  return (
    <div>
      <h2>Top 5 Categorías de Gastos</h2>
      <BarChart
        data={{
          labels: datos.categoriasGastos.map(c => c.categoria),
          datasets: [
            {
              label: 'Gastos',
              data: datos.categoriasGastos.map(c => c.monto),
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        }}
      />
      <div>
        <h3>Detalles</h3>
        {datos.categoriasGastos.map(categoria => (
          <div key={categoria.categoria}>
            <p>{categoria.categoria}: {categoria.monto.toFixed(2)}€ 
               ({categoria.porcentaje.toFixed(2)}%)</p>
            <p>Promedio: {categoria.promedio.toFixed(2)}€ por transacción</p>
          </div>
        ))}
      </div>
    </div>
  );
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
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de uso:**
```
GET /api/estadisticas/comportamiento?periodo=mensual
GET /api/estadisticas/comportamiento?periodo=semanal&carteraId=507f1f77bcf86cd799439011
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
      },
      {
        "categoria": "Transporte",
        "frecuencia": 12,
        "porcentaje": 28.57
      },
      {
        "categoria": "Entretenimiento",
        "frecuencia": 8,
        "porcentaje": 19.05
      }
    ]
  }
}
```

**Campos de respuesta:**
- `periodo`: Periodo solicitado
- `transacciones`:
  - `total`: Total de transacciones (ingresos + gastos)
  - `ingresos`: Número de transacciones de ingresos
  - `gastos`: Número de transacciones de gastos
  - `promedioDiario`: Promedio de transacciones por día
- `gastoPromedio`:
  - `porTransaccion`: Promedio de gasto por transacción
  - `porDia`: Promedio de gasto por día
- `diasActivos`:
  - `total`: Número de días con actividad (con al menos una transacción)
  - `conGastos`: Número de días con gastos
  - `conIngresos`: Número de días con ingresos
  - `porcentajeActividad`: Porcentaje de días activos sobre el total del periodo
- `frecuenciaCategorias`: Array de categorías ordenadas por frecuencia (top 10)
  - `categoria`: Nombre de la categoría
  - `frecuencia`: Número de transacciones en esta categoría
  - `porcentaje`: Porcentaje sobre el total de gastos

**Errores posibles:**
- `400`: Parámetro `periodo` inválido o faltante
- `401`: Usuario no autenticado
- `404`: Cartera no encontrada o no pertenece al usuario (si se proporciona `carteraId`)
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface Transacciones {
  total: number;
  ingresos: number;
  gastos: number;
  promedioDiario: number;
}

interface GastoPromedio {
  porTransaccion: number;
  porDia: number;
}

interface DiasActivos {
  total: number;
  conGastos: number;
  conIngresos: number;
  porcentajeActividad: number;
}

interface FrecuenciaCategoria {
  categoria: string;
  frecuencia: number;
  porcentaje: number;
}

interface MetricasComportamiento {
  periodo: 'anual' | 'mensual' | 'semanal';
  transacciones: Transacciones;
  gastoPromedio: GastoPromedio;
  diasActivos: DiasActivos;
  frecuenciaCategorias: FrecuenciaCategoria[];
}

interface MetricasComportamientoParams {
  periodo: 'anual' | 'mensual' | 'semanal';
  carteraId?: string;
  fechaReferencia?: string;
}

const getMetricasComportamiento = async (
  params: MetricasComportamientoParams
): Promise<MetricasComportamiento> => {
  const token = localStorage.getItem('token');
  
  const queryParams = new URLSearchParams({
    periodo: params.periodo
  });
  
  if (params.carteraId) {
    queryParams.append('carteraId', params.carteraId);
  }
  
  if (params.fechaReferencia) {
    queryParams.append('fechaReferencia', params.fechaReferencia);
  }
  
  const response = await fetch(
    `http://localhost:4444/api/estadisticas/comportamiento?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener métricas de comportamiento');
  }

  const result = await response.json();
  return result.data;
};

// Ejemplo de uso
const MetricasComportamiento = () => {
  const [metricas, setMetricas] = useState<MetricasComportamiento | null>(null);
  
  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const datos = await getMetricasComportamiento({
          periodo: 'mensual'
        });
        setMetricas(datos);
      } catch (error) {
        console.error('Error al cargar métricas:', error);
      }
    };
    
    cargarMetricas();
  }, []);
  
  if (!metricas) return <div>Cargando...</div>;
  
  return (
    <div>
      <h2>Métricas de Comportamiento</h2>
      
      <div>
        <h3>Transacciones</h3>
        <p>Total: {metricas.transacciones.total}</p>
        <p>Ingresos: {metricas.transacciones.ingresos}</p>
        <p>Gastos: {metricas.transacciones.gastos}</p>
        <p>Promedio diario: {metricas.transacciones.promedioDiario.toFixed(2)}</p>
      </div>
      
      <div>
        <h3>Gasto Promedio</h3>
        <p>Por transacción: {metricas.gastoPromedio.porTransaccion.toFixed(2)}€</p>
        <p>Por día: {metricas.gastoPromedio.porDia.toFixed(2)}€</p>
      </div>
      
      <div>
        <h3>Días Activos</h3>
        <p>Total: {metricas.diasActivos.total} días</p>
        <p>Con gastos: {metricas.diasActivos.conGastos} días</p>
        <p>Con ingresos: {metricas.diasActivos.conIngresos} días</p>
        <p>Porcentaje de actividad: {metricas.diasActivos.porcentajeActividad.toFixed(2)}%</p>
      </div>
      
      <div>
        <h3>Frecuencia de Categorías</h3>
        {metricas.frecuenciaCategorias.map(cat => (
          <div key={cat.categoria}>
            <p>{cat.categoria}: {cat.frecuencia} transacciones ({cat.porcentaje.toFixed(2)}%)</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔧 Funciones Helper Recomendadas

### Helper: Construir URL con Query Parameters

```typescript
const construirURL = (
  endpoint: string,
  params: Record<string, string | number | undefined>
): string => {
  const baseURL = 'http://localhost:4444';
  const url = new URL(`${baseURL}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });
  
  return url.toString();
};

// Uso
const url = construirURL('/api/estadisticas/resumen', {
  periodo: 'mensual',
  carteraId: '507f1f77bcf86cd799439011',
  fechaReferencia: '2024-11-20'
});
```

### Helper: Manejo de Errores

```typescript
const manejarError = async (response: Response): Promise<never> => {
  const error = await response.json();
  
  switch (response.status) {
    case 400:
      throw new Error(`Error de validación: ${error.error}`);
    case 401:
      // Redirigir al login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    case 404:
      throw new Error(error.error || 'Recurso no encontrado');
    case 500:
      throw new Error('Error del servidor. Por favor, intenta más tarde.');
    default:
      throw new Error(error.error || 'Error desconocido');
  }
};
```

### Helper: Obtener Token de Autenticación

```typescript
const obtenerToken = (): string => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  return token;
};
```

### Helper: Formatear Fechas

```typescript
const formatearFecha = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatearFechaCorta = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Uso
const fechaFormateada = formatearFecha('2024-11-20T00:00:00.000Z');
// Resultado: "20 de noviembre de 2024"
```

### Helper: Formatear Moneda

```typescript
const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(monto);
};

// Uso
const montoFormateado = formatearMoneda(1234.56);
// Resultado: "1.234,56 €"
```

---

## 📊 Ejemplos de Integración Completa

### Ejemplo 1: Dashboard de Estadísticas con React

```typescript
import { useState, useEffect } from 'react';
import {
  getResumenEstadisticas,
  getTendenciasTemporales,
  getAnalisisCategorias,
  getMetricasComportamiento
} from '../services/estadisticas.service';

interface EstadisticasDashboardProps {
  periodo: 'anual' | 'mensual' | 'semanal';
  carteraId?: string;
}

const EstadisticasDashboard: React.FC<EstadisticasDashboardProps> = ({
  periodo,
  carteraId
}) => {
  const [resumen, setResumen] = useState(null);
  const [tendencias, setTendencias] = useState(null);
  const [categorias, setCategorias] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [resumenData, tendenciasData, categoriasData, metricasData] = 
          await Promise.all([
            getResumenEstadisticas({ periodo, carteraId }),
            getTendenciasTemporales({ periodo, carteraId }),
            getAnalisisCategorias({ periodo, carteraId, limite: 5 }),
            getMetricasComportamiento({ periodo, carteraId })
          ]);
        
        setResumen(resumenData);
        setTendencias(tendenciasData);
        setCategorias(categoriasData);
        setMetricas(metricasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [periodo, carteraId]);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!resumen || !tendencias || !categorias || !metricas) return null;

  return (
    <div className="estadisticas-dashboard">
      <h1>Estadísticas - {periodo}</h1>
      
      {/* Resumen */}
      <section>
        <h2>Resumen</h2>
        <div>
          <p>Ingresos: {resumen.ingresos.total.toFixed(2)}€</p>
          <p>Gastos: {resumen.gastos.total.toFixed(2)}€</p>
          <p>Balance: {resumen.balance.total.toFixed(2)}€</p>
          <p>Tasa de ahorro: {resumen.tasaAhorro.toFixed(2)}%</p>
        </div>
      </section>
      
      {/* Tendencias */}
      <section>
        <h2>Tendencias</h2>
        <TendenciasChart datos={tendencias} />
        <div>
          <p>Cambio en ingresos: {tendencias.cambios.ingresos.porcentaje.toFixed(2)}%</p>
          <p>Cambio en gastos: {tendencias.cambios.gastos.porcentaje.toFixed(2)}%</p>
        </div>
      </section>
      
      {/* Categorías */}
      <section>
        <h2>Top 5 Categorías</h2>
        <CategoriasChart datos={categorias} />
      </section>
      
      {/* Métricas */}
      <section>
        <h2>Métricas de Comportamiento</h2>
        <MetricasComportamiento datos={metricas} />
      </section>
    </div>
  );
};

export default EstadisticasDashboard;
```

### Ejemplo 2: Servicio Centralizado

```typescript
// services/estadisticas.service.ts
const BASE_URL = 'http://localhost:4444/api/estadisticas';

const obtenerToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return token;
};

const realizarPeticion = async <T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<T> => {
  const token = obtenerToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  const result = await response.json();
  return result.data;
};

export const estadisticasService = {
  getResumen: (params: ResumenEstadisticasParams) =>
    realizarPeticion<ResumenEstadisticas>('/resumen', params),
  
  getTendencias: (params: TendenciasTemporalesParams) =>
    realizarPeticion<TendenciasTemporales>('/tendencias', params),
  
  getCategorias: (params: AnalisisCategoriasParams) =>
    realizarPeticion<AnalisisCategorias>('/categorias', params),
  
  getComportamiento: (params: MetricasComportamientoParams) =>
    realizarPeticion<MetricasComportamiento>('/comportamiento', params)
};
```

---

## ⚠️ Consideraciones Importantes

### 1. Manejo de Fechas

- **Formato de fecha de referencia**: Siempre usar formato `YYYY-MM-DD` (ISO 8601)
- **Zona horaria**: El backend trabaja en UTC, pero las fechas se muestran en la zona horaria local del usuario
- **Periodos semanales**: La semana comienza en lunes y termina en domingo

### 2. Filtrado por Cartera

- Si no se proporciona `carteraId`, se obtienen solo los datos **sin cartera** (`carteraId = null`)
- Si se proporciona `carteraId`, se valida que pertenezca al usuario antes de filtrar
- Para obtener datos de todas las carteras, se debe hacer una petición por cada cartera

### 3. Rendimiento

- Los endpoints usan aggregation pipelines de MongoDB para optimizar las consultas
- Se recomienda usar `Promise.all()` para cargar múltiples endpoints en paralelo
- Considerar implementar caché en el frontend para evitar peticiones repetidas

### 4. Validación de Datos

- Siempre validar que `periodo` sea uno de los valores permitidos antes de hacer la petición
- Validar que `carteraId` sea un ObjectId válido si se proporciona
- Validar que `fechaReferencia` tenga el formato correcto

### 5. Manejo de Errores

- Implementar manejo de errores específico para cada código de estado HTTP
- Mostrar mensajes de error amigables al usuario
- Registrar errores para debugging en desarrollo

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Resumen mensual sin cartera
```typescript
const resumen = await getResumenEstadisticas({
  periodo: 'mensual'
});
// Verificar: Datos solo de registros con carteraId = null
```

### Test 2: Resumen semanal con cartera
```typescript
const resumen = await getResumenEstadisticas({
  periodo: 'semanal',
  carteraId: '507f1f77bcf86cd799439011'
});
// Verificar: Datos solo de la cartera especificada
```

### Test 3: Tendencias con periodo anterior
```typescript
const tendencias = await getTendenciasTemporales({
  periodo: 'mensual'
});
// Verificar: Comparativa correcta entre mes actual y mes anterior
```

### Test 4: Análisis de categorías limitado
```typescript
const categorias = await getAnalisisCategorias({
  periodo: 'anual',
  limite: 5,
  tipo: 'gastos'
});
// Verificar: Solo top 5 categorías de gastos
```

### Test 5: Validación de cartera inválida
```typescript
try {
  await getResumenEstadisticas({
    periodo: 'mensual',
    carteraId: 'invalid'
  });
} catch (error) {
  // Verificar: Error 404 con mensaje apropiado
}
```

---

## 📞 Contacto y Referencias

Si hay dudas sobre la implementación, revisar:
- `int_frontend/dashboard-integracion.md` - Estructura similar de dashboard
- `int_frontend/carteras-integracion.md` - Manejo de carteras
- Modelos: `Ingreso`, `Gasto`, `Cartera`

---

**Última actualización:** 2024-11-22
**Prioridad:** 🟢 ALTA - Nueva funcionalidad crítica para análisis financiero

