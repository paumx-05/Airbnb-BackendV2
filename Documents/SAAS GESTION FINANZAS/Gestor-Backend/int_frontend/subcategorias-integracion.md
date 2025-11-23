# Integración Frontend: Sistema de Subcategorías

## Objetivo
Este documento describe cómo integrar el sistema de **subcategorías** del backend con el frontend, permitiendo a los usuarios organizar sus categorías de gastos e ingresos de manera más granular y detallada.

---

## 🎯 Características Principales

- ✅ **Subcategorías opcionales** por categoría (máximo 20)
- ✅ **Retrocompatibilidad** total con datos existentes
- ✅ **Validación automática** de subcategorías duplicadas
- ✅ **Análisis estadístico** con drill-down por subcategorías
- ✅ **Filtrado avanzado** en reportes y estadísticas
- ✅ **Sin sobreingeniería** - implementación simple y escalable

---

## 📋 Cambios en los Endpoints Existentes

### 1. GET /api/categorias

**Cambio:** Ahora incluye el campo `subcategorias` en la respuesta.

**Response (200 OK):**
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
    },
    {
      "_id": "674150c8e4b0a1234567890d",
      "userId": "674150c8e4b0a1234567890b",
      "nombre": "Salario",
      "tipo": "ingresos",
      "subcategorias": [],
      "createdAt": "2024-11-23T10:40:00.000Z"
    }
  ]
}
```

**Campos nuevos:**
- `subcategorias` (array de strings, opcional): Array de subcategorías asociadas a la categoría. Puede estar vacío `[]` si no tiene subcategorías.

---

### 2. POST /api/categorias

**Cambio:** Ahora acepta el campo opcional `subcategorias` en el body.

**Request Body:**
```json
{
  "nombre": "Alimentación",
  "tipo": "gastos",
  "subcategorias": ["Supermercado", "Restaurantes", "Comida rápida"]
}
```

**Validaciones:**
- `subcategorias` debe ser un array (opcional)
- Máximo 20 subcategorías por categoría
- Las subcategorías duplicadas se eliminan automáticamente
- Las subcategorías vacías se filtran automáticamente

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "674150c8e4b0a1234567890a",
    "userId": "674150c8e4b0a1234567890b",
    "nombre": "Alimentación",
    "tipo": "gastos",
    "subcategorias": ["Supermercado", "Restaurantes", "Comida rápida"],
    "createdAt": "2024-11-23T10:30:00.000Z"
  },
  "message": "Categoría creada exitosamente"
}
```

**Errores posibles:**
- `400`: Máximo 20 subcategorías permitidas
- `400`: Subcategorías debe ser un array
- `400`: Todas las subcategorías deben ser textos válidos

**Ejemplo de implementación:**
```typescript
interface Categoria {
  _id: string;
  userId: string;
  nombre: string;
  tipo: 'gastos' | 'ingresos' | 'ambos';
  subcategorias: string[];
  createdAt: string;
}

const createCategoria = async (
  nombre: string,
  tipo: 'gastos' | 'ingresos' | 'ambos',
  subcategorias?: string[]
): Promise<Categoria> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/categorias',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        tipo,
        subcategorias: subcategorias || []
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear categoría');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. PUT /api/categorias/:id

**Cambio:** Ahora acepta el campo opcional `subcategorias` en el body para actualizar las subcategorías de una categoría existente.

**Request Body:**
```json
{
  "subcategorias": ["Supermercado", "Restaurantes", "Comida rápida", "Delivery"]
}
```

**Nota:** Puedes actualizar solo las subcategorías sin modificar otros campos.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "674150c8e4b0a1234567890a",
    "userId": "674150c8e4b0a1234567890b",
    "nombre": "Alimentación",
    "tipo": "gastos",
    "subcategorias": ["Supermercado", "Restaurantes", "Comida rápida", "Delivery"],
    "createdAt": "2024-11-23T10:30:00.000Z"
  },
  "message": "Categoría actualizada exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const updateCategoriaSubcategorias = async (
  categoriaId: string,
  subcategorias: string[]
): Promise<Categoria> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/categorias/${categoriaId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subcategorias })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar categoría');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. POST /api/gastos

**Cambio:** Ahora acepta el campo opcional `subcategoria` en el body.

**Request Body:**
```json
{
  "descripcion": "Compra en Mercadona",
  "monto": 45.50,
  "fecha": "2024-11-23T10:00:00.000Z",
  "categoria": "Alimentación",
  "subcategoria": "Supermercado",
  "mes": "noviembre"
}
```

**Validaciones:**
- Si se proporciona `subcategoria`, debe pertenecer a la categoría especificada
- Si la categoría no tiene subcategorías definidas, se acepta cualquier subcategoría
- `subcategoria` es opcional (puede ser `null` o no enviarse)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "674150c8e4b0a1234567890e",
    "userId": "674150c8e4b0a1234567890b",
    "descripcion": "Compra en Mercadona",
    "monto": 45.50,
    "fecha": "2024-11-23T10:00:00.000Z",
    "categoria": "Alimentación",
    "subcategoria": "Supermercado",
    "mes": "noviembre",
    "dividido": [],
    "carteraId": null,
    "createdAt": "2024-11-23T10:45:00.000Z"
  },
  "message": "Gasto creado exitosamente"
}
```

