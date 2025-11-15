# Integración Frontend: Endpoints de Amigos

## Objetivo
Este documento describe cómo integrar los endpoints de amigos del backend con el frontend, incluyendo el sistema completo de solicitudes de amistad, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Amistad

El sistema ahora funciona con solicitudes de amistad:

1. **Buscar usuarios** → Buscar usuarios del sistema (no solo amigos)
2. **Enviar solicitud** → Enviar solicitud de amistad a otro usuario
3. **Ver solicitudes** → El otro usuario ve las solicitudes recibidas
4. **Aceptar/Rechazar** → El otro usuario acepta o rechaza la solicitud
5. **Amistad mutua** → Ambos usuarios se tienen mutuamente como amigos activos
6. **Chatear** → Solo entonces pueden enviarse mensajes

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Amigos

### 1. Obtener Todos los Amigos (Solo Activos)

**Endpoint:**
```
GET /api/amigos
```

**Descripción:** Obtiene solo los amigos con estado 'activo' (amigos mutuos). Los amigos pendientes o rechazados no aparecen aquí.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "amigoUserId": "507f1f77bcf86cd799439013",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "estado": "activo",
      "fechaAmistad": "2024-11-15T10:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Nota importante:** Este endpoint solo devuelve amigos con estado 'activo'. Para ver solicitudes pendientes, usa `GET /api/amigos/solicitudes`.

**Ejemplo de implementación:**
```typescript
const getAmigos = async (): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/amigos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener amigos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Buscar Usuarios del Sistema (NUEVO)

**Endpoint:**
```
GET /api/amigos/usuarios/search?q=<query>
```

**Descripción:** Busca usuarios del sistema (no solo tus amigos). Muestra el estado de amistad con cada usuario encontrado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (string, requerido): Término de búsqueda (nombre o email)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "estadoAmistad": "activo",
      "esAmigo": true
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "nombre": "María García",
      "email": "maria.garcia@example.com",
      "avatar": "https://example.com/avatar2.jpg",
      "estadoAmistad": "pendiente",
      "esAmigo": false
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "nombre": "Carlos López",
      "email": "carlos.lopez@example.com",
      "avatar": null,
      "estadoAmistad": null,
      "esAmigo": false
    }
  ]
}
```

**Campos de respuesta:**
- `estadoAmistad`: `'pendiente' | 'activo' | 'rechazada' | 'bloqueado' | null` - Estado de la relación de amistad
- `esAmigo`: `boolean` - `true` si el estado es 'activo'

**Ejemplo de implementación:**
```typescript
const searchUsuarios = async (query: string): Promise<UsuarioConEstado[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/amigos/usuarios/search?q=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al buscar usuarios');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Enviar Solicitud de Amistad (NUEVO)

**Endpoint:**
```
POST /api/amigos/solicitud
```

**Descripción:** Envía una solicitud de amistad a otro usuario. Crea un registro con estado 'pendiente'.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amigoUserId": "507f1f77bcf86cd799439013"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amigoUserId": "507f1f77bcf86cd799439013",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "pendiente",
    "solicitadoPor": "507f1f77bcf86cd799439012",
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Solicitud de amistad enviada exitosamente"
}
```

**Errores posibles:**
- `400`: ID inválido o intentando enviar solicitud a uno mismo
- `404`: Usuario no encontrado
- `409`: Ya existe una relación con este usuario

**Ejemplo de implementación:**
```typescript
const enviarSolicitud = async (amigoUserId: string): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/amigos/solicitud', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amigoUserId })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Ya existe una relación con este usuario');
    }
    throw new Error(error.error || 'Error al enviar solicitud');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Obtener Solicitudes Recibidas (NUEVO)

**Endpoint:**
```
GET /api/amigos/solicitudes
```

**Descripción:** Obtiene todas las solicitudes de amistad recibidas que están pendientes.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "solicitante": {
        "_id": "507f1f77bcf86cd799439012",
        "nombre": "Juan Pérez",
        "email": "juan.perez@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "estado": "pendiente",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const getSolicitudesRecibidas = async (): Promise<SolicitudAmistad[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/amigos/solicitudes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener solicitudes');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Aceptar Solicitud de Amistad (NUEVO)

**Endpoint:**
```
PUT /api/amigos/solicitud/:id/aceptar
```

**Descripción:** Acepta una solicitud de amistad. Actualiza la solicitud a estado 'activo' y crea automáticamente la relación inversa (ambos usuarios se tienen mutuamente como amigos).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la solicitud a aceptar

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "estado": "activo",
    "fechaAmistad": "2024-11-15T10:00:00.000Z"
  },
  "message": "Solicitud de amistad aceptada exitosamente"
}
```

