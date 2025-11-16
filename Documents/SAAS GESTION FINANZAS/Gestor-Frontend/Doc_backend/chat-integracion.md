# Integración Frontend: Endpoints de Chat

## Objetivo
Este documento describe cómo integrar los endpoints de chat del backend con el frontend, incluyendo el sistema completo de mensajería individual por amigo, formatos de datos, ejemplos de implementación y funciones helper.

---

## 🎯 Flujo del Sistema de Chat

El sistema de chat funciona de la siguiente manera:

1. **Obtener lista de chats** → Ver todos los chats con amigos activos y último mensaje
2. **Abrir chat** → Obtener mensajes de un chat específico con un amigo
3. **Enviar mensaje** → Enviar un mensaje en el chat
4. **Marcar como leído** → Marcar mensajes no leídos como leídos
5. **Marcar todos como leídos** → Marcar todos los mensajes del chat como leídos

**Importante:** Solo puedes chatear con amigos que tengan estado 'activo' (amistad mutua confirmada).

---

## 🏗️ Estructura del Backend (MVC)

### Endpoints Disponibles

**Base URL:** `http://localhost:4444`

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints de Chat

### 1. Obtener Lista de Chats con Último Mensaje

**Endpoint:**
```
GET /api/chat/amigos
```

**Descripción:** Obtiene la lista de todos los chats con amigos activos, incluyendo el último mensaje de cada chat y el conteo de mensajes no leídos.

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
    },
    {
      "amigoId": "507f1f77bcf86cd799439012",
      "amigoNombre": "María García",
      "amigoEmail": "maria.garcia@example.com",
      "ultimoMensaje": null,
      "noLeidos": 0
    }
  ]
}
```

**Campos de respuesta:**
- `amigoId`: ID del amigo (usado para obtener mensajes del chat)
- `amigoNombre`: Nombre del amigo
- `amigoEmail`: Email del amigo
- `ultimoMensaje`: Objeto con el último mensaje o `null` si no hay mensajes
  - `contenido`: Contenido del mensaje
  - `fecha`: Fecha en formato ISO
  - `esSistema`: Si es un mensaje del sistema
- `noLeidos`: Número de mensajes no leídos donde el usuario es destinatario

**Nota:** Los chats se ordenan por fecha del último mensaje (más recientes primero). Los chats sin mensajes aparecen al final.

**Ejemplo de implementación:**
```typescript
interface UltimoMensaje {
  contenido: string;
  fecha: string;
  esSistema: boolean;
}

interface ChatListItem {
  amigoId: string;
  amigoNombre: string;
  amigoEmail: string;
  ultimoMensaje: UltimoMensaje | null;
  noLeidos: number;
}

const getChatsList = async (): Promise<ChatListItem[]> => {
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

### 2. Obtener Mensajes de un Chat Específico

**Endpoint:**
```
GET /api/chat/:amigoId/mensajes
```

**Descripción:** Obtiene todos los mensajes de un chat específico con un amigo. Los mensajes se ordenan por fecha ascendente (más antiguos primero).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `amigoId` (string, requerido): ID del amigo

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "remitenteId": "507f1f77bcf86cd799439012",
      "destinatarioId": "507f1f77bcf86cd799439013",
      "amigoId": "507f1f77bcf86cd799439011",
      "contenido": "Hola, ¿cómo estás?",
      "esSistema": false,
      "leido": true,
      "createdAt": "2024-11-15T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "remitenteId": "507f1f77bcf86cd799439013",
      "destinatarioId": "507f1f77bcf86cd799439012",
      "amigoId": "507f1f77bcf86cd799439011",
      "contenido": "Bien, gracias por preguntar",
      "esSistema": false,
      "leido": false,
      "createdAt": "2024-11-15T10:05:00.000Z"
    }
  ]
}
```

**Campos de respuesta:**
- `_id`: ID del mensaje
- `remitenteId`: ID del usuario que envió el mensaje
- `destinatarioId`: ID del usuario que recibió el mensaje
- `amigoId`: ID del amigo (relación de amistad)
- `contenido`: Contenido del mensaje
- `esSistema`: Si es un mensaje del sistema (ej: recordatorios de pago)
- `leido`: Si el mensaje ha sido leído
- `createdAt`: Fecha de creación en formato ISO

**Errores posibles:**
- `400`: ID de amigo inválido
- `401`: Usuario no autenticado
- `404`: Amigo no encontrado o no pertenece al usuario
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface MensajeChat {
  _id: string;
  remitenteId: string;
  destinatarioId: string;
  amigoId: string;
  contenido: string;
  esSistema: boolean;
  leido: boolean;
  createdAt: string;
}

const getMensajesByAmigo = async (amigoId: string): Promise<MensajeChat[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/chat/${amigoId}/mensajes`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    if (response.status === 400) {
      throw new Error('ID de amigo inválido');
    }
    throw new Error('Error al obtener mensajes');
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

