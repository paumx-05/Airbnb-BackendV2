# Integración Endpoints: Amigos

## Objetivo
Crear todas las rutas REST API necesarias para la gestión de amigos con sistema de solicitudes de amistad, permitiendo buscar usuarios, enviar solicitudes, aceptar/rechazar solicitudes, y gestionar amigos mutuos. Solo los usuarios que se tienen mutuamente como amigos activos pueden chatear.

---

## 📋 Requisitos del Proyecto

### Principios de Desarrollo
- **Máximo 5 pasos** para completar el milestone
- **Código junior-level**: Simple y fácil de entender
- **Sin over-engineering**: Soluciones ligeras y escalables
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Programación funcional**: Preferir funciones sobre clases/objetos

### Stack Tecnológico
- **MongoDB**: Base de datos (Modelo `Amigo` necesita modificarse)
- **Express.js**: Framework web
- **TypeScript**: Lenguaje de programación
- **REST API**: Estándares REST con métodos HTTP apropiados

### Flujo del Sistema de Amistad
1. **Buscar usuarios** → Usuario A busca usuarios del sistema
2. **Enviar solicitud** → Usuario A envía solicitud de amistad a Usuario B
3. **Ver solicitudes** → Usuario B ve solicitudes recibidas
4. **Aceptar solicitud** → Usuario B acepta la solicitud
5. **Amistad mutua** → Ambos usuarios se tienen mutuamente como amigos activos
6. **Chatear** → Solo entonces pueden enviarse mensajes

### Estándares API
- Métodos HTTP correctos (GET, POST, PUT, DELETE)
- Nomenclatura consistente de endpoints
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados
- Autenticación con JWT en todas las rutas protegidas

---

## 📝 Pasos de Implementación

### Paso 0: Modificar Modelo de Amigo

**Archivo a modificar:** `src/models/Amigo.model.ts`

**Cambios necesarios:**
- Agregar campo `amigoUserId`: ObjectId que referencia al usuario que es el amigo
- Agregar campo `solicitadoPor`: ObjectId del usuario que envió la solicitud
- Modificar `estado`: Cambiar enum a `['pendiente', 'activo', 'rechazada', 'bloqueado']`
- `fechaAmistad`: Solo se establece cuando se acepta la solicitud (opcional)
- Agregar índices para búsquedas eficientes

**Estructura del modelo actualizado:**
```typescript
export interface IAmigo extends Document {
  userId: mongoose.Types.ObjectId; // Usuario que tiene este amigo en su lista
  amigoUserId: mongoose.Types.ObjectId; // ID del usuario que es el amigo (referencia a User)
  nombre: string;
  email: string;
  avatar?: string;
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
  solicitadoPor: mongoose.Types.ObjectId; // ID del usuario que envió la solicitud
  fechaAmistad?: Date; // Solo se establece cuando se acepta
  createdAt: Date;
}
```

**Índices necesarios:**
```typescript
AmigoSchema.index({ userId: 1, amigoUserId: 1 }, { unique: true });
AmigoSchema.index({ userId: 1, estado: 1 });
AmigoSchema.index({ amigoUserId: 1, estado: 1 }); // Para buscar solicitudes recibidas
AmigoSchema.index({ solicitadoPor: 1, estado: 1 }); // Para buscar solicitudes enviadas
```

---

### Paso 1: Modificar y Crear Funciones del Controlador

**Archivo a modificar:** `src/controllers/amigo.controller.ts`

**Funciones existentes a MODIFICAR:**

```typescript
// MODIFICAR: Obtener solo amigos activos
export const getAmigos = async (req: AuthRequest, res: Response): Promise<void>
// Cambio: Filtrar solo por estado 'activo'

// MODIFICAR: Crear solicitud en lugar de amigo directo
export const createAmigo = async (req: AuthRequest, res: Response): Promise<void>
// Cambio: Crear solicitud con estado 'pendiente' y amigoUserId
```

**Nuevas funciones a AGREGAR:**

