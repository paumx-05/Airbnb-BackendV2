# Integración Frontend: Endpoints de Notificaciones

## Objetivo
Este documento describe cómo integrar los endpoints de notificaciones del backend con el frontend, incluyendo el sistema completo de gestión de notificaciones, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Notificaciones

El sistema de notificaciones funciona de la siguiente manera:

1. **Obtener notificaciones** → Ver todas las notificaciones con filtros opcionales (leída, tipo)
2. **Obtener por ID** → Obtener una notificación específica
3. **Obtener por tipo** → Filtrar notificaciones por tipo (info, success, warning, error)
4. **Crear notificación** → Crear una nueva notificación
5. **Marcar como leída** → Marcar una notificación específica como leída
6. **Marcar todas como leídas** → Marcar todas las notificaciones como leídas
7. **Eliminar notificación** → Eliminar una notificación específica
8. **Eliminar todas** → Eliminar todas las notificaciones del usuario

**Importante:** Los usuarios solo pueden acceder a sus propias notificaciones. Todas las operaciones están protegidas por autenticación.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Notificaciones

### 1. Obtener Todas las Notificaciones

**Endpoint:**
```
GET /api/notificaciones
```

**Descripción:** Obtiene todas las notificaciones del usuario autenticado, con filtros opcionales por estado de lectura y tipo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcionales):**
- `leida` (string, opcional): Filtrar por estado de lectura (`"true"` o `"false"`)
- `tipo` (string, opcional): Filtrar por tipo (`"info"`, `"success"`, `"warning"`, `"error"`)

**Ejemplos de uso:**
```
GET /api/notificaciones
GET /api/notificaciones?leida=false
GET /api/notificaciones?tipo=error
GET /api/notificaciones?leida=false&tipo=warning
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "tipo": "warning",
      "titulo": "Presupuesto excedido",
      "mensaje": "Has excedido el presupuesto de Alimentación",
      "leida": false,
      "createdAt": "2024-11-15T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "tipo": "success",
      "titulo": "Gasto registrado",
      "mensaje": "Tu gasto de $50.00 ha sido registrado exitosamente",
      "leida": true,
      "createdAt": "2024-11-15T09:30:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID único de la notificación
- `userId`: ID del usuario propietario
- `tipo`: Tipo de notificación (`info`, `success`, `warning`, `error`)
- `titulo`: Título de la notificación
- `mensaje`: Mensaje de la notificación
- `leida`: Estado de lectura (boolean)
- `createdAt`: Fecha de creación en formato ISO

**Nota:** Las notificaciones se ordenan por fecha descendente (más recientes primero).

**Errores posibles:**
- `400`: Tipo inválido en query parameter
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface Notificacion {
  _id: string;
  userId: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

interface GetNotificacionesParams {
  leida?: boolean;
  tipo?: 'info' | 'success' | 'warning' | 'error';
}

const getNotificaciones = async (
  params?: GetNotificacionesParams
): Promise<Notificacion[]> => {
  const token = localStorage.getItem('token');
  
  // Construir query string
  const queryParams = new URLSearchParams();
  if (params?.leida !== undefined) {
    queryParams.append('leida', params.leida.toString());
  }
  if (params?.tipo) {
    queryParams.append('tipo', params.tipo);
  }
  
  const queryString = queryParams.toString();
  const url = `http://localhost:4444/api/notificaciones${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Parámetros inválidos');
    }
    throw new Error(error.error || 'Error al obtener notificaciones');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Notificación por ID

**Endpoint:**
```
GET /api/notificaciones/:id
```

**Descripción:** Obtiene una notificación específica por su ID. Solo puede obtener notificaciones propias.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la notificación

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "tipo": "warning",
    "titulo": "Presupuesto excedido",
    "mensaje": "Has excedido el presupuesto de Alimentación",
    "leida": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Usuario no autenticado