**Descripción:** Envía un nuevo mensaje en el chat con un amigo. Solo funciona si ambos usuarios son amigos activos mutuos.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `amigoId` (string, requerido): ID del amigo

**Request Body:**
```json
{
  "contenido": "Hola, ¿cómo estás?",
  "esSistema": false
}
```

**Campos del request:**
- `contenido` (string, requerido): Contenido del mensaje (no puede estar vacío)
- `esSistema` (boolean, opcional): Si es un mensaje del sistema (default: `false`)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439022",
    "remitenteId": "507f1f77bcf86cd799439012",
    "destinatarioId": "507f1f77bcf86cd799439013",
    "amigoId": "507f1f77bcf86cd799439011",
    "contenido": "Hola, ¿cómo estás?",
    "esSistema": false,
    "leido": false,
    "createdAt": "2024-11-15T10:10:00.000Z"
  },
  "message": "Mensaje enviado exitosamente"
}
```

**Errores posibles:**
- `400`: ID de amigo inválido, contenido vacío, o intentando enviar mensaje a uno mismo
- `401`: Usuario no autenticado
- `403`: No puedes enviar mensajes (amistad no activa o no mutua)
- `404`: Amigo no encontrado o usuario destinatario no existe
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface CreateMensajeRequest {
  contenido: string;
  esSistema?: boolean;
}

const createMensaje = async (
  amigoId: string,
  contenido: string,
  esSistema: boolean = false
): Promise<MensajeChat> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/chat/${amigoId}/mensajes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contenido, esSistema })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) {
      throw new Error(error.error || 'Contenido inválido');
    }
    if (response.status === 403) {
      throw new Error('No puedes enviar mensajes a este usuario. Primero deben ser amigos mutuos con estado activo.');
    }
    if (response.status === 404) {
      throw new Error('Amigo o usuario destinatario no encontrado');
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

**Descripción:** Marca como leídos todos los mensajes no leídos donde el usuario es destinatario en un chat específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `amigoId` (string, requerido): ID del amigo

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mensajesActualizados": 3
  },
  "message": "3 mensaje(s) marcado(s) como leído(s)"
}
```

**Campos de respuesta:**
- `mensajesActualizados`: Número de mensajes que fueron marcados como leídos

**Errores posibles:**
- `400`: ID de amigo inválido
- `401`: Usuario no autenticado
- `404`: Amigo no encontrado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
interface MarkAsLeidoResponse {
  mensajesActualizados: number;
}

const markAsLeido = async (
  amigoId: string
): Promise<MarkAsLeidoResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/chat/${amigoId}/leer`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al marcar mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};
```

---

### 5. Marcar Todos los Mensajes como Leídos

**Endpoint:**
```
PUT /api/chat/:amigoId/leer-todos
```

**Descripción:** Marca TODOS los mensajes del chat como leídos (incluso los que ya estaban leídos). Útil para forzar la actualización del estado de lectura.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `amigoId` (string, requerido): ID del amigo

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

**Campos de respuesta:**
- `mensajesActualizados`: Número de mensajes que fueron actualizados (puede incluir mensajes que ya estaban leídos)