**Errores posibles:**
- `404`: Solicitud no encontrada o ya procesada

**Ejemplo de implementación:**
```typescript
const aceptarSolicitud = async (solicitudId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/amigos/solicitud/${solicitudId}/aceptar`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Solicitud no encontrada o ya procesada');
    }
    throw new Error(error.error || 'Error al aceptar solicitud');
  }
};
```

---

### 6. Rechazar Solicitud de Amistad (NUEVO)

**Endpoint:**
```
PUT /api/amigos/solicitud/:id/rechazar
```

**Descripción:** Rechaza una solicitud de amistad. Actualiza la solicitud a estado 'rechazada'.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, requerido): ID de la solicitud a rechazar

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Solicitud de amistad rechazada"
}
```

**Errores posibles:**
- `404`: Solicitud no encontrada o ya procesada

**Ejemplo de implementación:**
```typescript
const rechazarSolicitud = async (solicitudId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/amigos/solicitud/${solicitudId}/rechazar`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Solicitud no encontrada o ya procesada');
    }
    throw new Error(error.error || 'Error al rechazar solicitud');
  }
};
```

---

### 7. Obtener Amigo por ID

**Endpoint:**
```
GET /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amigoUserId": "507f1f77bcf86cd799439013",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "activo",
    "solicitadoPor": "507f1f77bcf86cd799439012",
    "fechaAmistad": "2024-11-15T10:00:00.000Z",
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Ejemplo de implementación:**
```typescript
const getAmigoById = async (id: string): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al obtener amigo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 8. Buscar Amigos (Entre tus amigos)

**Endpoint:**
```
GET /api/amigos/search?q=<query>
```

**Descripción:** Busca entre tus amigos existentes (no busca en todos los usuarios del sistema).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (string, requerido): Término de búsqueda (nombre o email)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "amigoUserId": "507f1f77bcf86cd799439013",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "estado": "activo",
      "fechaAmistad": "2024-11-15T10:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const searchAmigos = async (query: string): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/amigos/search?q=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al buscar amigos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 9. Obtener Amigos por Estado

**Endpoint:**
```
GET /api/amigos/estado/:estado
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `estado` (string, requerido): `'pendiente' | 'activo' | 'rechazada' | 'bloqueado'`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "amigoUserId": "507f1f77bcf86cd799439013",
      "nombre": "Juan Pérez",
      "email": "juan.perez@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "estado": "pendiente",
      "solicitadoPor": "507f1f77bcf86cd799439012",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const getAmigosByEstado = async (
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado'
): Promise<Amigo[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/estado/${estado}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener amigos por estado');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 10. Crear Amigo (DEPRECADO - Usar enviarSolicitud)

**Endpoint:**
```
POST /api/amigos
```

**⚠️ NOTA:** Este endpoint está deprecado. Se mantiene por compatibilidad pero ahora crea una solicitud de amistad en lugar de un amigo directo. Se recomienda usar `POST /api/amigos/solicitud` en su lugar.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "estado": "pendiente"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amigoUserId": "507f1f77bcf86cd799439013",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "pendiente",
    "solicitadoPor": "507f1f77bcf86cd799439012",
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Solicitud de amistad creada exitosamente"
}
```

---

### 11. Actualizar Amigo

**Endpoint:**
```
PUT /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "email": "juan.perez.nuevo@example.com",
  "avatar": "https://example.com/nuevo-avatar.jpg",
  "estado": "bloqueado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amigoUserId": "507f1f77bcf86cd799439013",
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.perez.nuevo@example.com",
    "avatar": "https://example.com/nuevo-avatar.jpg",
    "estado": "bloqueado",
    "solicitadoPor": "507f1f77bcf86cd799439012",
    "fechaAmistad": "2024-11-15T10:00:00.000Z",
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Amigo actualizado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
interface UpdateAmigoData {
  nombre?: string;
  email?: string;
  avatar?: string;
  estado?: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
}

const updateAmigo = async (id: string, data: UpdateAmigoData): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al actualizar amigo');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 12. Actualizar Estado de Amigo