- `404`: Notificación no encontrada o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const getNotificacionById = async (id: string): Promise<Notificacion> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/notificaciones/${id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al obtener notificación');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Obtener Notificaciones por Tipo

**Endpoint:**
```
GET /api/notificaciones/tipo/:tipo
```

**Descripción:** Obtiene todas las notificaciones del usuario filtradas por tipo específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `tipo` (string, requerido): Tipo de notificación (`info`, `success`, `warning`, `error`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "tipo": "error",
      "titulo": "Error en el pago",
      "mensaje": "No se pudo procesar el pago",
      "leida": false,
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Errores posibles:**
- `400`: Tipo inválido
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const getNotificacionesByTipo = async (
  tipo: 'info' | 'success' | 'warning' | 'error'
): Promise<Notificacion[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/notificaciones/tipo/${tipo}`,
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
      throw new Error(error.error || 'Tipo inválido');
    }
    throw new Error(error.error || 'Error al obtener notificaciones por tipo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Crear Nueva Notificación

**Endpoint:**
```
POST /api/notificaciones
```

**Descripción:** Crea una nueva notificación para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tipo": "warning",
  "titulo": "Presupuesto excedido",
  "mensaje": "Has excedido el presupuesto de Alimentación",
  "leida": false
}
```

**Campos del request:**
- `tipo` (string, requerido): Tipo de notificación (`info`, `success`, `warning`, `error`)
- `titulo` (string, requerido): Título de la notificación (no puede estar vacío)
- `mensaje` (string, requerido): Mensaje de la notificación (no puede estar vacío)
- `leida` (boolean, opcional): Estado de lectura (default: `false`)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notificación creada exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "tipo": "warning",
    "titulo": "Presupuesto excedido",
    "mensaje": "Has excedido el presupuesto de Alimentación",
    "leida": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: Campos requeridos faltantes, tipo inválido, o título/mensaje vacíos
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreateNotificacionRequest {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida?: boolean;
}

const createNotificacion = async (
  data: CreateNotificacionRequest
): Promise<Notificacion> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/notificaciones',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    throw new Error(error.error || 'Error al crear notificación');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Marcar Notificación como Leída

**Endpoint:**
```
PUT /api/notificaciones/:id/leida
```

**Descripción:** Marca una notificación específica como leída.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la notificación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "tipo": "warning",
    "titulo": "Presupuesto excedido",
    "mensaje": "Has excedido el presupuesto de Alimentación",
    "leida": true,
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Usuario no autenticado
- `404`: Notificación no encontrada o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const markAsLeida = async (id: string): Promise<Notificacion> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/notificaciones/${id}/leida`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al marcar notificación como leída');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. Marcar Todas las Notificaciones como Leídas

**Endpoint:**
```
PUT /api/notificaciones/leer-todas
```

**Descripción:** Marca todas las notificaciones no leídas del usuario como leídas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "5 notificación(es) marcada(s) como leída(s)",
  "data": {
    "modificadas": 5
  }
}
```

**Campos de respuesta:**
- `modificadas`: Número de notificaciones que fueron marcadas como leídas

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface MarkAllAsLeidasResponse {
  modificadas: number;
}

const markAllAsLeidas = async (): Promise<MarkAllAsLeidasResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/notificaciones/leer-todas',
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al marcar todas las notificaciones como leídas');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 7. Eliminar Notificación por ID

**Endpoint:**
```
DELETE /api/notificaciones/:id
```

**Descripción:** Elimina una notificación específica. Solo puede eliminar notificaciones propias.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la notificación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido
- `401`: Usuario no autenticado
- `404`: Notificación no encontrada o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const deleteNotificacion = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/notificaciones/${id}`,
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
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al eliminar notificación');
  }
};
```

---

### 8. Eliminar Todas las Notificaciones

**Endpoint:**
```
DELETE /api/notificaciones
```

**Descripción:** Elimina todas las notificaciones del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "10 notificación(es) eliminada(s)",
  "data": {
    "eliminadas": 10
  }
}
```

**Campos de respuesta:**
- `eliminadas`: Número de notificaciones que fueron eliminadas

**Errores posibles:**
- `401`: Usuario no autenticado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface DeleteAllNotificacionesResponse {
  eliminadas: number;
}

const deleteAllNotificaciones = async (): Promise<DeleteAllNotificacionesResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:4444/api/notificaciones',
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al eliminar todas las notificaciones');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Funciones Helper Completas

Aquí tienes un archivo completo con todas las funciones helper para usar en tu frontend:

```typescript
// notificaciones.service.ts

const API_BASE_URL = 'http://localhost:4444';

// Tipos
export interface Notificacion {
  _id: string;
  userId: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

export interface GetNotificacionesParams {
  leida?: boolean;
  tipo?: 'info' | 'success' | 'warning' | 'error';
}

export interface CreateNotificacionRequest {
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida?: boolean;
}

export interface MarkAllAsLeidasResponse {
  modificadas: number;
}

export interface DeleteAllNotificacionesResponse {
  eliminadas: number;
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

// 1. Obtener todas las notificaciones
export const getNotificaciones = async (
  params?: GetNotificacionesParams
): Promise<Notificacion[]> => {
  const queryParams = new URLSearchParams();
  if (params?.leida !== undefined) {
    queryParams.append('leida', params.leida.toString());
  }
  if (params?.tipo) {
    queryParams.append('tipo', params.tipo);
  }
  
  const queryString = queryParams.toString();
  const url = `/api/notificaciones${queryString ? `?${queryString}` : ''}`;
  
  const response = await makeRequest(url, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Parámetros inválidos');
    }
    throw new Error(error.error || 'Error al obtener notificaciones');
  }

  const result = await response.json();
  return result.data;
};

// 2. Obtener notificación por ID
export const getNotificacionById = async (id: string): Promise<Notificacion> => {
  const response = await makeRequest(`/api/notificaciones/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al obtener notificación');
  }

  const result = await response.json();
  return result.data;
};

// 3. Obtener notificaciones por tipo
export const getNotificacionesByTipo = async (
  tipo: 'info' | 'success' | 'warning' | 'error'
): Promise<Notificacion[]> => {
  const response = await makeRequest(`/api/notificaciones/tipo/${tipo}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Tipo inválido');
    }
    throw new Error(error.error || 'Error al obtener notificaciones por tipo');
  }

  const result = await response.json();
  return result.data;
};

// 4. Crear nueva notificación
export const createNotificacion = async (
  data: CreateNotificacionRequest
): Promise<Notificacion> => {
  const response = await makeRequest('/api/notificaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Datos inválidos');
    }
    throw new Error(error.error || 'Error al crear notificación');
  }

  const result = await response.json();
  return result.data;
};

