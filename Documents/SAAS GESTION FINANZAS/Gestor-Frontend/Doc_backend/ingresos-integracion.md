# Integración Frontend: Endpoints de Ingresos

## Objetivo
Este documento describe cómo integrar los endpoints de ingresos del backend con el frontend, incluyendo el sistema completo de gestión de ingresos mensuales, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Ingresos

El sistema de ingresos funciona de la siguiente manera:

1. **Obtener ingresos del mes** → Ver todos los ingresos de un mes específico
2. **Crear ingreso** → Registrar un nuevo ingreso
3. **Actualizar ingreso** → Modificar un ingreso existente
4. **Eliminar ingreso** → Eliminar un ingreso específico
5. **Obtener total del mes** → Calcular el total de ingresos de un mes
6. **Obtener por categoría** → Filtrar ingresos por categoría en un mes específico

**Importante:** Los usuarios solo pueden acceder a sus propios ingresos. Todas las operaciones están protegidas por autenticación.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Ingresos

### 1. Obtener Ingresos del Mes

**Endpoint:**
```
GET /api/ingresos/:mes
```

**Descripción:** Obtiene todos los ingresos del usuario autenticado para un mes específico, ordenados por fecha ascendente.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español (`enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`)

**Ejemplos de uso:**
```
GET /api/ingresos/noviembre
GET /api/ingresos/diciembre
GET /api/ingresos/enero
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "descripcion": "Salario mensual",
      "monto": 2500.00,
      "fecha": "2024-11-01T10:00:00.000Z",
      "categoria": "Salario",
      "mes": "noviembre",
      "createdAt": "2024-11-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "descripcion": "Freelance",
      "monto": 500.00,
      "fecha": "2024-11-15T14:30:00.000Z",
      "categoria": "Trabajo",
      "mes": "noviembre",
      "createdAt": "2024-11-15T14:30:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único del ingreso
- `userId`: ID del usuario propietario
- `descripcion`: Descripción del ingreso
- `monto`: Monto del ingreso (número)
- `fecha`: Fecha del ingreso en formato ISO
- `categoria`: Categoría del ingreso
- `mes`: Mes del ingreso (en español, minúsculas)
- `createdAt`: Fecha de creación en formato ISO

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const getIngresosByMes = async (mes: string): Promise<Ingreso[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/ingresos/${mes}`,
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
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener ingresos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Crear Nuevo Ingreso

**Endpoint:**
```
POST /api/ingresos
```