**Errores posibles:**
- `400`: La subcategoría "X" no pertenece a la categoría "Y"

**Ejemplo de implementación:**
```typescript
interface Gasto {
  _id: string;
  userId: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  subcategoria: string; // String vacío "" si no tiene subcategoría
  mes: string;
  dividido: Array<{
    amigoId: string;
    amigoNombre: string;
    montoDividido: number;
    pagado: boolean;
  }>;
  carteraId: string | null;
  createdAt: string;
}

const createGasto = async (
  descripcion: string,
  monto: number,
  fecha: string,
  categoria: string,
  mes: string,
  subcategoria?: string, // String vacío "" si no tiene subcategoría
  carteraId?: string | null
): Promise<Gasto> => {
  const token = localStorage.getItem('token');
  
  const body: any = {
    descripcion,
    monto,
    fecha,
    categoria,
    mes
  };

  if (subcategoria !== undefined && subcategoria !== null && subcategoria.trim().length > 0) {
    body.subcategoria = subcategoria;
  }

  if (carteraId) {
    body.carteraId = carteraId;
  }

  const response = await fetch(
    'http://localhost:4444/api/gastos',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear gasto');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. PUT /api/gastos/:id

**Cambio:** Ahora acepta el campo opcional `subcategoria` en el body.

**Request Body:**
```json
{
  "subcategoria": "Restaurantes"
}
```

**Nota:** Puedes actualizar solo la subcategoría sin modificar otros campos. Para eliminar la subcategoría, envía un string vacío `""`.

**Ejemplo de implementación:**
```typescript
const updateGastoSubcategoria = async (
  gastoId: string,
  subcategoria: string // String vacío "" para eliminar subcategoría
): Promise<Gasto> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/gastos/${gastoId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subcategoria })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar gasto');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. POST /api/ingresos

**Cambio:** Ahora acepta el campo opcional `subcategoria` en el body.

**Request Body:**
```json
{
  "descripcion": "Salario mensual",
  "monto": 2500.00,
  "fecha": "2024-11-01T10:00:00.000Z",
  "categoria": "Salario",
  "subcategoria": "", // String vacío si no tiene subcategoría
  "mes": "noviembre"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "674150c8e4b0a1234567890f",
    "userId": "674150c8e4b0a1234567890b",
    "descripcion": "Salario mensual",
    "monto": 2500.00,
    "fecha": "2024-11-01T10:00:00.000Z",
    "categoria": "Salario",
    "subcategoria": "", // String vacío si no tiene subcategoría
    "mes": "noviembre",
    "carteraId": null,
    "createdAt": "2024-11-23T10:50:00.000Z"
  },
  "message": "Ingreso creado exitosamente"
}
```

---

### 7. PUT /api/ingresos/:id

**Cambio:** Ahora acepta el campo opcional `subcategoria` en el body.

**Request Body:**
```json
{
  "subcategoria": "Freelance"
}
```

---

### 8. GET /api/estadisticas/categorias

**Cambio:** Ahora incluye análisis de subcategorías dentro de cada categoría.

**Query Parameters:**
- `periodo` (string, requerido): `'anual'`, `'mensual'` o `'semanal'`
- `carteraId` (string, opcional): ID de la cartera
- `fechaReferencia` (string, opcional): Fecha de referencia en formato ISO
- `tipo` (string, opcional): `'gastos'`, `'ingresos'` o `'ambos'` (default: `'ambos'`)
- `limite` (string, opcional): Número máximo de categorías a retornar (default: `'10'`)