**Endpoint:**
```
PUT /api/amigos/:id/estado
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "estado": "bloqueado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amigoUserId": "507f1f77bcf86cd799439013",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "estado": "bloqueado",
    "solicitadoPor": "507f1f77bcf86cd799439012",
    "fechaAmistad": "2024-11-15T10:00:00.000Z",
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Estado actualizado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const updateEstadoAmigo = async (
  id: string, 
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado'
): Promise<Amigo> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar estado');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 13. Eliminar Amigo

**Endpoint:**
```
DELETE /api/amigos/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Amigo eliminado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const deleteAmigo = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/amigos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al eliminar amigo');
  }
};
```

---

## 🔧 Funciones Helper Completas

### Archivo: `lib/amigos.ts` (o similar en tu proyecto)

```typescript
// Tipos
export interface Amigo {
  _id: string;
  userId: string;
  amigoUserId: string;
  nombre: string;
  email: string;
  avatar?: string;
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
  solicitadoPor: string;
  fechaAmistad?: string;
  createdAt: string;
}

export interface UsuarioConEstado {
  _id: string;
  nombre: string;
  email: string;
  avatar?: string;
  estadoAmistad: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado' | null;
  esAmigo: boolean;
}

export interface SolicitudAmistad {
  _id: string;
  solicitante: {
    _id: string;
    nombre: string;
    email: string;
    avatar?: string;
  };
  estado: 'pendiente';
  createdAt: string;
}

export interface CreateAmigoData {
  nombre: string;
  email: string;
  avatar?: string;
  estado?: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
}

export interface UpdateAmigoData {
  nombre?: string;
  email?: string;
  avatar?: string;
  estado?: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
}

// Configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444';

// Helper para obtener token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper para hacer requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};

// Funciones de API

// Obtener todos los amigos (solo activos)
export const getAmigos = async (): Promise<Amigo[]> => {
  const response = await apiRequest('/api/amigos');
  
  if (!response.ok) {
    throw new Error('Error al obtener amigos');
  }

  const result = await response.json();
  return result.data;
};

// Buscar usuarios del sistema (NUEVO)
export const searchUsuarios = async (query: string): Promise<UsuarioConEstado[]> => {
  const response = await apiRequest(
    `/api/amigos/usuarios/search?q=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Error al buscar usuarios');
  }

  const result = await response.json();
  return result.data;
};

// Enviar solicitud de amistad (NUEVO)
export const enviarSolicitud = async (amigoUserId: string): Promise<Amigo> => {
  const response = await apiRequest('/api/amigos/solicitud', {
    method: 'POST',
    body: JSON.stringify({ amigoUserId })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Ya existe una relación con este usuario');
    }
    throw new Error(error.error || 'Error al enviar solicitud');
  }

  const result = await response.json();
  return result.data;
};

// Obtener solicitudes recibidas (NUEVO)
export const getSolicitudesRecibidas = async (): Promise<SolicitudAmistad[]> => {
  const response = await apiRequest('/api/amigos/solicitudes');
  
  if (!response.ok) {
    throw new Error('Error al obtener solicitudes');
  }

  const result = await response.json();
  return result.data;
};

// Aceptar solicitud de amistad (NUEVO)
export const aceptarSolicitud = async (solicitudId: string): Promise<void> => {
  const response = await apiRequest(
    `/api/amigos/solicitud/${solicitudId}/aceptar`,
    {
      method: 'PUT'
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Solicitud no encontrada o ya procesada');
    }
    throw new Error(error.error || 'Error al aceptar solicitud');
  }
};

// Rechazar solicitud de amistad (NUEVO)
export const rechazarSolicitud = async (solicitudId: string): Promise<void> => {
  const response = await apiRequest(
    `/api/amigos/solicitud/${solicitudId}/rechazar`,
    {
      method: 'PUT'
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Solicitud no encontrada o ya procesada');
    }
    throw new Error(error.error || 'Error al rechazar solicitud');
  }
};

// Obtener amigo por ID
export const getAmigoById = async (id: string): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al obtener amigo');
  }

  const result = await response.json();
  return result.data;
};

// Buscar entre tus amigos
export const searchAmigos = async (query: string): Promise<Amigo[]> => {
  const response = await apiRequest(
    `/api/amigos/search?q=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Error al buscar amigos');
  }

  const result = await response.json();
  return result.data;
};