**Descripción:** Crea un nuevo ingreso para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "descripcion": "Salario mensual",
  "monto": 2500.00,
  "fecha": "2024-11-01T10:00:00.000Z",
  "categoria": "Salario",
  "mes": "noviembre"
}
```

**Campos del request:**
- `descripcion` (string, requerido): Descripción del ingreso (no puede estar vacío)
- `monto` (number, requerido): Monto del ingreso (debe ser mayor a 0)
- `fecha` (string, requerido): Fecha del ingreso (ISO string o Date)
- `categoria` (string, requerido): Categoría del ingreso (no puede estar vacío)
- `mes` (string, requerido): Mes en español (uno de los 12 meses válidos)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Ingreso creado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "descripcion": "Salario mensual",
    "monto": 2500.00,
    "fecha": "2024-11-01T10:00:00.000Z",
    "categoria": "Salario",
    "mes": "noviembre",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: Campos requeridos faltantes, mes inválido, monto inválido, o fecha inválida
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreateIngresoRequest {
  descripcion: string;
  monto: number;
  fecha: string | Date;
  categoria: string;
  mes: string;
}

const createIngreso = async (data: CreateIngresoRequest): Promise<Ingreso> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/ingresos',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        fecha: data.fecha instanceof Date ? data.fecha.toISOString() : data.fecha
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    throw new Error(error.error || 'Error al crear ingreso');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Actualizar Ingreso Existente

**Endpoint:**
```
PUT /api/ingresos/:id
```

**Descripción:** Actualiza un ingreso existente del usuario autenticado. Solo se actualizan los campos proporcionados.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, requerido): ID del ingreso a actualizar

**Request Body (todos los campos son opcionales):**
```json
{
  "descripcion": "Salario mensual actualizado",
  "monto": 2600.00,
  "fecha": "2024-11-01T10:00:00.000Z",
  "categoria": "Salario",
  "mes": "noviembre"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ingreso actualizado exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "descripcion": "Salario mensual actualizado",
    "monto": 2600.00,
    "fecha": "2024-11-01T10:00:00.000Z",
    "categoria": "Salario",
    "mes": "noviembre",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID inválido, campos inválidos, mes inválido, monto inválido, o fecha inválida
- `401`: Usuario no autenticado
- `404`: Ingreso no encontrado o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface UpdateIngresoRequest {
  descripcion?: string;
  monto?: number;
  fecha?: string | Date;
  categoria?: string;
  mes?: string;
}

const updateIngreso = async (
  id: string,
  data: UpdateIngresoRequest
): Promise<Ingreso> => {
  const token = localStorage.getItem('token');
  
  const body: any = { ...data };
  if (data.fecha instanceof Date) {
    body.fecha = data.fecha.toISOString();
  }
  
  const response = await fetch(
    `http://localhost:4444/api/ingresos/${id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    if (response.status === 404) {
      throw new Error('Ingreso no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar ingreso');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Eliminar Ingreso

**Endpoint:**
```
DELETE /api/ingresos/:id
```

**Descripción:** Elimina un ingreso específico del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID del ingreso a eliminar

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ingreso eliminado exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Usuario no autenticado
- `404`: Ingreso no encontrado o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const deleteIngreso = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/ingresos/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de ingreso inválido');
    }
    if (response.status === 404) {
      throw new Error('Ingreso no encontrado');
    }
    throw new Error('Error al eliminar ingreso');
  }
};
```

---

### 5. Obtener Total de Ingresos del Mes

**Endpoint:**
```
GET /api/ingresos/:mes/total
```

**Descripción:** Obtiene el total de ingresos del usuario para un mes específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "total": 3000.00
  }
}
```

**Campos de respuesta:**
- `mes`: Mes consultado
- `total`: Suma total de todos los ingresos del mes

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface TotalIngresosResponse {
  mes: string;
  total: number;
}

const getTotalIngresosByMes = async (
  mes: string
): Promise<TotalIngresosResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/ingresos/${mes}/total`,
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
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener total de ingresos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. Obtener Ingresos por Categoría

**Endpoint:**
```
GET /api/ingresos/:mes/categoria/:categoria
```

**Descripción:** Obtiene todos los ingresos del usuario filtrados por mes y categoría específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `mes` (string, requerido): Mes en español
- `categoria` (string, requerido): Categoría del ingreso

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "descripcion": "Salario mensual",
      "monto": 2500.00,
      "fecha": "2024-11-01T10:00:00.000Z",
      "categoria": "Salario",
      "mes": "noviembre",
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ],
  "total": 2500.00
}
```

**Campos de respuesta:**
- `data`: Array de ingresos filtrados
- `total`: Suma total de los ingresos filtrados

**Errores posibles:**
- `400`: Mes inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface IngresosByCategoriaResponse {
  data: Ingreso[];
  total: number;
}

const getIngresosByCategoria = async (
  mes: string,
  categoria: string
): Promise<IngresosByCategoriaResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/ingresos/${mes}/categoria/${encodeURIComponent(categoria)}`,
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
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener ingresos por categoría');
  }

  const result = await response.json();
  return {
    data: result.data,
    total: result.total
  };
};
```

---

## 🔧 Funciones Helper Completas

Aquí tienes un archivo completo con todas las funciones helper para usar en tu frontend:

```typescript
// ingresos.service.ts

const API_BASE_URL = 'http://localhost:4444';

// Tipos
export interface Ingreso {
  _id: string;
  userId: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  mes: string;
  createdAt: string;
}

export type MesValido = 
  | 'enero' 
  | 'febrero' 
  | 'marzo' 
  | 'abril' 
  | 'mayo' 
  | 'junio' 
  | 'julio' 
  | 'agosto' 
  | 'septiembre' 
  | 'octubre' 
  | 'noviembre' 
  | 'diciembre';

export interface CreateIngresoRequest {
  descripcion: string;
  monto: number;
  fecha: string | Date;
  categoria: string;
  mes: MesValido;
}

export interface UpdateIngresoRequest {
  descripcion?: string;
  monto?: number;
  fecha?: string | Date;
  categoria?: string;
  mes?: MesValido;
}

export interface TotalIngresosResponse {
  mes: string;
  total: number;
}

export interface IngresosByCategoriaResponse {
  data: Ingreso[];
  total: number;
}

// Helper para obtener token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper para hacer requests
const makeRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