```typescript
// NUEVO: Buscar usuarios del sistema (no amigos)
export const searchUsuarios = async (req: AuthRequest, res: Response): Promise<void>
// Busca en la colección User, muestra estado de amistad con cada usuario

// NUEVO: Enviar solicitud de amistad
export const enviarSolicitud = async (req: AuthRequest, res: Response): Promise<void>
// Crea registro con estado 'pendiente'

// NUEVO: Obtener solicitudes recibidas
export const getSolicitudesRecibidas = async (req: AuthRequest, res: Response): Promise<void>
// Busca donde amigoUserId = usuario actual y estado = 'pendiente'

// NUEVO: Aceptar solicitud de amistad
export const aceptarSolicitud = async (req: AuthRequest, res: Response): Promise<void>
// Actualiza solicitud a 'activo' y crea relación inversa

// NUEVO: Rechazar solicitud de amistad
export const rechazarSolicitud = async (req: AuthRequest, res: Response): Promise<void>
// Actualiza solicitud a 'rechazada'
```

**Funciones que se MANTIENEN (sin cambios):**

```typescript
// Obtener un amigo por ID
export const getAmigoById = async (req: AuthRequest, res: Response): Promise<void>

// Buscar amigos por nombre o email (entre tus amigos)
export const searchAmigos = async (req: AuthRequest, res: Response): Promise<void>

// Obtener amigos por estado
export const getAmigosByEstado = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar un amigo existente
export const updateAmigo = async (req: AuthRequest, res: Response): Promise<void>

// Actualizar estado de un amigo
export const updateEstadoAmigo = async (req: AuthRequest, res: Response): Promise<void>

// Eliminar un amigo
export const deleteAmigo = async (req: AuthRequest, res: Response): Promise<void>
```

**Lógica de cada función:**

**Funciones modificadas:**
- `getAmigos`: Filtrar por `userId` y `estado: 'activo'` (solo amigos mutuos)
- `createAmigo`: **DEPRECADO** - Usar `enviarSolicitud` en su lugar. Mantener por compatibilidad pero crear solicitud.

**Nuevas funciones:**
- `searchUsuarios`: Buscar en colección `User` por nombre/email, excluir usuario actual, mostrar estado de amistad
- `enviarSolicitud`: 
  - Validar que `amigoUserId` existe y no es el usuario actual
  - Verificar que no existe relación previa
  - Crear registro con `estado: 'pendiente'`, `solicitadoPor: userId actual`
- `getSolicitudesRecibidas`: Buscar donde `amigoUserId = usuario actual` y `estado = 'pendiente'`
- `aceptarSolicitud`:
  - Buscar solicitud donde `amigoUserId = usuario actual` y `estado = 'pendiente'`
  - Actualizar a `estado: 'activo'` y establecer `fechaAmistad`
  - Crear relación inversa (el otro usuario también tiene al actual como amigo activo)
- `rechazarSolicitud`: Actualizar solicitud a `estado: 'rechazada'`

**Funciones que se mantienen:**
- `getAmigoById`: Verificar que el amigo pertenezca al usuario, retornar amigo específico
- `searchAmigos`: Buscar por nombre o email entre tus amigos usando regex case-insensitive
- `getAmigosByEstado`: Filtrar por `userId` y `estado`
- `updateAmigo`: Verificar que el amigo pertenezca al usuario, actualizar campos permitidos
- `updateEstadoAmigo`: Actualizar solo el campo `estado` del amigo
- `deleteAmigo`: Verificar que el amigo pertenezca al usuario, eliminar de BD (considerar eliminar relación mutua)

**Validaciones:**

**Para enviar solicitud:**
- `amigoUserId`: Requerido, ObjectId válido, debe existir en User, no puede ser el usuario actual
- Verificar que no exista relación previa entre los usuarios

**Para aceptar/rechazar solicitud:**
- `id`: ID de la solicitud, debe existir y pertenecer al usuario actual como destinatario
- Estado debe ser 'pendiente'

**Para búsqueda de usuarios:**
- `q`: Requerido, string no vacío (query de búsqueda)

**Para otras operaciones:**
- `nombre`: Requerido, string no vacío, trim
- `email`: Requerido, formato email válido, único por usuario
- `estado`: Enum: `['pendiente', 'activo', 'rechazada', 'bloqueado']`
- `avatar`: Opcional, URL válida si se proporciona
- `fechaAmistad`: Se establece automáticamente al aceptar solicitud

