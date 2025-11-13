# Integración Frontend: API de Gastos

## 📋 Información General

Este documento describe cómo integrar las rutas de gastos del backend con el frontend. Todas las rutas requieren autenticación mediante JWT.

---

## 🔐 Autenticación

Todas las rutas de gastos requieren un token JWT válido. El token debe enviarse en el header `Authorization` con el formato:

```
Authorization: Bearer <token>
```

**Ejemplo:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🌐 Base URL

```
http://localhost:4444
```

O la URL de producción cuando esté disponible.

---

## 📡 Endpoints Disponibles

### 1. Obtener Gastos por Mes

**Endpoint:** `GET /api/gastos/:mes`

**Descripción:** Obtiene todos los gastos de un mes específico del usuario autenticado, ordenados por fecha (más antiguos primero).

**Parámetros de URL:**
- `mes` (string, requerido): Nombre del mes en minúsculas
  - Valores válidos: `enero`, `febrero`, `marzo`, `abril`, `mayo`, `junio`, `julio`, `agosto`, `septiembre`, `octubre`, `noviembre`, `diciembre`

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```javascript
// JavaScript/TypeScript
const mes = 'noviembre';
const response = await fetch(`http://localhost:4444/api/gastos/${mes}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "descripcion": "Compra de supermercado",
      "monto": 125.50,
      "fecha": "2024-11-15T10:30:00.000Z",
      "categoria": "Alimentación",
      "mes": "noviembre",
      "dividido": [],
      "createdAt": "2024-11-15T10:30:00.000Z"
    }
  ],
  "total": 125.50
}
```

**Errores posibles:**
- `400`: Mes inválido
- `401`: Token inválido o expirado
- `500`: Error del servidor

---

### 2. Crear Gasto

**Endpoint:** `POST /api/gastos`

**Descripción:** Crea un nuevo gasto para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "descripcion": "Compra de supermercado",
  "monto": 125.50,
  "fecha": "2024-11-15",
  "categoria": "Alimentación",
  "mes": "noviembre",  // Opcional: se extrae de la fecha si no se proporciona
  "dividido": [  // Opcional: array de amigos con quienes se divide el gasto
    {
      "amigoId": "507f1f77bcf86cd799439013",
      "amigoNombre": "Juan Pérez",
      "montoDividido": 62.75,
      "pagado": false
    }
  ]
}
```

**Campos requeridos:**
- `descripcion` (string): Descripción del gasto
- `monto` (number): Monto del gasto (debe ser > 0)
- `fecha` (string): Fecha en formato ISO (ej: "2024-11-15" o "2024-11-15T10:30:00.000Z")
- `categoria` (string): Categoría del gasto
- `mes` (string, opcional): Mes en minúsculas. Si no se proporciona, se extrae de la fecha

**Campos opcionales:**
- `dividido` (array, opcional): Array de objetos con información de cómo se divide el gasto entre amigos
  - Cada objeto debe tener:
    - `amigoId` (string, requerido): ID del amigo (ObjectId válido)
    - `amigoNombre` (string, requerido): Nombre del amigo
    - `montoDividido` (number, requerido): Monto que corresponde a este amigo (debe ser >= 0)
    - `pagado` (boolean, opcional): Indica si el amigo ya pagó su parte (default: false)

**Ejemplo de Request (Gasto Simple):**
```javascript
const nuevoGasto = {
  descripcion: "Compra de supermercado",
  monto: 125.50,
  fecha: "2024-11-15",
  categoria: "Alimentación"
};

const response = await fetch('http://localhost:4444/api/gastos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(nuevoGasto)
});

const data = await response.json();
```

**Ejemplo de Request (Gasto Dividido):**
```javascript
const nuevoGastoDividido = {
  descripcion: "Cena en restaurante",
  monto: 150.00,
  fecha: "2024-11-15",
  categoria: "Restaurantes",
  dividido: [
    {
      amigoId: "507f1f77bcf86cd799439013",
      amigoNombre: "Juan Pérez",
      montoDividido: 75.00,
      pagado: false
    },
    {
      amigoId: "507f1f77bcf86cd799439014",
      amigoNombre: "María García",
      montoDividido: 75.00,
      pagado: true
    }
  ]
};

const response = await fetch('http://localhost:4444/api/gastos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(nuevoGastoDividido)
});

const data = await response.json();
```