**Response (200 OK):**
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

**Campos nuevos en cada categoría:**
- `subcategorias` (array, opcional): Array de análisis por subcategoría. Solo aparece si la categoría tiene transacciones con subcategorías.
  - `nombre`: Nombre de la subcategoría
  - `monto`: Monto total de la subcategoría
  - `porcentaje`: Porcentaje del monto de la subcategoría respecto al total de la categoría
  - `cantidad`: Número de transacciones en esta subcategoría
  - `promedio`: Promedio por transacción

**Nota:** Si una categoría no tiene subcategorías o no hay transacciones con subcategorías, el campo `subcategorias` no aparecerá en la respuesta (o será `undefined`).

**Ejemplo de implementación:**
```typescript
interface SubcategoriaAnalisis {
  nombre: string;
  monto: number;
  porcentaje: number;
  cantidad: number;
  promedio: number;
}

interface CategoriaAnalisis {
  categoria: string;
  monto: number;
  porcentaje: number;
  cantidad: number;
  promedio: number;
  tendencia: string;
  subcategorias?: SubcategoriaAnalisis[];
}

interface AnalisisCategorias {
  periodo: string;
  categoriasGastos: CategoriaAnalisis[];
  categoriasIngresos: CategoriaAnalisis[];
  totalGastos: number;
  totalIngresos: number;
}

const getAnalisisCategorias = async (
  periodo: 'anual' | 'mensual' | 'semanal',
  tipo: 'gastos' | 'ingresos' | 'ambos' = 'ambos',
  limite: number = 10,
  carteraId?: string,
  fechaReferencia?: string
): Promise<AnalisisCategorias> => {
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams({
    periodo,
    tipo,
    limite: limite.toString()
  });

  if (carteraId) {
    params.append('carteraId', carteraId);
  }

  if (fechaReferencia) {
    params.append('fechaReferencia', fechaReferencia);
  }

  const response = await fetch(
    `http://localhost:4444/api/estadisticas/categorias?${params.toString()}`,
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
    throw new Error(error.error || 'Error al obtener análisis de categorías');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔍 Endpoints Adicionales (Opcionales)

### GET /api/gastos/categoria/:categoria/subcategoria/:subcategoria

**Descripción:** Obtiene todos los gastos filtrados por categoría y subcategoría específicas.

**Path Parameters:**
- `categoria` (string, requerido): Nombre de la categoría
- `subcategoria` (string, requerido): Nombre de la subcategoría

**Query Parameters:**
- `mes` (string, opcional): Mes para filtrar (ej: `'noviembre'`)
- `carteraId` (string, opcional): ID de la cartera

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674150c8e4b0a1234567890e",
      "userId": "674150c8e4b0a1234567890b",
      "descripcion": "Compra en Mercadona",
      "monto": 45.50,
      "fecha": "2024-11-23T10:00:00.000Z",
      "categoria": "Alimentación",
      "subcategoria": "Supermercado",
      "mes": "noviembre",
      "dividido": [],
      "carteraId": null,
      "createdAt": "2024-11-23T10:45:00.000Z"
    }
  ],
  "total": 45.50,
  "count": 1
}
```

**Nota:** Este endpoint puede no estar implementado aún. Verifica con el backend si está disponible.

---

## 📊 Ejemplos de Uso Completo

### Ejemplo 1: Crear categoría con subcategorías

```typescript
// Crear categoría con subcategorías
const nuevaCategoria = await createCategoria(
  'Alimentación',
  'gastos',
  ['Supermercado', 'Restaurantes', 'Comida rápida', 'Delivery']
);

console.log('Categoría creada:', nuevaCategoria);
// Output: { _id: "...", nombre: "Alimentación", subcategorias: ["Supermercado", "Restaurantes", "Comida rápida", "Delivery"], ... }
```

### Ejemplo 2: Crear gasto con subcategoría

```typescript
// Obtener categorías para validar subcategorías disponibles
const categorias = await getCategorias();
const categoriaAlimentacion = categorias.find(c => c.nombre === 'Alimentación');