// 1. Obtener ingresos del mes
export const getIngresosByMes = async (mes: MesValido): Promise<Ingreso[]> => {
  const response = await makeRequest(`/api/ingresos/${mes}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener ingresos');
  }

  const result = await response.json();
  return result.data;
};

// 2. Crear nuevo ingreso
export const createIngreso = async (
  data: CreateIngresoRequest
): Promise<Ingreso> => {
  const body: any = {
    ...data,
    fecha: data.fecha instanceof Date ? data.fecha.toISOString() : data.fecha,
  };

  const response = await makeRequest('/api/ingresos', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    throw new Error(error.error || 'Error al crear ingreso');
  }

  const result = await response.json();
  return result.data;
};

// 3. Actualizar ingreso
export const updateIngreso = async (
  id: string,
  data: UpdateIngresoRequest
): Promise<Ingreso> => {
  const body: any = { ...data };
  if (data.fecha instanceof Date) {
    body.fecha = data.fecha.toISOString();
  }

  const response = await makeRequest(`/api/ingresos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    if (response.status === 404) {
      throw new Error('Ingreso no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar ingreso');
  }

  const result = await response.json();
  return result.data;
};

// 4. Eliminar ingreso
export const deleteIngreso = async (id: string): Promise<void> => {
  const response = await makeRequest(`/api/ingresos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de ingreso inválido');
    }
    if (response.status === 404) {
      throw new Error('Ingreso no encontrado');
    }
    throw new Error('Error al eliminar ingreso');
  }
};

// 5. Obtener total de ingresos del mes
export const getTotalIngresosByMes = async (
  mes: MesValido
): Promise<TotalIngresosResponse> => {
  const response = await makeRequest(`/api/ingresos/${mes}/total`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener total de ingresos');
  }

  const result = await response.json();
  return result.data;
};

// 6. Obtener ingresos por categoría
export const getIngresosByCategoria = async (
  mes: MesValido,
  categoria: string
): Promise<IngresosByCategoriaResponse> => {
  const response = await makeRequest(
    `/api/ingresos/${mes}/categoria/${encodeURIComponent(categoria)}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Mes inválido');
    }
    throw new Error(error.error || 'Error al obtener ingresos por categoría');
  }

  const result = await response.json();
  return {
    data: result.data,
    total: result.total,
  };
};
```

---

## 💻 Ejemplo de Uso en React

Aquí tienes un ejemplo completo de cómo usar estas funciones en un componente React:

```typescript
// IngresosList.tsx

import React, { useState, useEffect } from 'react';
import {
  getIngresosByMes,
  createIngreso,
  updateIngreso,
  deleteIngreso,
  getTotalIngresosByMes,
  getIngresosByCategoria,
  Ingreso,
  MesValido
} from './services/ingresos.service';