---

### Paso 2: Modificar y Agregar Rutas de Amigos

**Archivo a modificar:** `src/routes/amigo.routes.ts`

**Endpoints existentes (MANTENER):**

```typescript
GET    /api/amigos                    - Obtener todos los amigos activos (MODIFICADO)
GET    /api/amigos/:id                 - Obtener un amigo por ID
GET    /api/amigos/search?q=            - Buscar amigos por nombre o email (entre tus amigos)
GET    /api/amigos/estado/:estado      - Obtener amigos por estado
POST   /api/amigos                    - Crear solicitud de amistad (MODIFICADO - ahora crea solicitud)
PUT    /api/amigos/:id                 - Actualizar un amigo existente
PUT    /api/amigos/:id/estado          - Actualizar estado de un amigo
DELETE /api/amigos/:id                 - Eliminar un amigo
```

**Nuevos endpoints a AGREGAR:**

```typescript
GET    /api/amigos/usuarios/search?q=  - Buscar usuarios del sistema (NUEVO)
POST   /api/amigos/solicitud            - Enviar solicitud de amistad (NUEVO)
GET    /api/amigos/solicitudes          - Obtener solicitudes recibidas (NUEVO)
PUT    /api/amigos/solicitud/:id/aceptar    - Aceptar solicitud (NUEVO)
PUT    /api/amigos/solicitud/:id/rechazar   - Rechazar solicitud (NUEVO)
```

**IMPORTANTE:** Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos (`:id`):

**Estructura de rutas actualizada:**

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as amigoController from '../controllers/amigo.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
// GET /api/amigos - Obtener todos los amigos activos
router.get('/', amigoController.getAmigos);

// GET /api/amigos/usuarios/search?q= - Buscar usuarios del sistema (NUEVO)
router.get('/usuarios/search', amigoController.searchUsuarios);

// GET /api/amigos/search?q= - Buscar entre tus amigos
router.get('/search', amigoController.searchAmigos);

// GET /api/amigos/solicitudes - Obtener solicitudes recibidas (NUEVO)
router.get('/solicitudes', amigoController.getSolicitudesRecibidas);

// GET /api/amigos/estado/:estado - Obtener amigos por estado
router.get('/estado/:estado', amigoController.getAmigosByEstado);

// POST /api/amigos/solicitud - Enviar solicitud de amistad (NUEVO)
router.post('/solicitud', amigoController.enviarSolicitud);

// POST /api/amigos - Crear solicitud (mantener por compatibilidad)
router.post('/', amigoController.createAmigo);

// PUT /api/amigos/solicitud/:id/aceptar - Aceptar solicitud (NUEVO)
router.put('/solicitud/:id/aceptar', amigoController.aceptarSolicitud);

// PUT /api/amigos/solicitud/:id/rechazar - Rechazar solicitud (NUEVO)
router.put('/solicitud/:id/rechazar', amigoController.rechazarSolicitud);

// PUT /api/amigos/:id/estado - Actualizar estado de un amigo
router.put('/:id/estado', amigoController.updateEstadoAmigo);

// PUT /api/amigos/:id - Actualizar un amigo existente
router.put('/:id', amigoController.updateAmigo);

// GET /api/amigos/:id - Obtener un amigo por ID
router.get('/:id', amigoController.getAmigoById);

// DELETE /api/amigos/:id - Eliminar un amigo
router.delete('/:id', amigoController.deleteAmigo);

export { router as amigoRoutes };
```

---

### Paso 3: Validar Amistad Mutua en Chat

**Archivo a modificar:** `src/controllers/chat.controller.ts`

**En la función `createMensaje`, agregar validación antes de crear el mensaje:**

```typescript
// Verificar que ambos usuarios se tienen mutuamente como amigos activos
const amistadMutua = await Amigo.findOne({
  userId: req.user.userId,
  amigoUserId: destinatario._id,
  estado: 'activo'
});

