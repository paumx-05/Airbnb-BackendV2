# Chat: Reporte de Integración

## Resumen

Este reporte documenta la integración completa del módulo de chat con el backend MongoDB, reemplazando el sistema mock basado en localStorage por llamadas reales a la API del backend. El módulo permite a los usuarios enviar y recibir mensajes en tiempo real con sus amigos agregados.

**Alcance:** Integración completa del sistema de chat entre usuarios, incluyendo:
- Lista de chats con amigos
- Visualización de mensajes de un chat específico
- Envío de mensajes
- Marcado automático como leído
- Indicadores de mensajes no leídos

---

## Endpoints

### Base URL
`http://localhost:4444`

### Autenticación
Todos los endpoints requieren token JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Utilizados

#### 1. GET `/api/chat/amigos`
**Propósito:** Obtener lista de chats con todos los amigos

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

**Códigos de error:**
- `401 Unauthorized`: Token inválido o faltante
- `500 Internal Server Error`: Error del servidor

---

#### 2. GET `/api/chat/:amigoId/mensajes`
**Propósito:** Obtener todos los mensajes de un chat con un amigo específico

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

**Códigos de error:**
- `401 Unauthorized`: Token inválido o faltante
- `404 Not Found`: Amigo no encontrado
- `500 Internal Server Error`: Error del servidor

---

#### 3. POST `/api/chat/:amigoId/mensajes`
**Propósito:** Enviar un mensaje en un chat con un amigo

**Request Body:**
```json
{
  "contenido": "Hola, ¿cómo estás?",
  "esSistema": false
}
```

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

**Códigos de error:**
- `400 Bad Request`: Datos inválidos (contenido vacío)
- `401 Unauthorized`: Token inválido o faltante
- `404 Not Found`: Amigo no encontrado
- `500 Internal Server Error`: Error del servidor

---

#### 4. PUT `/api/chat/:amigoId/leer`
**Propósito:** Marcar todos los mensajes no leídos de un chat como leídos

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

**Códigos de error:**
- `401 Unauthorized`: Token inválido o faltante
- `404 Not Found`: Amigo no encontrado
- `500 Internal Server Error`: Error del servidor

---

#### 5. PUT `/api/chat/:amigoId/leer-todos`
**Propósito:** Marcar TODOS los mensajes de un chat como leídos (incluso los que ya estaban leídos). Útil para forzar la actualización del estado de lectura.

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

**Códigos de error:**
- `401 Unauthorized`: Token inválido o faltante
- `404 Not Found`: Amigo no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Cambios en Frontend

### Archivos Creados

1. **`models/chat.ts`**
   - Define interfaces TypeScript para mensajes de chat y respuestas del backend
   - Tipos: `MensajeChat`, `Chat`, `SendMensajeRequest`, `ChatError`

2. **`schemas/chat.schema.ts`**
   - Esquemas Zod para validación de requests y responses
   - Validación runtime de todos los datos del backend
   - Tipos derivados de los esquemas

3. **`services/chat.service.ts`**
   - Servicio centralizado para todas las llamadas al backend de chat
   - Manejo de errores y telemetría
   - Funciones: `getChatsList()`, `getMensajesByAmigo()`, `sendMensaje()`, `markChatAsLeido()`, `markAllChatAsLeidos()`

### Archivos Modificados

1. **`config/api.ts`**
   - Agregados endpoints de chat en `ENDPOINTS.CHAT`
   - Endpoints: `GET_CHATS`, `GET_MENSAJES`, `SEND_MENSAJE`, `MARK_AS_LEIDO`, `MARK_ALL_AS_LEIDOS`

2. **`app/dashboard/chat/[amigoId]/page.tsx`**
   - **Eliminado:** Todo el código relacionado con localStorage y mocks
   - **Eliminado:** Funciones `getMensajesUsuario()`, `saveMensajesUsuario()`, `saveMensajeAmigo()`, `crearMensajeMock()`
   - **Agregado:** Integración completa con `chatService`
   - **Agregado:** Carga de mensajes desde el backend
   - **Agregado:** Envío de mensajes al backend
   - **Agregado:** Marcado automático como leído al abrir chat
   - **Agregado:** Polling cada 3 segundos para recibir nuevos mensajes
   - **Agregado:** Manejo de estados de carga y errores
   - **Agregado:** Optimistic updates para mejor UX

3. **`lib/chat.ts`**
   - **Eliminado:** Funciones que usaban localStorage (`getMensajesUsuario()`, `getUltimoMensajeChat()`, `getMensajesNoLeidosChat()`)
   - **Modificado:** `getChatInfo()` ahora es async y usa `chatService.getChatsList()`
   - **Modificado:** `getChatsInfo()` ahora es async y usa el backend
   - **Mantenido:** `formatFechaUltimoMensaje()` (función de utilidad)

4. **`components/AmigosList.tsx`**
   - **Modificado:** Ahora usa `useEffect` para cargar datos de forma asíncrona
   - **Agregado:** Estado de carga mientras se obtienen los chats
   - **Agregado:** Manejo de errores al cargar chats

5. **`components/AmigoListItem.tsx`**
   - **Modificado:** Lógica para determinar si un mensaje es del usuario usando `remitenteId` en lugar de campos mock

6. **`app/globals.css`**
   - **Agregado:** Estilos para `.chat-error-banner`
   - **Agregado:** Estilos para `.amigos-list-loading`
   - **Agregado:** Estilos para `.btn-close`

---

## Tipos/Validaciones

### Esquemas Zod

**`SendMensajeRequestSchema`:**
- `contenido`: string, mínimo 1 carácter (requerido)
- `esSistema`: boolean, opcional, default: false

