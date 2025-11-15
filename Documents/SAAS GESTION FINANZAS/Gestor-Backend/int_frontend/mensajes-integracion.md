# Integración Frontend: Endpoints de Mensajes

## Objetivo
Este documento describe cómo integrar los endpoints de mensajes del backend con el frontend, incluyendo todos los endpoints, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Mensajes

### 1. Obtener Todos los Mensajes

**Endpoint:**
```
GET /api/mensajes?leido=true|false
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `leido` (opcional): Filtrar por estado de lectura (`true` o `false`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "remitente": "Sistema",
      "asunto": "Recordatorio de pago",
      "contenido": "Debes pagar 30€ por el gasto compartido...",
      "leido": false,
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación (TypeScript/JavaScript):**
```typescript
const getMensajes = async (leido?: boolean): Promise<Mensaje[]> => {
  const token = localStorage.getItem('token');
  
  let url = 'http://localhost:4444/api/mensajes';
  if (leido !== undefined) {
    url += `?leido=${leido}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener mensajes');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Mensaje por ID

**Endpoint:**
```
GET /api/mensajes/:id
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
    "remitente": "Sistema",
    "asunto": "Recordatorio de pago",
    "contenido": "Debes pagar 30€ por el gasto compartido...",
    "leido": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

**Ejemplo de implementación:**
```typescript
const getMensajeById = async (id: string): Promise<Mensaje> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/mensajes/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error('Error al obtener mensaje');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Crear Nuevo Mensaje

**Endpoint:**
```
POST /api/mensajes
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "remitente": "Sistema",
  "asunto": "Recordatorio de pago",
  "contenido": "Debes pagar 30€ por el gasto compartido con Juan Pérez",
  "leido": false
}
```

**Campos:**
- `remitente` (string, requerido): Nombre del remitente del mensaje
- `asunto` (string, requerido): Asunto del mensaje
- `contenido` (string, requerido): Contenido del mensaje
- `leido` (boolean, opcional): Estado de lectura (default: `false`)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "remitente": "Sistema",
    "asunto": "Recordatorio de pago",
    "contenido": "Debes pagar 30€ por el gasto compartido con Juan Pérez",
    "leido": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Mensaje creado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const createMensaje = async (data: CreateMensajeData): Promise<Mensaje> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/mensajes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear mensaje');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Marcar Mensaje como Leído

**Endpoint:**
```
PUT /api/mensajes/:id/leido
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
    "remitente": "Sistema",
    "asunto": "Recordatorio de pago",
    "contenido": "Debes pagar 30€ por el gasto compartido...",
    "leido": true,
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Mensaje marcado como leído"
}
```

**Ejemplo de implementación:**
```typescript
const markAsLeido = async (id: string): Promise<Mensaje> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/mensajes/${id}/leido`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error(error.error || 'Error al marcar mensaje como leído');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Marcar Todos los Mensajes como Leídos

**Endpoint:**
```
PUT /api/mensajes/leer-todos
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
    "mensajesActualizados": 5
  },
  "message": "5 mensaje(s) marcado(s) como leído(s)"
}
```

**Ejemplo de implementación:**
```typescript
const markAllAsLeidos = async (): Promise<{ mensajesActualizados: number }> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/mensajes/leer-todos', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al marcar todos los mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 6. Eliminar Mensaje

**Endpoint:**
```
DELETE /api/mensajes/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mensaje eliminado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const deleteMensaje = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/mensajes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error('Error al eliminar mensaje');
  }
};
```

---

### 7. Eliminar Todos los Mensajes

**Endpoint:**
```
DELETE /api/mensajes
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
    "mensajesEliminados": 10
  },
  "message": "10 mensaje(s) eliminado(s) exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const deleteAllMensajes = async (): Promise<{ mensajesEliminados: number } => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/mensajes', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al eliminar todos los mensajes');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Funciones Helper Completas

### Archivo: `lib/mensajes.ts` (o similar en tu proyecto)

```typescript
// Tipos
export interface Mensaje {
  _id: string;
  userId: string;
  remitente: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  createdAt: string;
}