if (!amistadMutua) {
  res.status(403).json({
    success: false,
    error: 'No puedes enviar mensajes a este usuario. Primero deben ser amigos mutuos.'
  });
  return;
}
```

---

### Paso 4: Validaciones y Manejo de Errores

**Validaciones a implementar en el controlador:**

```typescript
// Validar estado
const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
if (estado && !estadosValidos.includes(estado)) {
  res.status(400).json({
    success: false,
    error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
  });
  return;
}

// Validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  res.status(400).json({
    success: false,
    error: 'Email inválido'
  });
  return;
}

// Validar email único por usuario
const amigoExistente = await Amigo.findOne({
  userId,
  email: email.toLowerCase().trim()
});

if (amigoExistente && amigoExistente._id.toString() !== id) {
  res.status(409).json({
    success: false,
    error: 'Ya existe un amigo con ese email'
  });
  return;
}

// Validar nombre
if (!nombre || nombre.trim().length === 0) {
  res.status(400).json({
    success: false,
    error: 'El nombre es requerido'
  });
  return;
}
```

**Búsqueda de amigos:**

```typescript
// Buscar por nombre o email
const query = req.query.q as string;
if (!query || query.trim().length === 0) {
  res.status(400).json({
    success: false,
    error: 'Parámetro de búsqueda requerido'
  });
  return;
}

const amigos = await Amigo.find({
  userId,
  $or: [
    { nombre: { $regex: query, $options: 'i' } },
    { email: { $regex: query, $options: 'i' } }
  ]
});
```

**Manejo de errores:**
- Usar try-catch en todas las funciones async
- Respuestas consistentes: `{ success: boolean, data?: any, error?: string, message?: string }`
- Códigos HTTP apropiados: 200 (éxito), 201 (creado), 400 (bad request), 401 (no autorizado), 404 (no encontrado), 409 (conflicto - duplicado), 500 (error servidor)

---

### Paso 5: Integrar Rutas en Server

**Archivo a modificar:** `src/server.ts`

**Cambios a realizar:**

```typescript
// 1. Importar las rutas
import { amigoRoutes } from './routes/amigo.routes';

// 2. Agregar después de las rutas existentes
app.use('/api/amigos', amigoRoutes);

// 3. Actualizar endpoint raíz con nueva ruta
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Bienvenido al API del Gestor Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      gastos: '/api/gastos',
      ingresos: '/api/ingresos',
      presupuestos: '/api/presupuestos',
      categorias: '/api/categorias',
      dashboard: '/api/dashboard',
      amigos: '/api/amigos',  // ← Agregar esta línea
      example: '/api/example'
    },
    timestamp: new Date().toISOString()
  });
});
```

---

### Paso 6: Testing y Documentación

**Testing con Postman/Thunder Client:**

**Flujo completo de solicitud de amistad:**

1. **Buscar usuarios del sistema:**
   ```
   GET http://localhost:4444/api/amigos/usuarios/search?q=juan
   Headers: Authorization: Bearer <token>
   Response: Lista de usuarios con estado de amistad
   ```

2. **Enviar solicitud de amistad:**
   ```
   POST http://localhost:4444/api/amigos/solicitud
   Headers: Authorization: Bearer <token>
   Body (JSON):
   {
     "amigoUserId": "507f1f77bcf86cd799439011"
   }
   ```

3. **Obtener solicitudes recibidas:**
   ```
   GET http://localhost:4444/api/amigos/solicitudes
   Headers: Authorization: Bearer <token>
   Response: Lista de solicitudes pendientes
   ```

4. **Aceptar solicitud:**
   ```
   PUT http://localhost:4444/api/amigos/solicitud/:id/aceptar
   Headers: Authorization: Bearer <token>
   Response: Solicitud aceptada, relación mutua creada
   ```

5. **Rechazar solicitud:**
   ```
   PUT http://localhost:4444/api/amigos/solicitud/:id/rechazar
   Headers: Authorization: Bearer <token>
   Response: Solicitud rechazada
   ```

**Endpoints existentes (modificados):**

6. **Obtener todos los amigos (solo activos):**
   ```
   GET http://localhost:4444/api/amigos
   Headers: Authorization: Bearer <token>
   Response: Solo amigos con estado 'activo'
   ```

7. **Buscar entre tus amigos:**
   ```
   GET http://localhost:4444/api/amigos/search?q=juan
   Headers: Authorization: Bearer <token>
   ```

8. **Obtener amigos por estado:**
   ```
   GET http://localhost:4444/api/amigos/estado/activo
   Headers: Authorization: Bearer <token>
   ```

9. **Obtener amigo por ID:**
   ```
   GET http://localhost:4444/api/amigos/:id
   Headers: Authorization: Bearer <token>
   ```

10. **Actualizar amigo:**
    ```
    PUT http://localhost:4444/api/amigos/:id
    Headers: Authorization: Bearer <token>
    Body (JSON):
    {
      "nombre": "Juan Pérez Actualizado",
      "avatar": "https://example.com/avatar.jpg"
    }
    ```

11. **Actualizar estado:**
    ```
    PUT http://localhost:4444/api/amigos/:id/estado
    Headers: Authorization: Bearer <token>
    Body (JSON):
    {
      "estado": "bloqueado"
    }
    ```

12. **Eliminar amigo:**
    ```
    DELETE http://localhost:4444/api/amigos/:id
    Headers: Authorization: Bearer <token>
    ```

**Estructura de respuestas esperadas:**

```typescript
// GET /api/amigos/usuarios/search?q=
{
  success: true,
  data: [
    {
      _id: string,
      nombre: string,
      email: string,
      avatar?: string,
      estadoAmistad: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado' | null,
      esAmigo: boolean
    }
  ]
}