// 5. Marcar notificación como leída
export const markAsLeida = async (id: string): Promise<Notificacion> => {
  const response = await makeRequest(`/api/notificaciones/${id}/leida`, {
    method: 'PUT',
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al marcar notificación como leída');
  }

  const result = await response.json();
  return result.data;
};

// 6. Marcar todas las notificaciones como leídas
export const markAllAsLeidas = async (): Promise<MarkAllAsLeidasResponse> => {
  const response = await makeRequest('/api/notificaciones/leer-todas', {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('Error al marcar todas las notificaciones como leídas');
  }

  const result = await response.json();
  return result.data;
};

// 7. Eliminar notificación por ID
export const deleteNotificacion = async (id: string): Promise<void> => {
  const response = await makeRequest(`/api/notificaciones/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('ID de notificación inválido');
    }
    if (response.status === 404) {
      throw new Error('Notificación no encontrada');
    }
    throw new Error('Error al eliminar notificación');
  }
};

// 8. Eliminar todas las notificaciones
export const deleteAllNotificaciones = async (): Promise<DeleteAllNotificacionesResponse> => {
  const response = await makeRequest('/api/notificaciones', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar todas las notificaciones');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 📱 Ejemplos de Uso en Componentes React

### Componente de Lista de Notificaciones

```typescript
import React, { useState, useEffect } from 'react';
import {
  getNotificaciones,
  markAsLeida,
  markAllAsLeidas,
  deleteNotificacion,
  Notificacion
} from './services/notificaciones.service';

const NotificacionesList: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroLeida, setFiltroLeida] = useState<boolean | undefined>(undefined);
  const [filtroTipo, setFiltroTipo] = useState<string | undefined>(undefined);

  useEffect(() => {
    cargarNotificaciones();
  }, [filtroLeida, filtroTipo]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await getNotificaciones({
        leida: filtroLeida,
        tipo: filtroTipo as any
      });
      setNotificaciones(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsLeida = async (id: string) => {
    try {
      await markAsLeida(id);
      cargarNotificaciones(); // Recargar lista
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleMarkAllAsLeidas = async () => {
    try {
      await markAllAsLeidas();
      cargarNotificaciones(); // Recargar lista
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) {
      return;
    }
    
    try {
      await deleteNotificacion(id);
      cargarNotificaciones(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div>Cargando notificaciones...</div>;
  }

  return (
    <div className="notificaciones-container">
      <div className="filtros">
        <button onClick={() => setFiltroLeida(undefined)}>Todas</button>
        <button onClick={() => setFiltroLeida(false)}>No leídas</button>
        <button onClick={() => setFiltroLeida(true)}>Leídas</button>
        
        <select onChange={(e) => setFiltroTipo(e.target.value || undefined)}>
          <option value="">Todos los tipos</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        
        <button onClick={handleMarkAllAsLeidas}>
          Marcar todas como leídas
        </button>
      </div>

      <div className="notificaciones-list">
        {notificaciones.length === 0 ? (
          <p>No hay notificaciones</p>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif._id}
              className={`notificacion ${notif.leida ? 'leida' : 'no-leida'}`}
            >
              <div className="notificacion-header">
                <span className={getTipoColor(notif.tipo)}>
                  {notif.tipo.toUpperCase()}
                </span>
                <span className="fecha">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <h3>{notif.titulo}</h3>
              <p>{notif.mensaje}</p>
              <div className="notificacion-actions">
                {!notif.leida && (
                  <button onClick={() => handleMarkAsLeida(notif._id)}>
                    Marcar como leída
                  </button>
                )}
                <button onClick={() => handleDelete(notif._id)}>
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

export default NotificacionesList;
```

---

## 🎨 Tipos de Notificaciones

El sistema soporta 4 tipos de notificaciones:

1. **`info`**: Información general (azul)
2. **`success`**: Operaciones exitosas (verde)
3. **`warning`**: Advertencias (amarillo)
4. **`error`**: Errores (rojo)

---

## ✅ Checklist de Integración

- [ ] Instalar dependencias necesarias (si usas fetch, axios, etc.)
- [ ] Configurar la URL base del API
- [ ] Implementar el sistema de autenticación (token JWT)
- [ ] Crear el servicio de notificaciones con todas las funciones
- [ ] Crear componentes de UI para mostrar notificaciones
- [ ] Implementar filtros (leída, tipo)
- [ ] Implementar acciones (marcar como leída, eliminar)
- [ ] Manejar estados de carga y errores
- [ ] Probar todos los endpoints
- [ ] Implementar actualización automática (polling o WebSockets si es necesario)

---

## 🔍 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`

2. **Ordenamiento**: Las notificaciones siempre se devuelven ordenadas por fecha descendente (más recientes primero)

3. **Filtrado**: Puedes combinar filtros usando query parameters en el endpoint GET `/api/notificaciones`

4. **Seguridad**: Los usuarios solo pueden acceder a sus propias notificaciones. El backend valida automáticamente la propiedad

5. **Validación**: El backend valida que:
   - El tipo sea uno de los valores permitidos
   - El título y mensaje no estén vacíos
   - Los IDs sean válidos

6. **Manejo de Errores**: Siempre maneja los errores apropiadamente y muestra mensajes claros al usuario

---

## 📚 Recursos Adicionales

- Documentación del backend: `integracion_endpoints/notificaciones.md`
- Modelo de datos: `src/models/Notificacion.model.ts`
- Controlador: `src/controllers/notificacion.controller.ts`
- Rutas: `src/routes/notificacion.routes.ts`

---

¡Listo para integrar! 🚀