**Errores posibles:**
- `400`: ID de amigo inválido
- `401`: Usuario no autenticado
- `404`: Amigo no encontrado
- `500`: Error del servidor

**Ejemplo de implementación:**
```typescript
const markAllAsLeidos = async (
  amigoId: string
): Promise<MarkAsLeidoResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:4444/api/chat/${amigoId}/leer-todos`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Amigo no encontrado');
    }
    throw new Error('Error al marcar todos los mensajes como leídos');
  }

  const result = await response.json();
  return result.data;
};
```

---

## 🔧 Funciones Helper Completas

Aquí tienes un archivo completo con todas las funciones helper para integrar el chat:

```typescript
// chat.service.ts

const API_BASE_URL = 'http://localhost:4444';
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Tipos
export interface UltimoMensaje {
  contenido: string;
  fecha: string;
  esSistema: boolean;
}

export interface ChatListItem {
  amigoId: string;
  amigoNombre: string;
  amigoEmail: string;
  ultimoMensaje: UltimoMensaje | null;
  noLeidos: number;
}

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

export interface CreateMensajeRequest {
  contenido: string;
  esSistema?: boolean;
}

export interface MarkAsLeidoResponse {
  mensajesActualizados: number;
}

// Funciones
export const chatService = {
  /**
   * Obtiene la lista de chats con último mensaje
   */
  getChatsList: async (): Promise<ChatListItem[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/amigos`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al obtener lista de chats');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Obtiene todos los mensajes de un chat específico
   */
  getMensajesByAmigo: async (amigoId: string): Promise<MensajeChat[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/${amigoId}/mensajes`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Amigo no encontrado');
      }
      if (response.status === 400) {
        throw new Error('ID de amigo inválido');
      }
      throw new Error('Error al obtener mensajes');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Envía un mensaje en el chat
   */
  createMensaje: async (
    amigoId: string,
    contenido: string,
    esSistema: boolean = false
  ): Promise<MensajeChat> => {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/${amigoId}/mensajes`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contenido, esSistema })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 400) {
        throw new Error(error.error || 'Contenido inválido');
      }
      if (response.status === 403) {
        throw new Error('No puedes enviar mensajes a este usuario. Primero deben ser amigos mutuos con estado activo.');
      }
      if (response.status === 404) {
        throw new Error('Amigo o usuario destinatario no encontrado');
      }
      throw new Error(error.error || 'Error al enviar mensaje');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Marca mensajes no leídos como leídos
   */
  markAsLeido: async (
    amigoId: string
  ): Promise<MarkAsLeidoResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/${amigoId}/leer`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Amigo no encontrado');
      }
      throw new Error('Error al marcar mensajes como leídos');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Marca todos los mensajes del chat como leídos
   */
  markAllAsLeidos: async (
    amigoId: string
  ): Promise<MarkAsLeidoResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/${amigoId}/leer-todos`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Amigo no encontrado');
      }
      throw new Error('Error al marcar todos los mensajes como leídos');
    }

    const result = await response.json();
    return result.data;
  }
};
```

---

## 📱 Ejemplos de Uso en Componentes

### Ejemplo 1: Lista de Chats (React)

```typescript
import React, { useEffect, useState } from 'react';
import { chatService, ChatListItem } from './services/chat.service';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const data = await chatService.getChatsList();
        setChats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
    // Refrescar cada 30 segundos
    const interval = setInterval(loadChats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Cargando chats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="chat-list">
      {chats.length === 0 ? (
        <p>No tienes chats activos</p>
      ) : (
        chats.map((chat) => (
          <div key={chat.amigoId} className="chat-item">
            <h3>{chat.amigoNombre}</h3>
            {chat.ultimoMensaje && (
              <p className="last-message">
                {chat.ultimoMensaje.contenido}
              </p>
            )}
            {chat.noLeidos > 0 && (
              <span className="badge">{chat.noLeidos}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
```

### Ejemplo 2: Vista de Chat Individual (React)

```typescript
import React, { useEffect, useState, useRef } from 'react';
import { chatService, MensajeChat } from './services/chat.service';

interface ChatViewProps {
  amigoId: string;
  amigoNombre: string;
}

const ChatView: React.FC<ChatViewProps> = ({ amigoId, amigoNombre }) => {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId'); // Ajusta según tu auth

  useEffect(() => {
    const loadMensajes = async () => {
      try {
        setLoading(true);
        const data = await chatService.getMensajesByAmigo(amigoId);
        setMensajes(data);
        // Marcar como leídos al abrir el chat
        await chatService.markAsLeido(amigoId);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMensajes();
    // Refrescar mensajes cada 5 segundos
    const interval = setInterval(loadMensajes, 5000);
    return () => clearInterval(interval);
  }, [amigoId]);

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    try {
      setEnviando(true);
      const mensaje = await chatService.createMensaje(
        amigoId,
        nuevoMensaje.trim()
      );
      setMensajes([...mensajes, mensaje]);
      setNuevoMensaje('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div>Cargando mensajes...</div>;

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>{amigoNombre}</h2>
      </div>

      <div className="mensajes-container">
        {mensajes.map((mensaje) => {
          const esMio = mensaje.remitenteId === currentUserId;
          return (
            <div
              key={mensaje._id}
              className={`mensaje ${esMio ? 'mensaje-propio' : 'mensaje-otro'}`}
            >
              {mensaje.esSistema && (
                <span className="badge-sistema">Sistema</span>
              )}
              <p>{mensaje.contenido}</p>
              <span className="fecha">
                {new Date(mensaje.createdAt).toLocaleTimeString()}
              </span>
              {!esMio && !mensaje.leido && (
                <span className="no-leido">●</span>
              )}
            </div>
          );
        })}
        <div ref={mensajesEndRef} />
      </div>

      <form onSubmit={handleEnviarMensaje} className="chat-input">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={enviando}
        />
        <button type="submit" disabled={enviando || !nuevoMensaje.trim()}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default ChatView;
```

---

## 🔄 Manejo de Errores

### Errores Comunes y Cómo Manejarlos

```typescript
const handleChatError = (error: unknown, context: string) => {
  if (error instanceof Error) {
    // Errores de validación
    if (error.message.includes('inválido') || error.message.includes('requerido')) {
      console.error(`Error de validación en ${context}:`, error.message);
      // Mostrar mensaje al usuario
      return 'Por favor, verifica los datos ingresados';
    }

    // Errores de permisos
    if (error.message.includes('No puedes enviar mensajes')) {
      console.error(`Error de permisos en ${context}:`, error.message);
      return 'No puedes enviar mensajes a este usuario. Primero deben ser amigos mutuos.';
    }

    // Errores de no encontrado
    if (error.message.includes('no encontrado')) {
      console.error(`Recurso no encontrado en ${context}:`, error.message);
      return 'El recurso solicitado no existe';
    }

    // Error genérico
    console.error(`Error en ${context}:`, error.message);
    return 'Ocurrió un error. Por favor, intenta nuevamente';
  }

  return 'Error desconocido';
};

// Uso
try {
  await chatService.createMensaje(amigoId, contenido);
} catch (error) {
  const mensajeError = handleChatError(error, 'enviar mensaje');
  alert(mensajeError);
}
```

---

## 💡 Mejores Prácticas

### 1. **Polling para Mensajes Nuevos**
```typescript
// Refrescar mensajes periódicamente
useEffect(() => {
  const interval = setInterval(async () => {
    const nuevosMensajes = await chatService.getMensajesByAmigo(amigoId);
    setMensajes(nuevosMensajes);
  }, 5000); // Cada 5 segundos

  return () => clearInterval(interval);
}, [amigoId]);
```

### 2. **Marcar como Leído al Abrir Chat**
```typescript
useEffect(() => {
  const loadAndMarkAsRead = async () => {
    await chatService.getMensajesByAmigo(amigoId);
    await chatService.markAsLeido(amigoId);
  };
  loadAndMarkAsRead();
}, [amigoId]);
```

### 3. **Optimistic Updates**
```typescript
const handleEnviarMensaje = async (contenido: string) => {
  // Crear mensaje optimista
  const mensajeOptimista: MensajeChat = {
    _id: `temp-${Date.now()}`,
    remitenteId: currentUserId!,
    destinatarioId: destinatarioId,
    amigoId: amigoId,
    contenido,
    esSistema: false,
    leido: false,
    createdAt: new Date().toISOString()
  };

  // Agregar inmediatamente a la UI
  setMensajes([...mensajes, mensajeOptimista]);

  try {
    // Enviar al servidor
    const mensajeReal = await chatService.createMensaje(amigoId, contenido);
    // Reemplazar el optimista con el real
    setMensajes(prev => 
      prev.map(m => m._id === mensajeOptimista._id ? mensajeReal : m)
    );
  } catch (error) {
    // Revertir si falla
    setMensajes(prev => prev.filter(m => m._id !== mensajeOptimista._id));
    throw error;
  }
};
```

### 4. **Formatear Fechas de Mensajes**
```typescript
const formatMensajeFecha = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
  
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### 5. **Validar Contenido Antes de Enviar**
```typescript
const validarMensaje = (contenido: string): { valido: boolean; error?: string } => {
  if (!contenido.trim()) {
    return { valido: false, error: 'El mensaje no puede estar vacío' };
  }
  if (contenido.length > 1000) {
    return { valido: false, error: 'El mensaje es demasiado largo (máx. 1000 caracteres)' };
  }
  return { valido: true };
};
```

---

## 🎨 Consideraciones de UI/UX

### Indicadores Visuales

1. **Badge de no leídos**: Mostrar número de mensajes no leídos en la lista de chats
2. **Estado de lectura**: Mostrar si un mensaje fue leído (solo para mensajes propios)
3. **Mensajes del sistema**: Estilizar diferente los mensajes con `esSistema: true`
4. **Scroll automático**: Hacer scroll al final cuando hay nuevos mensajes
5. **Indicador de escritura**: Mostrar "escribiendo..." si el otro usuario está escribiendo (requiere WebSockets)

### Ejemplo de Estilos CSS

```css
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.badge {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.mensaje {
  padding: 0.75rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  max-width: 70%;
}

.mensaje-propio {
  background-color: #007bff;
  color: white;
  margin-left: auto;
}

.mensaje-otro {
  background-color: #e9ecef;
  color: #333;
}

.badge-sistema {
  background-color: #ffc107;
  color: #000;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.no-leido {
  color: #007bff;
  font-size: 0.75rem;
}
```

---

## 📝 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/chat/amigos` | Obtener lista de chats con último mensaje |
| `GET` | `/api/chat/:amigoId/mensajes` | Obtener mensajes de un chat |
| `POST` | `/api/chat/:amigoId/mensajes` | Enviar mensaje |
| `PUT` | `/api/chat/:amigoId/leer` | Marcar mensajes no leídos como leídos |
| `PUT` | `/api/chat/:amigoId/leer-todos` | Marcar todos los mensajes como leídos |

---

## ✅ Checklist de Integración

- [ ] Configurar base URL del API
- [ ] Implementar servicio de chat con todas las funciones
- [ ] Crear componente de lista de chats
- [ ] Crear componente de vista de chat individual
- [ ] Implementar envío de mensajes
- [ ] Implementar marcado como leído
- [ ] Agregar polling para mensajes nuevos
- [ ] Manejar errores apropiadamente
- [ ] Agregar indicadores visuales (badges, estados)
- [ ] Implementar scroll automático
- [ ] Validar contenido antes de enviar
- [ ] Agregar estilos y animaciones

---

## 🔗 Recursos Relacionados

- [Integración de Amigos](./amigos-integracion.md) - Para entender el sistema de amistad
- [Integración de Mensajes](./mensajes-integracion.md) - Para mensajes del sistema

---

**Última actualización:** 2024-11-15