if (categoriaAlimentacion && categoriaAlimentacion.subcategorias.length > 0) {
  // Crear gasto con subcategoría válida
  const nuevoGasto = await createGasto(
    'Compra en Mercadona',
    45.50,
    new Date().toISOString(),
    'Alimentación',
    'noviembre',
    'Supermercado' // Subcategoría válida
  );
  
  console.log('Gasto creado:', nuevoGasto);
} else {
  // Crear gasto sin subcategoría
  const nuevoGasto = await createGasto(
    'Compra general',
    45.50,
    new Date().toISOString(),
    'Alimentación',
    'noviembre'
  );
}
```

### Ejemplo 3: Actualizar subcategorías de una categoría

```typescript
// Agregar nuevas subcategorías a una categoría existente
const categoriaActualizada = await updateCategoriaSubcategorias(
  categoriaId,
  ['Supermercado', 'Restaurantes', 'Comida rápida', 'Delivery', 'Cafetería']
);

console.log('Categoría actualizada:', categoriaActualizada);
```

### Ejemplo 4: Obtener análisis con subcategorías

```typescript
// Obtener análisis mensual con subcategorías
const analisis = await getAnalisisCategorias('mensual', 'gastos', 10);

analisis.categoriasGastos.forEach(categoria => {
  console.log(`Categoría: ${categoria.categoria} - Total: €${categoria.monto}`);
  
  if (categoria.subcategorias && categoria.subcategorias.length > 0) {
    console.log('  Subcategorías:');
    categoria.subcategorias.forEach(sub => {
      console.log(`    - ${sub.nombre}: €${sub.monto} (${sub.porcentaje}%)`);
    });
  }
});
```

---

## ✅ Validaciones Importantes

### Validaciones del Backend

1. **Máximo 20 subcategorías por categoría**
   - Si intentas crear/actualizar una categoría con más de 20 subcategorías, recibirás un error `400`

2. **Subcategorías duplicadas**
   - El backend elimina automáticamente duplicados
   - No necesitas filtrar duplicados en el frontend

3. **Subcategorías vacías**
   - El backend filtra automáticamente subcategorías vacías
   - No necesitas validar strings vacíos en el frontend

4. **Validación de subcategoría en gastos/ingresos**
   - Si proporcionas una subcategoría que no pertenece a la categoría, recibirás un error `400`
   - Si la categoría no tiene subcategorías definidas, se acepta cualquier subcategoría

### Validaciones Recomendadas en el Frontend

1. **Validar límite de 20 subcategorías**
   ```typescript
   if (subcategorias.length > 20) {
     alert('Máximo 20 subcategorías permitidas');
     return;
   }
   ```

2. **Validar subcategoría antes de crear gasto/ingreso**
   ```typescript
   const categoria = categorias.find(c => c.nombre === categoriaNombre);
   if (categoria && categoria.subcategorias.length > 0) {
     if (!categoria.subcategorias.includes(subcategoria)) {
       alert(`La subcategoría "${subcategoria}" no pertenece a la categoría "${categoriaNombre}"`);
       return;
     }
   }
   ```

---

## 🔄 Retrocompatibilidad

### Datos Existentes

- **Categorías existentes sin subcategorías**: Funcionan normalmente, el campo `subcategorias` será un array vacío `[]`
- **Gastos/Ingresos existentes sin subcategoría**: Funcionan normalmente, el campo `subcategoria` será `null`
- **No se requiere migración**: Todos los datos existentes siguen funcionando sin cambios

### Código Frontend Existente

- Si tu código no maneja `subcategorias` o `subcategoria`, seguirá funcionando
- Los campos son opcionales, así que no romperán tu código existente
- Puedes actualizar gradualmente tu código para usar subcategorías

---

## 📝 Notas Importantes

1. **Retrocompatibilidad**: Todas las transacciones existentes funcionarán sin modificación, ya que `subcategoria` es opcional

2. **Performance**: Los índices compuestos aseguran consultas rápidas incluso con millones de registros

3. **Validación**: La validación en el backend es no-bloqueante para evitar problemas si la categoría no existe

4. **Escalabilidad**: El límite de 20 subcategorías previene problemas de performance y UX

5. **Flexibilidad**: Los usuarios pueden añadir/eliminar subcategorías sin afectar transacciones existentes

---

## 🎯 Próximos Pasos

Una vez implementado en el frontend:

1. ✅ Backend ya está implementado y funcionando
2. 🔄 Probar integración completa frontend-backend
3. 📊 Verificar que las estadísticas se muestran correctamente con subcategorías
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