// POST /api/amigos/solicitud
{
  success: true,
  data: {
    _id: string,
    userId: string,
    amigoUserId: string,
    nombre: string,
    email: string,
    avatar?: string,
    estado: 'pendiente',
    solicitadoPor: string,
    createdAt: string (ISO)
  },
  message: "Solicitud de amistad enviada exitosamente"
}

// GET /api/amigos/solicitudes
{
  success: true,
  data: [
    {
      _id: string,
      solicitante: {
        _id: string,
        nombre: string,
        email: string,
        avatar?: string
      },
      estado: 'pendiente',
      createdAt: string (ISO)
    }
  ]
}

// PUT /api/amigos/solicitud/:id/aceptar
{
  success: true,
  data: {
    _id: string,
    estado: 'activo',
    fechaAmistad: string (ISO)
  },
  message: "Solicitud de amistad aceptada exitosamente"
}

// PUT /api/amigos/solicitud/:id/rechazar
{
  success: true,
  message: "Solicitud de amistad rechazada"
}

// GET /api/amigos (solo amigos activos)
{
  success: true,
  data: [
    {
      _id: string,
      userId: string,
      amigoUserId: string,
      nombre: string,
      email: string,
      avatar?: string,
      estado: 'activo',
      fechaAmistad: string (ISO),
      createdAt: string (ISO)
    }
  ]
}

// GET /api/amigos/:id
{
  success: true,
  data: {
    _id: string,
    userId: string,
    amigoUserId: string,
    nombre: string,
    email: string,
    avatar?: string,
    estado: string,
    fechaAmistad?: string (ISO),
    createdAt: string (ISO)
  }
}

// GET /api/amigos/search?q=
{
  success: true,
  data: [ /* array de amigos encontrados */ ]
}

// PUT /api/amigos/:id
{
  success: true,
  data: { /* objeto amigo actualizado */ },
  message: "Amigo actualizado exitosamente"
}

// PUT /api/amigos/:id/estado
{
  success: true,
  data: { /* objeto amigo con estado actualizado */ },
  message: "Estado actualizado exitosamente"
}