**Response (201 Created) - Gasto Simple:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "descripcion": "Compra de supermercado",
    "monto": 125.50,
    "fecha": "2024-11-15T10:30:00.000Z",
    "categoria": "Alimentación",
    "mes": "noviembre",
    "dividido": [],
    "createdAt": "2024-11-15T10:30:00.000Z"
  },
  "message": "Gasto creado exitosamente"
}
```

**Response (201 Created) - Gasto Dividido:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "descripcion": "Cena en restaurante",
    "monto": 150.00,
    "fecha": "2024-11-15T10:30:00.000Z",
    "categoria": "Restaurantes",
    "mes": "noviembre",
    "dividido": [
      {
        "amigoId": "507f1f77bcf86cd799439013",
        "amigoNombre": "Juan Pérez",
        "montoDividido": 75.00,
        "pagado": false
      },
      {
        "amigoId": "507f1f77bcf86cd799439014",
        "amigoNombre": "María García",
        "montoDividido": 75.00,
        "pagado": true
      }
    ],
    "createdAt": "2024-11-15T10:30:00.000Z"
  },
  "message": "Gasto creado exitosamente"
}
```

**Errores posibles:**
- `400`: Campos requeridos faltantes o inválidos
- `401`: Token inválido o expirado
- `500`: Error del servidor

---

### 3. Actualizar Gasto

**Endpoint:** `PUT /api/gastos/:id`

**Descripción:** Actualiza un gasto existente. Solo se pueden actualizar los gastos del usuario autenticado.

**Parámetros de URL:**
- `id` (string, requerido): ID del gasto a actualizar

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):** Solo incluir los campos que se desean actualizar
```json
{
  "descripcion": "Compra de supermercado actualizada",
  "monto": 150.00,
  "dividido": [
    {
      "amigoId": "507f1f77bcf86cd799439013",
      "amigoNombre": "Juan Pérez",
      "montoDividido": 75.00,
      "pagado": true
    }
  ]
}
```

**Campos opcionales:**
- `descripcion` (string)
- `monto` (number, debe ser > 0)
- `fecha` (string, formato ISO)
- `categoria` (string)
- `mes` (string, minúsculas)
- `dividido` (array): Array de objetos con información de cómo se divide el gasto. Si se envía, reemplaza completamente el array anterior.

**Ejemplo de Request (Actualizar campos básicos):**
```javascript
const gastoId = "507f1f77bcf86cd799439011";
const actualizacion = {
  descripcion: "Compra de supermercado actualizada",
  monto: 150.00
};

const response = await fetch(`http://localhost:4444/api/gastos/${gastoId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(actualizacion)
});

const data = await response.json();
```

**Ejemplo de Request (Actualizar división del gasto):**
```javascript
const gastoId = "507f1f77bcf86cd799439011";
const actualizacion = {
  dividido: [
    {
      amigoId: "507f1f77bcf86cd799439013",
      amigoNombre: "Juan Pérez",
      montoDividido: 50.00,
      pagado: true
    },
    {
      amigoId: "507f1f77bcf86cd799439014",
      amigoNombre: "María García",
      montoDividido: 50.00,
      pagado: false
    }
  ]
};