export interface CreateMensajeData {
  remitente: string;
  asunto: string;
  contenido: string;
  leido?: boolean;
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
export const getMensajes = async (leido?: boolean): Promise<Mensaje[]> => {
  let url = '/api/mensajes';
  if (leido !== undefined) {
    url += `?leido=${leido}`;
  }
  
  const response = await apiRequest(url);
  
  if (!response.ok) {
    throw new Error('Error al obtener mensajes');
  }

  const result = await response.json();
  return result.data;
};

export const getMensajeById = async (id: string): Promise<Mensaje> => {
  const response = await apiRequest(`/api/mensajes/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error('Error al obtener mensaje');
  }

  const result = await response.json();
  return result.data;
};

export const createMensaje = async (data: CreateMensajeData): Promise<Mensaje> => {
  const response = await apiRequest('/api/mensajes', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear mensaje');
  }

  const result = await response.json();
  return result.data;
};

export const markAsLeido = async (id: string): Promise<Mensaje> => {
  const response = await apiRequest(`/api/mensajes/${id}/leido`, {
    method: 'PUT'
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error(error.error || 'Error al marcar mensaje como leído');
  }

  const result = await response.json();
  return result.data;
};

export const markAllAsLeidos = async (): Promise<{ mensajesActualizados: number }> => {
  const response = await apiRequest('/api/mensajes/leer-todos', {
    method: 'PUT'
  });

  if (!response.ok) {
    throw new Error('Error al marcar todos los mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};

export const deleteMensaje = async (id: string): Promise<void> => {
  const response = await apiRequest(`/api/mensajes/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mensaje no encontrado');
    }
    throw new Error('Error al eliminar mensaje');
  }
};