// DELETE /api/amigos/:id
{
  success: true,
  message: "Amigo eliminado exitosamente"
}
```

---

## 📁 Estructura de Archivos

```
src/
├── controllers/
│   ├── amigo.controller.ts            ✅ (modificar - agregar nuevas funciones)
│   └── chat.controller.ts             ✅ (modificar - validar amistad mutua)
├── routes/
│   └── amigo.routes.ts                ✅ (modificar - agregar nuevas rutas)
├── models/
│   ├── Amigo.model.ts                    ✅ (modificar - agregar campos nuevos)
│   └── User.model.ts                  ✅ (usar para búsqueda de usuarios)
└── server.ts                          ✅ (ya está registrado)
```

---

## 📝 Notas Técnicas

### Sistema de Solicitudes
- **Amistad mutua requerida**: Solo usuarios con estado 'activo' mutuo pueden chatear
- **Flujo bidireccional**: Al aceptar solicitud, se crean DOS registros (uno para cada usuario)
- **Estados válidos**: `'pendiente'`, `'activo'`, `'rechazada'`, `'bloqueado'`
- **Índice único**: `{ userId, amigoUserId }` previene relaciones duplicadas
- **SolicitadoPor**: Identifica quién envió la solicitud original

### Validaciones Importantes
- No se puede enviar solicitud a uno mismo
- No se puede enviar solicitud si ya existe relación (cualquier estado)
- Solo el destinatario puede aceptar/rechazar solicitudes
- Al aceptar, se crea automáticamente la relación inversa

### Búsqueda de Usuarios vs Amigos
- `GET /api/amigos/usuarios/search`: Busca en colección `User` (todos los usuarios del sistema)
- `GET /api/amigos/search`: Busca en colección `Amigo` (solo tus amigos)
- Excluir usuario actual en búsqueda de usuarios

### Chat y Amistad
- El controlador de chat debe validar amistad mutua antes de permitir mensajes
- Solo amigos con estado 'activo' mutuo pueden chatear
- Error 403 si intentan chatear sin ser amigos mutuos

### General
- Todas las rutas protegidas con middleware `authenticate`
- Usar `AuthRequest` para acceder a `req.user.userId`
- Manejar errores con try-catch y respuestas consistentes
- El campo `fechaAmistad` se establece al aceptar solicitud
- Rutas específicas deben ir ANTES de rutas con parámetros dinámicos

---

## ✅ Checklist de Verificación

### Modelo
- [ ] Modelo `Amigo` modificado con campos `amigoUserId` y `solicitadoPor`
- [ ] Enum de estado actualizado: `['pendiente', 'activo', 'rechazada', 'bloqueado']`
- [ ] Índices agregados para búsquedas eficientes
- [ ] Índice único `{ userId, amigoUserId }` implementado

### Controlador
- [ ] Función `getAmigos` modificada (solo amigos activos)
- [ ] Función `createAmigo` modificada o deprecada
- [ ] Función `searchUsuarios` creada (buscar en User)
- [ ] Función `enviarSolicitud` creada
- [ ] Función `getSolicitudesRecibidas` creada
- [ ] Función `aceptarSolicitud` creada (crea relación mutua)
- [ ] Función `rechazarSolicitud` creada
- [ ] Validación de amistad mutua en chat implementada

### Rutas
- [ ] Ruta `GET /api/amigos/usuarios/search` agregada
- [ ] Ruta `POST /api/amigos/solicitud` agregada
- [ ] Ruta `GET /api/amigos/solicitudes` agregada
- [ ] Ruta `PUT /api/amigos/solicitud/:id/aceptar` agregada
- [ ] Ruta `PUT /api/amigos/solicitud/:id/rechazar` agregada
- [ ] Rutas ordenadas correctamente (específicas antes de dinámicas)
- [ ] Todas las rutas protegidas con middleware `authenticate`

### Validaciones
- [ ] No se puede enviar solicitud a uno mismo
- [ ] No se puede enviar solicitud si ya existe relación
- [ ] Solo destinatario puede aceptar/rechazar
- [ ] Al aceptar se crea relación mutua automáticamente
- [ ] Chat valida amistad mutua antes de permitir mensajes

### Testing
- [ ] Flujo completo de solicitud probado
- [ ] Búsqueda de usuarios funcionando
- [ ] Aceptar solicitud crea relación mutua
- [ ] Chat bloquea mensajes sin amistad mutua
- [ ] Manejo de errores consistente
- [ ] Testing completo con Postman/Thunder Client

### Documentación
- [ ] Documentación de endpoints completa
- [ ] Flujo de solicitudes documentado
- [ ] Ejemplos de request/response actualizados