**`MensajeChatSchema`:**
- `_id`: string
- `remitenteId`: string
- `destinatarioId`: string
- `amigoId`: string
- `contenido`: string
- `esSistema`: boolean
- `leido`: boolean
- `createdAt`: string (ISO date)

**`ChatSchema`:**
- `amigoId`: string
- `amigoNombre`: string
- `amigoEmail`: string
- `ultimoMensaje`: objeto con `contenido`, `fecha`, `esSistema` o null
- `noLeidos`: number

### Validaciones del Backend

- `amigoId`: Debe ser un ObjectId válido y pertenecer al usuario
- `contenido`: Requerido, string no vacío
- `esSistema`: Opcional, boolean (default: `false`)
- No se puede enviar mensajes a uno mismo

---

## Estados y Errores

### Estados de UI

1. **Loading (Cargando)**
   - Muestra "Cargando..." mientras se obtiene el amigo
   - Muestra "Cargando mensajes..." mientras se cargan los mensajes
   - Muestra "Cargando chats..." en la lista de amigos

2. **Empty (Vacío)**
   - "No hay mensajes aún. ¡Comienza la conversación!" cuando no hay mensajes
   - "No tienes amigos agregados" cuando no hay amigos

3. **Error**
   - Banner de error rojo con mensaje descriptivo
   - Botón para cerrar el banner
   - Errores específicos por operación:
     - Error al cargar mensajes
     - Error al enviar mensaje
     - Error al cargar chats

4. **Success (Éxito)**
   - Mensajes se muestran correctamente
   - Optimistic updates para envío de mensajes
   - Polling automático para nuevos mensajes

### Manejo de Errores

**Estrategia:**
- Todos los errores se capturan con try/catch
- Mensajes de error descriptivos para el usuario
- Logs detallados en consola para debugging
- Errores 401 limpian tokens automáticamente
- Errores de red muestran mensaje genérico
- Errores de validación muestran el mensaje específico del backend

**Códigos de Error Manejados:**
- `400 Bad Request`: Validación de datos
- `401 Unauthorized`: Limpieza de tokens y redirección
- `404 Not Found`: Mensaje específico
- `500 Internal Server Error`: Mensaje genérico
- `0` (Network Error): Mensaje de conexión

---

## Observabilidad

### Telemetría Implementada

1. **Logs de Request (Desarrollo)**
   - Método HTTP
   - URL completa
   - Headers (sin token por seguridad)
   - Body del request

2. **Logs de Latencia**
   - Duración de cada request en milisegundos
   - Formato: `[CHAT API] GET /api/chat/amigos - 150ms`

3. **Logs de Errores**
   - Endpoint y método
   - Código de estado HTTP
   - Mensaje de error
   - Formato: `[CHAT API ERROR] POST /api/chat/.../mensajes - 400: Contenido requerido`

4. **Logs de Validación**
   - Errores de validación de esquemas Zod
   - Formato: `[CHAT VALIDATION ERROR]`

### Métricas Registradas

- Tiempo de respuesta de cada endpoint
- Tasa de errores por endpoint
- Errores de validación
- Errores de red

---

## Riesgos y Next Steps

### Riesgos Identificados

1. **Polling cada 3 segundos**
   - **Riesgo:** Alto consumo de recursos y ancho de banda
   - **Mitigación:** Considerar implementar WebSockets para tiempo real
   - **Prioridad:** Media

2. **Optimistic Updates**
   - **Riesgo:** Si el backend falla, el mensaje aparece pero no se guardó
   - **Mitigación:** Implementar rollback si el envío falla
   - **Prioridad:** Baja (ya se maneja el error)

3. **Marcado como Leído Automático**
   - **Riesgo:** Se marca como leído incluso si el usuario no ve el mensaje
   - **Mitigación:** Considerar marcar solo cuando el mensaje es visible
   - **Prioridad:** Baja

4. **Falta de Paginación**
   - **Riesgo:** Si hay muchos mensajes, la carga puede ser lenta
   - **Mitigación:** Implementar paginación en el backend y frontend
   - **Prioridad:** Media

### Próximos Pasos

1. **Implementar WebSockets**
   - Reemplazar polling por WebSockets para mensajes en tiempo real
   - Mejorar UX y reducir carga del servidor

2. **Implementar Paginación**
   - Cargar mensajes por páginas (ej: 50 mensajes por vez)
   - Implementar scroll infinito

3. **Mejorar Manejo de Errores**
   - Implementar retry automático para errores de red
   - Mostrar notificaciones toast en lugar de banners

4. **Implementar Indicadores de Escritura**
   - Mostrar cuando el otro usuario está escribiendo
   - Requiere endpoint adicional en el backend

5. **Implementar Notificaciones Push**
   - Notificar cuando llegan nuevos mensajes
   - Requiere integración con servicio de notificaciones

6. **Optimizar Rendimiento**
   - Implementar virtualización para listas largas de mensajes
   - Lazy loading de imágenes de avatares

---

## Checklist de Integración

- [x] Sin usos de mock en código activo (eliminado todo localStorage)
- [x] Contratos tipados y validados (Zod/TS) con opcionalidad correcta
- [x] Estados de UI completos (loading/empty/error/success)
- [x] Errores manejados con mensajes útiles y trazabilidad mínima
- [x] Documentación `report-chat.md` generada y clara
- [x] Telemetría mínima habilitada (latencia, status, endpoint)
- [x] Integración completa con backend MongoDB
- [x] Marcado automático como leído
- [x] Polling para nuevos mensajes
- [x] Optimistic updates para mejor UX

---

**Fecha de Integración:** Diciembre 2024  
**Estado:** ✅ Completado  
**Versión Backend:** Según documentación `mensajes-integracion.md`

