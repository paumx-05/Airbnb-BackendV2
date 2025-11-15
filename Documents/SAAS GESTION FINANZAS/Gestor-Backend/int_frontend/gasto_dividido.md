# Integración Frontend: División de Gastos y Mensajes Automáticos

## Objetivo
Este documento describe cómo funciona la división de gastos en el backend y cómo se integran los mensajes automáticos del sistema en el chat cuando se divide un gasto con amigos.

---

## 🎯 Funcionalidad

Cuando un usuario divide un gasto con uno o más amigos, el backend automáticamente:
1. Guarda el gasto con la información de división
2. Crea mensajes automáticos del sistema en el chat para cada amigo que no ha pagado
3. Los mensajes aparecen en el chat del amigo como recordatorios de pago

---

## 📋 Estructura de Datos

### Modelo de Gasto con División

```typescript
interface Gasto {
  _id: string;
  userId: string;
  descripcion: string;
  monto: number; // Monto que paga el usuario (su parte)
  fecha: string; // ISO date string
  categoria: string;
  mes: string;
  dividido?: Dividido[];
  createdAt: string;
}

interface Dividido {
  amigoId: string; // ⚠️ IMPORTANTE: ID del usuario amigo (amigoUserId), NO el ID del registro Amigo
  amigoNombre: string;
  montoDividido: number; // Parte que debe pagar el amigo
  pagado: boolean; // true = ya pagó, false = debe recibir mensaje
}
```

---

## 🔧 Endpoints

### Crear Gasto con División

**Endpoint:**
```
POST /api/gastos
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "descripcion": "Alquiler",
  "monto": 300.00,
  "fecha": "2024-01-15",
  "categoria": "Vivienda",
  "mes": "enero",
  "dividido": [
    {
      "amigoId": "507f1f77bcf86cd799439013",
      "amigoNombre": "Juan Pérez",
      "montoDividido": 300.00,
      "pagado": false
    }
  ]
}
```

**⚠️ IMPORTANTE - Campo `amigoId`:**
- El `amigoId` en el array `dividido` debe ser el **`amigoUserId`** (ID del usuario amigo)
- **NO** debe ser el `_id` del registro de Amigo
- Se obtiene del campo `amigoUserId` del objeto Amigo

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "descripcion": "Alquiler",
    "monto": 300.00,
    "fecha": "2024-01-15T00:00:00.000Z",
    "categoria": "Vivienda",
    "mes": "enero",
    "dividido": [
      {
        "amigoId": "507f1f77bcf86cd799439013",
        "amigoNombre": "Juan Pérez",
        "montoDividido": 300.00,
        "pagado": false
      }
    ],
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Gasto creado exitosamente"
}
```

---

## 💬 Mensajes Automáticos del Sistema

### ¿Cuándo se crean?

Los mensajes automáticos se crean cuando:
1. Se crea un gasto con división (`POST /api/gastos`)
2. Se actualiza un gasto con división (`PUT /api/gastos/:id`)
3. El amigo tiene `pagado: false`
4. El amigo tiene estado `'activo'` en la relación de amistad

### Estructura del Mensaje

```typescript
interface MensajeSistema {
  _id: string;
  remitenteId: string; // ID del usuario que creó el gasto
  destinatarioId: string; // ID del usuario amigo que debe pagar
  amigoId: string; // ID del registro Amigo del remitente
  contenido: string; // "Recordatorio de pago: Debes pagar 300.00€ por el gasto \"Alquiler\""
  esSistema: true; // Siempre true para estos mensajes
  leido: false; // Siempre false al crearse
  createdAt: string; // ISO date string
}
```

### Contenido del Mensaje

El contenido del mensaje sigue este formato:
```
Recordatorio de pago: Debes pagar {montoDividido}€ por el gasto "{descripcion}"
```

**Ejemplo:**
```
Recordatorio de pago: Debes pagar 300.00€ por el gasto "Alquiler"
```

---

## 📱 Implementación en el Frontend

### 1. Obtener Amigos para División

```typescript
import { getAmigos } from '@/lib/amigos';

// Obtener solo amigos activos
const amigos = await getAmigos(); // Solo devuelve amigos con estado 'activo'

// Para cada amigo, usar amigoUserId (no _id)
amigos.forEach(amigo => {
  console.log('ID del registro Amigo:', amigo._id);
  console.log('ID del usuario amigo (usar en dividido):', amigo.amigoUserId);
});
```

### 2. Crear Gasto con División

```typescript
interface CrearGastoDivididoData {
  descripcion: string;
  monto: number; // Monto total del gasto
  fecha: string;
  categoria: string;
  mes: string;
  dividido: {
    amigoId: string; // amigoUserId del Amigo
    amigoNombre: string;
    montoDividido: number;
    pagado: boolean;
  }[];
}

const crearGastoDividido = async (data: CrearGastoDivididoData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4444/api/gastos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear gasto');
  }

  const result = await response.json();
  return result.data;
};
```

### 3. Ejemplo Completo: Crear Gasto Dividido

```typescript
'use client';