export const deleteAllMensajes = async (): Promise<{ mensajesEliminados: number }> => {
  const response = await apiRequest('/api/mensajes', {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Error al eliminar todos los mensajes');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 📱 Ejemplo de Uso en Componente React/Next.js

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  getMensajes, 
  createMensaje, 
  deleteMensaje, 
  markAsLeido,
  markAllAsLeidos 
} from '@/lib/mensajes';
import type { Mensaje, CreateMensajeData } from '@/lib/mensajes';

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroLeido, setFiltroLeido] = useState<boolean | undefined>(undefined);

  // Cargar mensajes al montar el componente
  useEffect(() => {
    loadMensajes();
  }, [filtroLeido]);

  const loadMensajes = async () => {
    try {
      setLoading(true);
      const data = await getMensajes(filtroLeido);
      setMensajes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMensaje = async (data: CreateMensajeData) => {
    try {
      const nuevoMensaje = await createMensaje(data);
      setMensajes([nuevoMensaje, ...mensajes]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear mensaje');
    }
  };

  const handleDeleteMensaje = async (id: string) => {
    try {
      await deleteMensaje(id);
      setMensajes(mensajes.filter(m => m._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar mensaje');
    }
  };

  const handleMarkAsLeido = async (id: string) => {
    try {
      const mensajeActualizado = await markAsLeido(id);
      setMensajes(mensajes.map(m => 
        m._id === id ? mensajeActualizado : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como leído');
    }
  };

  const handleMarkAllAsLeidos = async () => {
    try {
      await markAllAsLeidos();
      // Recargar mensajes para reflejar cambios
      await loadMensajes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar todos como leídos');
    }
  };

  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length;

  if (loading) return <div>Cargando mensajes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Mis Mensajes</h1>
      
      <div>
        <button onClick={() => setFiltroLeido(undefined)}>
          Todos ({mensajes.length})
        </button>
        <button onClick={() => setFiltroLeido(false)}>
          No leídos ({mensajesNoLeidos})
        </button>
        <button onClick={() => setFiltroLeido(true)}>
          Leídos ({mensajes.length - mensajesNoLeidos})
        </button>
        {mensajesNoLeidos > 0 && (
          <button onClick={handleMarkAllAsLeidos}>
            Marcar todos como leídos
          </button>
        )}
      </div>

      <div>
        {mensajes.map(mensaje => (
          <div 
            key={mensaje._id} 
            style={{ 
              opacity: mensaje.leido ? 0.7 : 1,
              fontWeight: mensaje.leido ? 'normal' : 'bold'
            }}
          >
            <h3>{mensaje.asunto}</h3>
            <p>De: {mensaje.remitente}</p>
            <p>{mensaje.contenido}</p>
            <p>{new Date(mensaje.createdAt).toLocaleString()}</p>
            
            {!mensaje.leido && (
              <button onClick={() => handleMarkAsLeido(mensaje._id)}>
                Marcar como leído
              </button>
            )}
            <button onClick={() => handleDeleteMensaje(mensaje._id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔐 Manejo de Errores

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Mensaje creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes (remitente, asunto, contenido)
- **401 Unauthorized**: Token inválido o faltante
- **404 Not Found**: Mensaje no encontrado
- **500 Internal Server Error**: Error del servidor

### Manejo de Errores en el Frontend

```typescript
try {
  const mensaje = await createMensaje({
    remitente: 'Sistema',
    asunto: 'Recordatorio',
    contenido: 'Mensaje de prueba'
  });
} catch (error) {
  if (error instanceof Error) {
    // Mostrar mensaje de error al usuario
    console.error(error.message);
    
    // Manejar errores específicos
    if (error.message.includes('remitente')) {
      // Mostrar mensaje específico para campo remitente
    } else if (error.message.includes('token')) {
      // Redirigir a login
      window.location.href = '/login';
    } else if (error.message.includes('no encontrado')) {
      // Mensaje no existe
    }
  }
}
```

### Validaciones del Backend

El backend valida los siguientes campos:
- `remitente`: Requerido, string no vacío
- `asunto`: Requerido, string no vacío
- `contenido`: Requerido, string no vacío
- `leido`: Opcional, boolean (default: `false`)

---

## ✅ Checklist de Integración

- [ ] Crear archivo `lib/mensajes.ts` con todas las funciones helper
- [ ] Definir tipos TypeScript para `Mensaje`, `CreateMensajeData`
- [ ] Configurar `API_BASE_URL` en variables de entorno
- [ ] Implementar función `getToken()` para obtener token de localStorage
- [ ] Implementar función `apiRequest()` para requests genéricos
- [ ] Implementar todas las funciones de API (getMensajes, createMensaje, etc.)
- [ ] Crear componente de mensajes para mostrar lista de mensajes
- [ ] Implementar filtrado por estado leído/no leído
- [ ] Implementar funcionalidad de marcar como leído
- [ ] Implementar funcionalidad de eliminar mensajes
- [ ] Manejar errores apropiadamente
- [ ] Probar todos los endpoints
- [ ] Verificar que el token se envía correctamente
- [ ] Verificar que los errores se manejan correctamente
- [ ] Implementar indicador de mensajes no leídos
- [ ] Implementar funcionalidad de "marcar todos como leídos"

---

## 🚀 Características Adicionales

### Ordenamiento
Los mensajes se ordenan automáticamente por fecha descendente (más recientes primero) en el backend.

### Filtrado
Puedes filtrar mensajes por estado de lectura usando el query parameter `leido`:
- `GET /api/mensajes?leido=false` - Solo mensajes no leídos
- `GET /api/mensajes?leido=true` - Solo mensajes leídos
- `GET /api/mensajes` - Todos los mensajes

### Seguridad
- Todos los endpoints requieren autenticación
- Los usuarios solo pueden acceder a sus propios mensajes
- El backend valida automáticamente la propiedad del mensaje antes de permitir operaciones

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT válido
2. **Validación de Campos**: El backend valida que remitente, asunto y contenido no estén vacíos
3. **Ordenamiento**: Los mensajes se ordenan por fecha descendente (más recientes primero)
4. **Filtrado**: Usa el query parameter `leido` para filtrar mensajes
5. **Errores**: Siempre manejar errores y mostrar mensajes apropiados al usuario
6. **Loading States**: Mostrar estados de carga mientras se hacen las peticiones
7. **Optimistic Updates**: Considerar actualizar la UI antes de recibir respuesta del servidor para mejor UX
8. **Indicadores Visuales**: Mostrar claramente qué mensajes están leídos y cuáles no
9. **Fecha de Creación**: El campo `createdAt` viene en formato ISO 8601, usar `new Date()` para parsearlo

---

## 🔗 Referencias

- [Documentación del Backend](../integracion_endpoints/mensajes.md)
- Base URL: `http://localhost:4444` (configurable mediante variable de entorno)

---

## 💡 Ejemplos de Casos de Uso

### Caso 1: Mostrar Bandeja de Entrada
```typescript
// Obtener solo mensajes no leídos
const mensajesNoLeidos = await getMensajes(false);
```

### Caso 2: Crear Notificación del Sistema
```typescript
// Crear mensaje de notificación
await createMensaje({
  remitente: 'Sistema',
  asunto: 'Nuevo gasto compartido',
  contenido: 'Juan Pérez ha compartido un gasto contigo',
  leido: false
});
```

### Caso 3: Marcar Mensaje como Leído al Abrirlo
```typescript
// Al abrir un mensaje, marcarlo como leído
const mensaje = await getMensajeById(id);
if (!mensaje.leido) {
  await markAsLeido(id);
}
```

### Caso 4: Limpiar Todos los Mensajes Leídos
```typescript
// Obtener mensajes leídos y eliminarlos
const mensajesLeidos = await getMensajes(true);
for (const mensaje of mensajesLeidos) {
  await deleteMensaje(mensaje._id);
}
```

---

## 🎨 Sugerencias de UI/UX

1. **Badge de Contador**: Mostrar un badge con el número de mensajes no leídos
2. **Diferencia Visual**: Usar estilos diferentes para mensajes leídos vs no leídos
3. **Acciones Rápidas**: Botones para "Marcar todos como leídos" y "Eliminar todos"
4. **Filtros Rápidos**: Tabs o botones para filtrar por estado
5. **Auto-refresh**: Considerar actualizar la lista periódicamente para nuevos mensajes
6. **Notificaciones**: Mostrar notificaciones cuando lleguen nuevos mensajes

---

## 💬 Endpoints de Chat (Mensajes entre Usuarios)

> **Nota:** Los endpoints de chat son diferentes a los mensajes del sistema. Los mensajes de chat permiten comunicación directa entre usuarios a través de sus amigos.

### 1. Obtener Lista de Chats

**Endpoint:**
```
GET /api/chat/amigos
```

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
      "amigoId": "507f1f77bcf86cd799439011",
      "amigoNombre": "Juan Pérez",
      "amigoEmail": "juan.perez@example.com",
      "ultimoMensaje": {
        "contenido": "Hola, ¿cómo estás?",
        "fecha": "2024-11-15T10:00:00.000Z",
        "esSistema": false
      },
      "noLeidos": 3
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const getChatsList = async (): Promise<Chat[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/chat/amigos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener lista de chats');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 2. Obtener Mensajes de un Chat

**Endpoint:**
```
GET /api/chat/:amigoId/mensajes
```

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
      "remitenteId": "507f1f77bcf86cd799439012",
      "destinatarioId": "507f1f77bcf86cd799439013",
      "amigoId": "507f1f77bcf86cd799439014",
      "contenido": "Hola, ¿cómo estás?",
      "esSistema": false,
      "leido": false,
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

**Ejemplo de implementación:**
```typescript
const getMensajesByAmigo = async (amigoId: string): Promise<MensajeChat[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/chat/${amigoId}/mensajes`, {
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
    throw new Error('Error al obtener mensajes del chat');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 3. Enviar Mensaje en el Chat

**Endpoint:**
```
POST /api/chat/:amigoId/mensajes
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "contenido": "Hola, ¿cómo estás?",
  "esSistema": false
}
```

**Campos:**
- `contenido` (string, requerido): Contenido del mensaje
- `esSistema` (boolean, opcional): Si es mensaje del sistema (default: `false`)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "remitenteId": "507f1f77bcf86cd799439012",
    "destinatarioId": "507f1f77bcf86cd799439013",
    "amigoId": "507f1f77bcf86cd799439014",
    "contenido": "Hola, ¿cómo estás?",
    "esSistema": false,
    "leido": false,
    "createdAt": "2024-11-15T10:00:00.000Z"
  },
  "message": "Mensaje enviado exitosamente"
}
```

**Ejemplo de implementación:**
```typescript
const sendMensaje = async (
  amigoId: string, 
  contenido: string, 
  esSistema: boolean = false
): Promise<MensajeChat> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/chat/${amigoId}/mensajes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contenido, esSistema })
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al enviar mensaje');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 4. Marcar Mensajes como Leídos

**Endpoint:**
```
PUT /api/chat/:amigoId/leer
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
    "mensajesActualizados": 5
  },
  "message": "5 mensaje(s) marcado(s) como leído(s)"
}
```

**Ejemplo de implementación:**
```typescript
const markChatAsLeido = async (amigoId: string): Promise<{ mensajesActualizados: number }> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:4444/api/chat/${amigoId}/leer`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al marcar mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Funciones Helper para Chat

### Archivo: `lib/chat.ts` (o similar en tu proyecto)

```typescript
// Tipos
export interface MensajeChat {
  _id: string;
  remitenteId: string;
  destinatarioId: string;
  amigoId: string;
  contenido: string;
  esSistema: boolean;
  leido: boolean;
  createdAt: string;
}

export interface Chat {
  amigoId: string;
  amigoNombre: string;
  amigoEmail: string;
  ultimoMensaje: {
    contenido: string;
    fecha: string;
    esSistema: boolean;
  } | null;
  noLeidos: number;
}

export interface SendMensajeData {
  contenido: string;
  esSistema?: boolean;
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

// Funciones de API para Chat
export const getChatsList = async (): Promise<Chat[]> => {
  const response = await apiRequest('/api/chat/amigos');
  
  if (!response.ok) {
    throw new Error('Error al obtener lista de chats');
  }

  const result = await response.json();
  return result.data;
};

export const getMensajesByAmigo = async (amigoId: string): Promise<MensajeChat[]> => {
  const response = await apiRequest(`/api/chat/${amigoId}/mensajes`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al obtener mensajes del chat');
  }

  const result = await response.json();
  return result.data;
};

export const sendMensaje = async (
  amigoId: string,
  data: SendMensajeData
): Promise<MensajeChat> => {
  const response = await apiRequest(`/api/chat/${amigoId}/mensajes`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al enviar mensaje');
  }

  const result = await response.json();
  return result.data;
};

export const markChatAsLeido = async (amigoId: string): Promise<{ mensajesActualizados: number }> => {
  const response = await apiRequest(`/api/chat/${amigoId}/leer`, {
    method: 'PUT'
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error(error.error || 'Error al marcar mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 📱 Ejemplo de Componente de Chat

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  getChatsList, 
  getMensajesByAmigo, 
  sendMensaje,
  markChatAsLeido 
} from '@/lib/chat';
import type { Chat, MensajeChat } from '@/lib/chat';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [amigoSeleccionado, setAmigoSeleccionado] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (amigoSeleccionado) {
      loadMensajes(amigoSeleccionado);
      // Marcar como leídos al abrir el chat
      markChatAsLeido(amigoSeleccionado).catch(console.error);
    }
  }, [amigoSeleccionado]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await getChatsList();
      setChats(data);
    } catch (err) {
      console.error('Error al cargar chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMensajes = async (amigoId: string) => {
    try {
      const data = await getMensajesByAmigo(amigoId);
      setMensajes(data);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  };

  const handleSendMensaje = async () => {
    if (!amigoSeleccionado || !nuevoMensaje.trim()) return;

    try {
      const mensaje = await sendMensaje(amigoSeleccionado, {
        contenido: nuevoMensaje.trim()
      });
      setMensajes([...mensajes, mensaje]);
      setNuevoMensaje('');
      // Recargar lista de chats para actualizar último mensaje
      await loadChats();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  if (loading) return <div>Cargando chats...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Lista de chats */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc' }}>
        <h2>Chats</h2>
        {chats.map(chat => (
          <div
            key={chat.amigoId}
            onClick={() => setAmigoSeleccionado(chat.amigoId)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: amigoSeleccionado === chat.amigoId ? '#f0f0f0' : 'white',
              fontWeight: chat.noLeidos > 0 ? 'bold' : 'normal'
            }}
          >
            <h3>{chat.amigoNombre}</h3>
            {chat.ultimoMensaje && (
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                {chat.ultimoMensaje.contenido}
              </p>
            )}
            {chat.noLeidos > 0 && (
              <span style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.8em'
              }}>
                {chat.noLeidos}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Área de mensajes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {amigoSeleccionado ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {mensajes.map(mensaje => (
                <div
                  key={mensaje._id}
                  style={{
                    marginBottom: '10px',
                    padding: '10px',
                    backgroundColor: mensaje.esSistema ? '#fff3cd' : '#f8f9fa',
                    borderRadius: '5px'
                  }}
                >
                  <p>{mensaje.contenido}</p>
                  <small>{new Date(mensaje.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #ccc' }}>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMensaje()}
                placeholder="Escribe un mensaje..."
                style={{ width: '80%', padding: '10px' }}
              />
              <button onClick={handleSendMensaje}>Enviar</button>
            </div>
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Selecciona un chat para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔐 Manejo de Errores en Chat

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Mensaje enviado exitosamente
- **400 Bad Request**: Datos inválidos (contenido vacío, amigoId inválido)
- **401 Unauthorized**: Token inválido o faltante
- **404 Not Found**: Amigo no encontrado
- **500 Internal Server Error**: Error del servidor

### Validaciones del Backend

- `amigoId`: Debe ser un ObjectId válido y pertenecer al usuario
- `contenido`: Requerido, string no vacío
- `esSistema`: Opcional, boolean (default: `false`)
- No se puede enviar mensajes a uno mismo

---

## 📝 Notas Importantes sobre Chat

1. **Diferencia con Mensajes del Sistema**: Los mensajes de chat (`/api/chat`) son para comunicación entre usuarios, mientras que los mensajes del sistema (`/api/mensajes`) son notificaciones del sistema.

2. **Ordenamiento**: Los mensajes se ordenan por fecha ascendente (más antiguos primero) para mostrar el historial cronológicamente.

3. **Lista de Chats**: Se ordena por fecha del último mensaje (más recientes primero).

4. **Marcado como Leído**: Al abrir un chat, considera marcar automáticamente los mensajes como leídos.

5. **Auto-refresh**: Considera implementar polling o WebSockets para recibir mensajes en tiempo real.

---

**Última actualización:** Noviembre 2024