const response = await fetch(`http://localhost:4444/api/gastos/${gastoId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(actualizacion)
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "descripcion": "Compra de supermercado actualizada",
    "monto": 150.00,
    "fecha": "2024-11-15T10:30:00.000Z",
    "categoria": "Alimentación",
    "mes": "noviembre",
    "dividido": [],
    "createdAt": "2024-11-15T10:30:00.000Z"
  },
  "message": "Gasto actualizado exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido o campos inválidos
- `401`: Token inválido o expirado
- `404`: Gasto no encontrado o no pertenece al usuario
- `500`: Error del servidor

---

### 4. Eliminar Gasto

**Endpoint:** `DELETE /api/gastos/:id`

**Descripción:** Elimina un gasto. Solo se pueden eliminar los gastos del usuario autenticado.

**Parámetros de URL:**
- `id` (string, requerido): ID del gasto a eliminar

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```javascript
const gastoId = "507f1f77bcf86cd799439011";

const response = await fetch(`http://localhost:4444/api/gastos/${gastoId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Gasto eliminado exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Token inválido o expirado
- `404`: Gasto no encontrado o no pertenece al usuario
- `500`: Error del servidor

---

### 5. Obtener Total de Gastos por Mes

**Endpoint:** `GET /api/gastos/:mes/total`

**Descripción:** Obtiene el total de gastos de un mes específico.

**Parámetros de URL:**
- `mes` (string, requerido): Nombre del mes en minúsculas

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```javascript
const mes = 'noviembre';

const response = await fetch(`http://localhost:4444/api/gastos/${mes}/total`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mes": "noviembre",
    "total": 1250.75
  }
}
```

**Errores posibles:**
- `400`: Mes inválido
- `401`: Token inválido o expirado
- `500`: Error del servidor

---

### 6. Obtener Gastos por Categoría

**Endpoint:** `GET /api/gastos/:mes/categoria/:categoria`

**Descripción:** Obtiene todos los gastos de un mes filtrados por categoría.

**Parámetros de URL:**
- `mes` (string, requerido): Nombre del mes en minúsculas
- `categoria` (string, requerido): Nombre de la categoría

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```javascript
const mes = 'noviembre';
const categoria = 'Alimentación';

const response = await fetch(`http://localhost:4444/api/gastos/${mes}/categoria/${encodeURIComponent(categoria)}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "descripcion": "Compra de supermercado",
      "monto": 125.50,
      "fecha": "2024-11-15T10:30:00.000Z",
      "categoria": "Alimentación",
      "mes": "noviembre",
      "dividido": [],
      "createdAt": "2024-11-15T10:30:00.000Z"
    }
  ],
  "total": 125.50
}
```

**Errores posibles:**
- `400`: Mes o categoría inválidos
- `401`: Token inválido o expirado
- `500`: Error del servidor

---

## 💻 Ejemplos de Integración

### Función Helper para Requests

```typescript
// utils/api.ts
const API_BASE_URL = 'http://localhost:4444';

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('token'); // O donde guardes el token
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};
```

### Hook de React para Gastos

```typescript
// hooks/useGastos.ts
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export const useGastos = (mes: string) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/gastos/${mes}`);
        setGastos(data.data);
        setTotal(data.total || 0);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mes) {
      fetchGastos();
    }
  }, [mes]);

  const crearGasto = async (gastoData: any) => {
    try {
      const data = await apiRequest('/api/gastos', {
        method: 'POST',
        body: JSON.stringify(gastoData)
      });
      // Recargar gastos
      const updatedData = await apiRequest(`/api/gastos/${mes}`);
      setGastos(updatedData.data);
      setTotal(updatedData.total || 0);
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const actualizarGasto = async (id: string, gastoData: any) => {
    try {
      const data = await apiRequest(`/api/gastos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(gastoData)
      });
      // Recargar gastos
      const updatedData = await apiRequest(`/api/gastos/${mes}`);
      setGastos(updatedData.data);
      setTotal(updatedData.total || 0);
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const eliminarGasto = async (id: string) => {
    try {
      await apiRequest(`/api/gastos/${id}`, {
        method: 'DELETE'
      });
      // Recargar gastos
      const updatedData = await apiRequest(`/api/gastos/${mes}`);
      setGastos(updatedData.data);
      setTotal(updatedData.total || 0);
    } catch (err: any) {
      throw err;
    }
  };

  return {
    gastos,
    total,
    loading,
    error,
    crearGasto,
    actualizarGasto,
    eliminarGasto
  };
};
```

### Componente de React

```typescript
// components/GastosList.tsx
import { useGastos } from '../hooks/useGastos';

export const GastosList = ({ mes }: { mes: string }) => {
  const { gastos, total, loading, error, eliminarGasto } = useGastos(mes);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Gastos de {mes}</h2>
      <p>Total: €{total.toFixed(2)}</p>
      
      <ul>
        {gastos.map((gasto: any) => (
          <li key={gasto._id}>
            <div>
              <strong>{gasto.descripcion}</strong>
              <span>€{gasto.monto.toFixed(2)}</span>
              <span>{gasto.categoria}</span>
              
              {/* Mostrar información de división si existe */}
              {gasto.dividido && gasto.dividido.length > 0 && (
                <div>
                  <p>Dividido entre:</p>
                  <ul>
                    {gasto.dividido.map((item: any, index: number) => (
                      <li key={index}>
                        {item.amigoNombre}: €{item.montoDividido.toFixed(2)} 
                        {item.pagado ? ' ✓ Pagado' : ' ⏳ Pendiente'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button onClick={() => eliminarGasto(gasto._id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Ejemplo: Crear Gasto Dividido

```typescript
// Ejemplo de cómo crear un gasto dividido entre amigos
const crearGastoDividido = async () => {
  const gastoData = {
    descripcion: "Cena en restaurante",
    monto: 150.00,
    fecha: "2024-11-15",
    categoria: "Restaurantes",
    dividido: [
      {
        amigoId: "507f1f77bcf86cd799439013",
        amigoNombre: "Juan Pérez",
        montoDividido: 75.00,
        pagado: false
      },
      {
        amigoId: "507f1f77bcf86cd799439014",
        amigoNombre: "María García",
        montoDividido: 75.00,
        pagado: false
      }
    ]
  };

  try {
    const data = await apiRequest('/api/gastos', {
      method: 'POST',
      body: JSON.stringify(gastoData)
    });
    console.log('Gasto dividido creado:', data);
  } catch (error) {
    console.error('Error al crear gasto dividido:', error);
  }
};
```

### Ejemplo: Actualizar Estado de Pago

```typescript
// Ejemplo de cómo marcar como pagado a un amigo en un gasto dividido
const marcarAmigoComoPagado = async (gastoId: string, amigoId: string) => {
  // Primero obtener el gasto actual
  const gastoActual = await apiRequest(`/api/gastos/${gastoId}`);
  
  // Actualizar el array dividido
  const divididoActualizado = gastoActual.data.dividido.map((item: any) => {
    if (item.amigoId === amigoId) {
      return { ...item, pagado: true };
    }
    return item;
  });

  // Actualizar el gasto
  const actualizacion = {
    dividido: divididoActualizado
  };

  try {
    const data = await apiRequest(`/api/gastos/${gastoId}`, {
      method: 'PUT',
      body: JSON.stringify(actualizacion)
    });
    console.log('Estado de pago actualizado:', data);
  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
  }
};
```

---

## ⚠️ Manejo de Errores

### Estructura de Error

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "error": "Mensaje de error",
  "message": "Mensaje adicional (opcional)"
}
```

### Códigos de Estado HTTP

- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Bad Request (datos inválidos)
- `401`: Unauthorized (token inválido o expirado)
- `404`: Not Found (recurso no encontrado)
- `500`: Internal Server Error (error del servidor)

### Ejemplo de Manejo de Errores

```typescript
try {
  const data = await apiRequest('/api/gastos/noviembre');
  // Procesar datos
} catch (error: any) {
  if (error.message.includes('401')) {
    // Token expirado, redirigir a login
    window.location.href = '/login';
  } else if (error.message.includes('400')) {
    // Mostrar mensaje de validación
    alert('Datos inválidos');
  } else {
    // Error genérico
    alert('Error al cargar los gastos');
  }
}
```

---

## 📝 Notas Importantes

1. **Autenticación:** Todas las rutas requieren un token JWT válido. Si el token expira, el frontend debe redirigir al usuario al login.

2. **Formato de Fecha:** Las fechas pueden enviarse en formato ISO (ej: "2024-11-15" o "2024-11-15T10:30:00.000Z"). El backend las convierte automáticamente.

3. **Mes:** El campo `mes` es opcional al crear un gasto. Si no se proporciona, se extrae automáticamente de la fecha.

4. **Ordenamiento:** Los gastos se ordenan automáticamente por fecha ascendente (más antiguos primero).

5. **Categorías:** Las categorías deben coincidir exactamente con las que existen en el sistema. Se recomienda obtener las categorías disponibles desde el endpoint de categorías.

6. **Encoding:** Al usar categorías en la URL, asegúrate de usar `encodeURIComponent()` para caracteres especiales.

7. **Gastos Divididos:** El campo `dividido` es opcional y permite dividir un gasto entre varios amigos. Cada elemento del array debe tener:
   - `amigoId`: ID válido del amigo (ObjectId de MongoDB)
   - `amigoNombre`: Nombre del amigo
   - `montoDividido`: Monto que corresponde a ese amigo (puede ser 0)
   - `pagado`: Boolean indicando si ya pagó (opcional, default: false)
   
   **Nota importante:** Al actualizar un gasto, si envías el campo `dividido`, este reemplazará completamente el array anterior. Si quieres mantener los datos existentes, debes incluir todos los elementos en el nuevo array.

---

## 🔄 Migración desde localStorage

Si actualmente estás usando `localStorage` para guardar gastos, puedes migrar gradualmente:

1. Mantén la funcionalidad de localStorage como fallback
2. Intenta cargar desde la API primero
3. Si falla, usa localStorage
4. Sincroniza los datos de localStorage con la API cuando sea posible

```typescript
const cargarGastos = async (mes: string) => {
  try {
    // Intentar cargar desde API
    const data = await apiRequest(`/api/gastos/${mes}`);
    return data.data;
  } catch (error) {
    // Fallback a localStorage
    const gastosLocal = JSON.parse(localStorage.getItem(`gastos_${mes}`) || '[]');
    return gastosLocal;
  }
};
```

---

## ✅ Checklist de Integración

- [ ] Configurar base URL del API
- [ ] Implementar función helper para requests con autenticación
- [ ] Crear hook o función para obtener gastos por mes
- [ ] Implementar creación de gastos
- [ ] Implementar actualización de gastos
- [ ] Implementar eliminación de gastos
- [ ] Manejar errores de autenticación (401)
- [ ] Manejar errores de validación (400)
- [ ] Actualizar UI después de operaciones CRUD
- [ ] Probar todos los endpoints
- [ ] Migrar datos de localStorage a API (si aplica)

---

## 🚀 Próximos Pasos

Una vez integradas las rutas de gastos:
1. Integrar rutas de ingresos
2. Integrar rutas de categorías
3. Integrar rutas de presupuestos
4. Integrar rutas de dashboard