import { useState } from 'react';
import { getAmigos } from '@/lib/amigos';
import { crearGastoDividido } from '@/lib/gastos';
import type { Amigo } from '@/lib/amigos';

export default function CrearGastoDividido() {
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([]);
  const [montosDivididos, setMontosDivididos] = useState<Record<string, number>>({});
  const [amigosPagados, setAmigosPagados] = useState<Record<string, boolean>>({});

  // Cargar amigos al montar
  useEffect(() => {
    loadAmigos();
  }, []);

  const loadAmigos = async () => {
    try {
      const data = await getAmigos();
      setAmigos(data);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
    }
  };

  const handleCrearGasto = async () => {
    const montoTotal = 600.00; // Ejemplo: 600€ de alquiler
    const totalPersonas = 1 + amigosSeleccionados.length; // Usuario + amigos
    
    // Calcular monto del usuario
    const montoUsuario = montoTotal / totalPersonas;
    
    // Calcular monto por amigo
    const montoPorAmigo = montoTotal / totalPersonas;

    // Preparar array de división
    const dividido = amigosSeleccionados.map(amigoUserId => {
      const amigo = amigos.find(a => a.amigoUserId === amigoUserId);
      return {
        amigoId: amigoUserId, // ⚠️ Usar amigoUserId, NO amigo._id
        amigoNombre: amigo?.nombre || '',
        montoDividido: montoPorAmigo,
        pagado: amigosPagados[amigoUserId] || false
      };
    });

    try {
      const gasto = await crearGastoDividido({
        descripcion: 'Alquiler',
        monto: montoUsuario, // Solo la parte del usuario
        fecha: new Date().toISOString(),
        categoria: 'Vivienda',
        mes: 'enero',
        dividido
      });

      console.log('Gasto creado:', gasto);
      
      // Recargar mensajes del chat para cada amigo que recibió mensaje
      for (const item of dividido) {
        if (!item.pagado) {
          // Recargar mensajes del chat del amigo
          await recargarMensajesChat(item.amigoId);
        }
      }
    } catch (error) {
      console.error('Error al crear gasto:', error);
    }
  };

  return (
    <div>
      {/* Formulario de creación de gasto */}
      {/* ... */}
    </div>
  );
}
```

### 4. Obtener y Mostrar Mensajes del Sistema

```typescript
import { getMensajesByAmigo } from '@/lib/chat';

const mostrarMensajesSistema = async (amigoId: string) => {
  // amigoId aquí es el _id del registro Amigo (no amigoUserId)
  const mensajes = await getMensajesByAmigo(amigoId);
  
  // Filtrar mensajes del sistema
  const mensajesSistema = mensajes.filter(m => m.esSistema);
  
  mensajesSistema.forEach(mensaje => {
    console.log('Mensaje del sistema:', mensaje.contenido);
    // Ejemplo: "Recordatorio de pago: Debes pagar 300.00€ por el gasto \"Alquiler\""
  });
};
```

### 5. Componente de Chat con Mensajes del Sistema

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getMensajesByAmigo } from '@/lib/chat';
import type { MensajeChat } from '@/lib/chat';

interface ChatProps {
  amigoId: string; // _id del registro Amigo
}

export default function Chat({ amigoId }: ChatProps) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);

  useEffect(() => {
    loadMensajes();
  }, [amigoId]);

  const loadMensajes = async () => {
    try {
      const data = await getMensajesByAmigo(amigoId);
      setMensajes(data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  return (
    <div className="chat-container">
      {mensajes.map(mensaje => (
        <div
          key={mensaje._id}
          className={`mensaje ${mensaje.esSistema ? 'mensaje-sistema' : ''}`}
        >
          <p>{mensaje.contenido}</p>
          {mensaje.esSistema && (
            <span className="badge-sistema">Sistema</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 Verificación y Troubleshooting

### Verificar que el Mensaje se Creó

#### 1. Revisar Logs del Backend

Después de crear un gasto dividido, deberías ver en los logs:
```
[Gasto] Mensaje de recordatorio creado para juan.perez@example.com
```

#### 2. Verificar en la Base de Datos

Consulta la colección `mensajechats`:
```javascript
db.mensajechats.find({
  esSistema: true,
  contenido: { $regex: "Recordatorio de pago" }
})
```

#### 3. Verificar desde el Frontend

```typescript
// Obtener mensajes del chat del amigo
const mensajes = await getMensajesByAmigo(amigoId);

// Filtrar mensajes del sistema
const mensajesSistema = mensajes.filter(m => m.esSistema);

console.log('Mensajes del sistema:', mensajesSistema);
```

### Problemas Comunes

#### ❌ Problema 1: El mensaje no se crea

**Causas posibles:**
1. El `amigoId` en `dividido` no es correcto
   - ✅ **Correcto**: Usar `amigo.amigoUserId`
   - ❌ **Incorrecto**: Usar `amigo._id`

2. El amigo no tiene estado 'activo'
   - Verificar: `amigo.estado === 'activo'`
   - Solo se crean mensajes para amigos activos

3. El campo `pagado` está en `true`
   - Si `pagado: true`, no se crea el mensaje
   - Solo se crean mensajes para amigos con `pagado: false`

**Solución:**
```typescript
// Verificar antes de crear el gasto
const amigo = await getAmigoById(amigoId);
if (amigo.estado !== 'activo') {
  console.error('El amigo no está activo');
  return;
}