// Obtener amigos por estado
export const getAmigosByEstado = async (
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado'
): Promise<Amigo[]> => {
  const response = await apiRequest(`/api/amigos/estado/${estado}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener amigos por estado');
  }

  const result = await response.json();
  return result.data;
};

// Crear amigo (DEPRECADO - usar enviarSolicitud)
export const createAmigo = async (data: CreateAmigoData): Promise<Amigo> => {
  const response = await apiRequest('/api/amigos', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al crear amigo');
  }

  const result = await response.json();
  return result.data;
};

// Actualizar amigo
export const updateAmigo = async (
  id: string,
  data: UpdateAmigoData
): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    if (response.status === 409) {
      throw new Error('Ya existe un amigo con ese email');
    }
    throw new Error(error.error || 'Error al actualizar amigo');
  }

  const result = await response.json();
  return result.data;
};

// Actualizar estado de amigo
export const updateEstadoAmigo = async (
  id: string,
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado'
): Promise<Amigo> => {
  const response = await apiRequest(`/api/amigos/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al actualizar estado');
  }

  const result = await response.json();
  return result.data;
};

// Eliminar amigo
export const deleteAmigo = async (id: string): Promise<void> => {
  const response = await apiRequest(`/api/amigos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al eliminar amigo');
  }
};
```

---

## 📱 Ejemplo de Uso en Componente React/Next.js

### Componente de Búsqueda y Solicitudes

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  searchUsuarios, 
  enviarSolicitud, 
  getSolicitudesRecibidas,
  aceptarSolicitud,
  rechazarSolicitud,
  getAmigos
} from '@/lib/amigos';
import type { UsuarioConEstado, SolicitudAmistad, Amigo } from '@/lib/amigos';

export default function AmigosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioConEstado[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAmistad[]>([]);
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar solicitudes y amigos al montar
  useEffect(() => {
    loadSolicitudes();
    loadAmigos();
  }, []);

  const loadSolicitudes = async () => {
    try {
      const data = await getSolicitudesRecibidas();
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    }
  };

  const loadAmigos = async () => {
    try {
      const data = await getAmigos();
      setAmigos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar amigos');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setUsuarios([]);
      return;
    }

    try {
      setLoading(true);
      const data = await searchUsuarios(query);
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarSolicitud = async (amigoUserId: string) => {
    try {
      await enviarSolicitud(amigoUserId);
      // Actualizar estado del usuario en la lista
      setUsuarios(usuarios.map(u => 
        u._id === amigoUserId 
          ? { ...u, estadoAmistad: 'pendiente', esAmigo: false }
          : u
      ));
      alert('Solicitud enviada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
    }
  };

  const handleAceptarSolicitud = async (solicitudId: string) => {
    try {
      await aceptarSolicitud(solicitudId);
      // Recargar solicitudes y amigos
      await loadSolicitudes();
      await loadAmigos();
      alert('Solicitud aceptada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar solicitud');
    }
  };

  const handleRechazarSolicitud = async (solicitudId: string) => {
    try {
      await rechazarSolicitud(solicitudId);
      // Recargar solicitudes
      await loadSolicitudes();
      alert('Solicitud rechazada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar solicitud');
    }
  };

  return (
    <div>
      <h1>Gestión de Amigos</h1>
      
      {/* Búsqueda de usuarios */}
      <section>
        <h2>Buscar Usuarios</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Buscar por nombre o email..."
        />
        
        {loading && <p>Buscando...</p>}
        
        {usuarios.map(usuario => (
          <div key={usuario._id}>
            <h3>{usuario.nombre}</h3>
            <p>{usuario.email}</p>
            <p>Estado: {usuario.estadoAmistad || 'Sin relación'}</p>
            
            {!usuario.esAmigo && usuario.estadoAmistad !== 'pendiente' && (
              <button onClick={() => handleEnviarSolicitud(usuario._id)}>
                Enviar Solicitud
              </button>
            )}
            
            {usuario.estadoAmistad === 'pendiente' && (
              <span>Solicitud pendiente</span>
            )}
            
            {usuario.esAmigo && (
              <span>✓ Ya son amigos</span>
            )}
          </div>
        ))}
      </section>

      {/* Solicitudes recibidas */}
      <section>
        <h2>Solicitudes Recibidas ({solicitudes.length})</h2>
        {solicitudes.map(solicitud => (
          <div key={solicitud._id}>
            <h3>{solicitud.solicitante.nombre}</h3>
            <p>{solicitud.solicitante.email}</p>
            <button onClick={() => handleAceptarSolicitud(solicitud._id)}>
              Aceptar
            </button>
            <button onClick={() => handleRechazarSolicitud(solicitud._id)}>
              Rechazar
            </button>
          </div>
        ))}
      </section>

      {/* Lista de amigos */}
      <section>
        <h2>Mis Amigos ({amigos.length})</h2>
        {amigos.map(amigo => (
          <div key={amigo._id}>
            <h3>{amigo.nombre}</h3>
            <p>{amigo.email}</p>
            <p>Amigos desde: {new Date(amigo.fechaAmistad!).toLocaleDateString()}</p>
          </div>
        ))}
      </section>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}
```

---

## 🔐 Manejo de Errores

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o faltante
- **403 Forbidden**: No tienes permiso (ej: intentar chatear sin ser amigos mutuos)
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Ya existe una relación con este usuario
- **500 Internal Server Error**: Error del servidor

### Manejo de Errores en el Frontend

```typescript
try {
  await enviarSolicitud(amigoUserId);
} catch (error) {
  if (error instanceof Error) {
    // Mostrar mensaje de error al usuario
    console.error(error.message);
    
    // Manejar errores específicos
    if (error.message.includes('Ya existe una relación')) {
      // Mostrar mensaje específico para duplicados
      alert('Ya tienes una relación con este usuario');
    } else if (error.message.includes('token')) {
      // Redirigir a login
      window.location.href = '/login';
    } else if (error.message.includes('No puedes enviar')) {
      // No puedes enviar solicitud a ti mismo
      alert('No puedes enviar una solicitud a ti mismo');
    }
  }
}
```

---

## ✅ Checklist de Integración

- [ ] Crear archivo `lib/amigos.ts` con todas las funciones helper
- [ ] Definir tipos TypeScript actualizados (incluir `amigoUserId`, `solicitadoPor`)
- [ ] Configurar `API_BASE_URL` en variables de entorno
- [ ] Implementar función `getToken()` para obtener token de localStorage
- [ ] Implementar función `apiRequest()` para requests genéricos
- [ ] Implementar función `searchUsuarios()` (NUEVO)
- [ ] Implementar función `enviarSolicitud()` (NUEVO)
- [ ] Implementar función `getSolicitudesRecibidas()` (NUEVO)
- [ ] Implementar función `aceptarSolicitud()` (NUEVO)
- [ ] Implementar función `rechazarSolicitud()` (NUEVO)
- [ ] Actualizar función `getAmigos()` (ahora solo devuelve activos)
- [ ] Actualizar tipos para incluir nuevos campos
- [ ] Actualizar componente de búsqueda de usuarios
- [ ] Crear componente de solicitudes recibidas
- [ ] Implementar flujo completo: buscar → enviar → aceptar → chatear
- [ ] Manejar errores apropiadamente
- [ ] Probar todos los endpoints
- [ ] Verificar que el token se envía correctamente
- [ ] Verificar validación de amistad mutua en chat

---

## 🚀 Migración desde Sistema Anterior

### Cambios Importantes

1. **`getAmigos()` ahora solo devuelve amigos activos**
   - Antes: Devolvía todos los amigos
   - Ahora: Solo devuelve amigos con estado 'activo'
   - Para ver solicitudes pendientes: usar `getSolicitudesRecibidas()`

2. **Nuevos campos en respuestas**
   - `amigoUserId`: ID del usuario que es el amigo
   - `solicitadoPor`: ID del usuario que envió la solicitud

3. **Nuevos estados válidos**
   - Agregado: `'rechazada'`
   - Estados completos: `'pendiente' | 'activo' | 'rechazada' | 'bloqueado'`

4. **Sistema de solicitudes obligatorio**
   - Ya no se pueden agregar amigos directamente
   - Debe seguirse el flujo: buscar → enviar solicitud → aceptar

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT válido
2. **Amistad Mutua**: Solo usuarios con estado 'activo' mutuo pueden chatear
3. **Validación de Email**: El backend valida que el email sea único por usuario
4. **Estados Válidos**: Solo se aceptan 'pendiente', 'activo', 'rechazada', 'bloqueado'
5. **Búsqueda de Usuarios vs Amigos**:
   - `GET /api/amigos/usuarios/search`: Busca en todos los usuarios del sistema
   - `GET /api/amigos/search`: Busca solo entre tus amigos
6. **Solicitudes**: Al aceptar una solicitud, se crea automáticamente la relación inversa
7. **Errores**: Siempre manejar errores y mostrar mensajes apropiados al usuario
8. **Loading States**: Mostrar estados de carga mientras se hacen las peticiones
9. **Optimistic Updates**: Considerar actualizar la UI antes de recibir respuesta del servidor

---

## 🔗 Referencias

- [Documentación del Backend](../integracion_endpoints/amigos.md)
- [Milestone 3 Frontend](../Frontend/milestone3.md)

---

**Última actualización**: Sistema completo de solicitudes de amistad implementado