const IngresosList: React.FC = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState<MesValido>('noviembre');
  const [total, setTotal] = useState<number>(0);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');

  useEffect(() => {
    cargarIngresos();
  }, [mes, categoriaFiltro]);

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      let data: Ingreso[];
      
      if (categoriaFiltro) {
        const result = await getIngresosByCategoria(mes, categoriaFiltro);
        data = result.data;
        setTotal(result.total);
      } else {
        data = await getIngresosByMes(mes);
        const totalResult = await getTotalIngresosByMes(mes);
        setTotal(totalResult.total);
      }
      
      setIngresos(data);
    } catch (error) {
      console.error('Error al cargar ingresos:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const nuevoIngreso = {
        descripcion: 'Nuevo ingreso',
        monto: 1000,
        fecha: new Date(),
        categoria: 'Otros',
        mes: mes
      };
      
      await createIngreso(nuevoIngreso);
      cargarIngresos(); // Recargar lista
    } catch (error) {
      console.error('Error al crear ingreso:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateIngreso(id, {
        monto: 2000
      });
      cargarIngresos(); // Recargar lista
    } catch (error) {
      console.error('Error al actualizar ingreso:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ingreso?')) {
      return;
    }
    
    try {
      await deleteIngreso(id);
      cargarIngresos(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (loading) {
    return <div>Cargando ingresos...</div>;
  }

  return (
    <div className="ingresos-container">
      <div className="filtros">
        <select 
          value={mes} 
          onChange={(e) => setMes(e.target.value as MesValido)}
        >
          <option value="enero">Enero</option>
          <option value="febrero">Febrero</option>
          <option value="marzo">Marzo</option>
          <option value="abril">Abril</option>
          <option value="mayo">Mayo</option>
          <option value="junio">Junio</option>
          <option value="julio">Julio</option>
          <option value="agosto">Agosto</option>
          <option value="septiembre">Septiembre</option>
          <option value="octubre">Octubre</option>
          <option value="noviembre">Noviembre</option>
          <option value="diciembre">Diciembre</option>
        </select>
        
        <input
          type="text"
          placeholder="Filtrar por categoría"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        />
        
        <button onClick={handleCreate}>Crear Ingreso</button>
      </div>

      <div className="total">
        <h2>Total del mes: ${total.toFixed(2)}</h2>
      </div>

      <div className="ingresos-list">
        {ingresos.length === 0 ? (
          <p>No hay ingresos para este mes</p>
        ) : (
          ingresos.map((ingreso) => (
            <div key={ingreso._id} className="ingreso-item">
              <div className="ingreso-header">
                <h3>{ingreso.descripcion}</h3>
                <span className="monto">${ingreso.monto.toFixed(2)}</span>
              </div>
              <p>Categoría: {ingreso.categoria}</p>
              <p>Fecha: {new Date(ingreso.fecha).toLocaleDateString()}</p>
              <div className="ingreso-actions">
                <button onClick={() => handleUpdate(ingreso._id)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(ingreso._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IngresosList;
```

---

## 📅 Meses Válidos

El sistema acepta los siguientes meses (en español, minúsculas):

1. `enero`
2. `febrero`
3. `marzo`
4. `abril`
5. `mayo`
6. `junio`
7. `julio`
8. `agosto`
9. `septiembre`
10. `octubre`
11. `noviembre`
12. `diciembre`

**Nota:** El backend normaliza automáticamente los meses a minúsculas, pero es recomendable enviarlos en minúsculas desde el frontend.

---

## ✅ Checklist de Integración

- [ ] Instalar dependencias necesarias (si usas fetch, axios, etc.)
- [ ] Configurar la URL base del API
- [ ] Implementar el sistema de autenticación (token JWT)
- [ ] Crear el servicio de ingresos con todas las funciones
- [ ] Crear componentes de UI para mostrar ingresos
- [ ] Implementar selector de mes
- [ ] Implementar filtro por categoría
- [ ] Implementar formulario de creación/edición
- [ ] Mostrar total del mes
- [ ] Manejar estados de carga y errores
- [ ] Probar todos los endpoints
- [ ] Validar formatos de fecha y monto

---

## 🔍 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`

2. **Ordenamiento**: Los ingresos siempre se devuelven ordenados por fecha ascendente (más antiguos primero)

3. **Validación de Mes**: El backend valida que el mes sea uno de los 12 meses válidos en español

4. **Validación de Monto**: El monto debe ser un número mayor a 0

5. **Validación de Fecha**: La fecha debe ser una fecha válida (ISO string o Date)

6. **Seguridad**: Los usuarios solo pueden acceder a sus propios ingresos. El backend valida automáticamente la propiedad

7. **Normalización**: El backend normaliza automáticamente:
   - Mes a minúsculas
   - Descripción y categoría con trim (elimina espacios al inicio y final)

8. **Manejo de Errores**: Siempre maneja los errores apropiadamente y muestra mensajes claros al usuario

9. **Formato de Fechas**: Las fechas se envían y reciben en formato ISO (ISO 8601)

10. **Actualización Parcial**: Al actualizar un ingreso, solo se actualizan los campos proporcionados. Los demás campos se mantienen igual

---

## 📚 Recursos Adicionales

- Documentación del backend: `integracion_endpoints/ingresos.md`
- Modelo de datos: `src/models/Ingreso.model.ts`
- Controlador: `src/controllers/ingreso.controller.ts`
- Rutas: `src/routes/ingreso.routes.ts`

---

## 🎨 Ejemplo de Formulario de Creación

```typescript
// IngresoForm.tsx

import React, { useState } from 'react';
import { createIngreso, MesValido } from './services/ingresos.service';

const IngresoForm: React.FC<{ mes: MesValido; onSuccess: () => void }> = ({
  mes,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIngreso({
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        fecha: new Date(formData.fecha),
        categoria: formData.categoria,
        mes: mes
      });
      
      // Limpiar formulario
      setFormData({
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: ''
      });
      
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear ingreso');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Descripción:</label>
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Monto:</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.monto}
          onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Fecha:</label>
        <input
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label>Categoría:</label>
        <input
          type="text"
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          required
        />
      </div>
      
      <button type="submit">Crear Ingreso</button>
    </form>
  );
};

export default IngresoForm;
```

---

¡Listo para integrar! 🚀