// Asegurarse de usar amigoUserId
const dividido = [{
  amigoId: amigo.amigoUserId, // ✅ Correcto
  amigoNombre: amigo.nombre,
  montoDividido: 300.00,
  pagado: false // ✅ Debe ser false
}];
```

#### ❌ Problema 2: El mensaje no aparece en el chat

**Causas posibles:**
1. No se está recargando la lista de mensajes después de crear el gasto
2. El `amigoId` usado para obtener mensajes es incorrecto
3. El mensaje se creó pero no se está filtrando correctamente

**Solución:**
```typescript
// Después de crear el gasto, recargar mensajes
const crearGastoYRecargar = async () => {
  const gasto = await crearGastoDividido(data);
  
  // Recargar mensajes para cada amigo
  for (const item of data.dividido) {
    if (!item.pagado) {
      // Obtener el registro Amigo para usar su _id
      const amigo = amigos.find(a => a.amigoUserId === item.amigoId);
      if (amigo) {
        await loadMensajesChat(amigo._id); // Usar _id del Amigo, no amigoUserId
      }
    }
  }
};
```

#### ❌ Problema 3: El mensaje aparece duplicado

**Causa:**
- Se está creando el gasto múltiples veces
- O se está actualizando el gasto y se crea un nuevo mensaje en lugar de actualizar el existente

**Solución:**
- El backend ya maneja esto: si existe un mensaje para el mismo gasto y amigo, lo actualiza en lugar de crear uno nuevo
- Verificar que no se esté llamando `crearGastoDividido` múltiples veces

---

## 📊 Flujo Completo

### 1. Usuario Crea Gasto Dividido

```
Usuario (admin@example.com)
  ↓
Crea gasto: "Alquiler" - 600€
  ↓
Divide con: juan.perez@example.com (300€ cada uno)
  ↓
pagado: false
```

### 2. Backend Procesa

```
Backend recibe POST /api/gastos
  ↓
Guarda gasto con dividido[]
  ↓
Para cada item en dividido:
  - Si pagado === false
  - Si amigo.estado === 'activo'
  - Busca registro Amigo del usuario
  - Crea MensajeChat con:
    * remitenteId: admin@example.com
    * destinatarioId: juan.perez@example.com
    * contenido: "Recordatorio de pago: Debes pagar 300.00€ por el gasto \"Alquiler\""
    * esSistema: true
```

### 3. Frontend Muestra

```
juan.perez@example.com abre chat
  ↓
GET /api/chat/:amigoId/mensajes
  ↓
Recibe mensajes incluyendo el del sistema
  ↓
Muestra mensaje con estilo especial (esSistema: true)
```

---

## ✅ Checklist de Implementación

- [ ] Obtener lista de amigos activos usando `getAmigos()`
- [ ] Usar `amigo.amigoUserId` (no `amigo._id`) en el array `dividido`
- [ ] Calcular correctamente `montoDividido` para cada amigo
- [ ] Enviar `pagado: false` para amigos que deben recibir mensaje
- [ ] Manejar respuesta del backend después de crear gasto
- [ ] Recargar mensajes del chat después de crear gasto dividido
- [ ] Mostrar mensajes del sistema con estilo diferenciado (`esSistema: true`)
- [ ] Verificar que los mensajes aparecen en el chat del destinatario
- [ ] Manejar errores si el amigo no está activo
- [ ] Mostrar indicador visual cuando se crea un mensaje automático

---

## 🔗 Referencias

- [Documentación de Chat](./mensajes-integracion.md)
- [Documentación de Amigos](./amigos-integracion.md)
- [Backend: División de Gastos](../integracion_endpoints/gastos.md)

---

## 📝 Notas Importantes

1. **`amigoId` vs `amigoUserId`**:
   - `amigo._id`: ID del registro Amigo (usar para obtener mensajes del chat)
   - `amigo.amigoUserId`: ID del usuario amigo (usar en el array `dividido`)

2. **Solo amigos activos**:
   - Los mensajes solo se crean para amigos con estado `'activo'`
   - Verificar estado antes de permitir división

3. **Mensajes del sistema**:
   - Siempre tienen `esSistema: true`
   - Siempre tienen `leido: false` al crearse
   - El contenido sigue un formato específico

4. **Actualización de gastos**:
   - Si se actualiza un gasto con división, los mensajes existentes se actualizan
   - No se crean mensajes duplicados

5. **Recarga de mensajes**:
   - Después de crear un gasto dividido, recargar los mensajes del chat
   - Usar el `_id` del registro Amigo (no `amigoUserId`) para obtener mensajes

---

**Última actualización**: Sistema de mensajes automáticos implementado en el backend

