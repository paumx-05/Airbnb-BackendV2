# Milestone Backend 1: Integración Frontend-Backend - API REST Completa

## Objetivo
Crear todos los endpoints REST necesarios para integrar el backend con el frontend, permitiendo que todas las funcionalidades de los 3 milestones del frontend funcionen con una base de datos real en MongoDB.

---

## 📋 Análisis de Requerimientos del Frontend

### Milestone 1 (Frontend):
- Autenticación (login, registro, logout)
- Dashboard básico
- Perfil de usuario

### Milestone 2 (Frontend):
- Gestión de gastos mensuales (CRUD)
- Gestión de ingresos mensuales (CRUD)
- Gestión de categorías personalizadas (CRUD)
- Distribución de presupuestos mensuales
- Sistema de presupuestos por categorías

### Milestone 3 (Frontend):
- Perfil de usuario completo
- Gestión de amigos (CRUD)
- Sistema de mensajes/chat
- Sistema de notificaciones
- Dividir gastos con amigos

---

## 📝 Tareas (5 Pasos)

### Paso 1: Autenticación y Gestión de Usuarios

**Objetivo:** Implementar sistema de autenticación completo con JWT y gestión básica de usuarios.

**Endpoints a crear:**

#### Autenticación
- `POST /api/auth/register` - Registro de nuevos usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión (opcional, gestión en frontend)
- `GET /api/auth/me` - Obtener información del usuario autenticado
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña (envía token)
- `POST /api/auth/reset-password` - Restablecer contraseña con token

#### Usuario
- `GET /api/users/profile` - Obtener perfil del usuario autenticado
- `PUT /api/users/profile` - Actualizar perfil del usuario autenticado

**Modelos necesarios:**
- `User` - Modelo de usuario con: email, password (hasheada), nombre, descripción, avatar (opcional), fechaCreacion

**Funcionalidades:**
- Hash de contraseñas con bcrypt
- Generación de tokens JWT para autenticación
- Middleware de autenticación para proteger rutas
- Validación de datos de entrada
- Sistema de recuperación de contraseña (forgot/reset password)
- Tokens de reset con expiración (1 hora)

**Dependencias adicionales:**
- `bcrypt` - Para hashear contraseñas
- `jsonwebtoken` - Para generar tokens JWT
- `@types/bcrypt` y `@types/jsonwebtoken` - Tipos TypeScript

---

### Paso 2: Gestión de Gastos e Ingresos Mensuales

**Objetivo:** Implementar CRUD completo para gastos e ingresos organizados por mes.

**Endpoints a crear:**

#### Gastos Mensuales
- `GET /api/gastos/:mes` - Obtener todos los gastos de un mes específico
- `POST /api/gastos` - Crear un nuevo gasto
- `PUT /api/gastos/:id` - Actualizar un gasto existente
- `DELETE /api/gastos/:id` - Eliminar un gasto
- `GET /api/gastos/:mes/total` - Obtener total de gastos del mes
- `GET /api/gastos/:mes/categoria/:categoria` - Obtener gastos por categoría

#### Ingresos Mensuales
- `GET /api/ingresos/:mes` - Obtener todos los ingresos de un mes específico
- `POST /api/ingresos` - Crear un nuevo ingreso
- `PUT /api/ingresos/:id` - Actualizar un ingreso existente
- `DELETE /api/ingresos/:id` - Eliminar un ingreso
- `GET /api/ingresos/:mes/total` - Obtener total de ingresos del mes
- `GET /api/ingresos/:mes/categoria/:categoria` - Obtener ingresos por categoría

**Modelos necesarios:**
- `Gasto` - Modelo con: userId, descripcion, monto, fecha, categoria, mes, dividido (array de amigos), createdAt
- `Ingreso` - Modelo con: userId, descripcion, monto, fecha, categoria, mes, createdAt

**Funcionalidades:**
- Validación de datos (monto positivo, fecha válida, mes válido)
- Filtrado por mes y categoría
- Cálculo automático de totales
- Relación con usuario autenticado

---

### Paso 3: Gestión de Categorías y Presupuestos

**Objetivo:** Implementar sistema de categorías personalizadas y presupuestos mensuales por categoría.

**Endpoints a crear:**

#### Categorías
- `GET /api/categorias` - Obtener todas las categorías del usuario
- `POST /api/categorias` - Crear una nueva categoría
- `PUT /api/categorias/:id` - Actualizar una categoría
- `DELETE /api/categorias/:id` - Eliminar una categoría
- `GET /api/categorias/tipo/:tipo` - Obtener categorías por tipo (gastos, ingresos, ambos)

#### Presupuestos
- `GET /api/presupuestos/:mes` - Obtener todos los presupuestos de un mes
- `POST /api/presupuestos` - Crear o actualizar un presupuesto
- `PUT /api/presupuestos/:id` - Actualizar un presupuesto existente
- `DELETE /api/presupuestos/:id` - Eliminar un presupuesto
- `GET /api/presupuestos/:mes/total` - Obtener total presupuestado del mes
- `GET /api/presupuestos/:mes/distribucion` - Obtener distribución de presupuestos (para gráfica)

**Modelos necesarios:**
- `Categoria` - Modelo con: userId, nombre, tipo (gastos, ingresos, ambos), createdAt
- `Presupuesto` - Modelo con: userId, mes, categoria, monto, porcentaje, totalIngresos, createdAt

**Funcionalidades:**
- Validación de tipos de categoría
- Cálculo automático de porcentajes según ingresos
- Conversión entre monto y porcentaje
- Validación de nombres únicos de categorías

---

### Paso 4: Gestión de Amigos y Chat

**Objetivo:** Implementar sistema de amigos y chat individual para comunicación y división de gastos.

**Endpoints a crear:**

#### Amigos
- `GET /api/amigos` - Obtener todos los amigos del usuario
- `POST /api/amigos` - Agregar un nuevo amigo
- `PUT /api/amigos/:id` - Actualizar estado de amistad (activo, pendiente, bloqueado)
- `DELETE /api/amigos/:id` - Eliminar un amigo
- `GET /api/amigos/buscar` - Buscar amigos por nombre o email
- `GET /api/amigos/estado/:estado` - Filtrar amigos por estado

#### Chat
- `GET /api/chat/:amigoId` - Obtener todos los mensajes del chat con un amigo
- `POST /api/chat/:amigoId` - Enviar un mensaje en el chat
- `DELETE /api/chat/mensaje/:id` - Eliminar un mensaje
- `GET /api/chat/:amigoId/leidos` - Marcar mensajes como leídos

**Modelos necesarios:**
- `Amigo` - Modelo con: userId, nombre, email, avatar (opcional), estado, fechaAmistad
- `MensajeChat` - Modelo con: remitenteId, destinatarioId, amigoId, contenido, esSistema, leido, createdAt

**Funcionalidades:**
- Validación de email único al agregar amigos
- Mensajes automáticos del sistema para recordatorios de pago
- Filtrado de mensajes por amigo
- Estados de lectura de mensajes

---

### Paso 5: Mensajes, Notificaciones y Dashboard

**Objetivo:** Implementar sistema de mensajes generales, notificaciones y endpoints para el dashboard.

**Endpoints a crear:**

#### Mensajes Generales
- `GET /api/mensajes` - Obtener todos los mensajes del usuario
- `GET /api/mensajes/:id` - Obtener un mensaje específico
- `POST /api/mensajes` - Crear un mensaje (sistema o manual)
- `PUT /api/mensajes/:id/leido` - Marcar mensaje como leído
- `DELETE /api/mensajes/:id` - Eliminar un mensaje
- `GET /api/mensajes/no-leidos` - Obtener mensajes no leídos
- `GET /api/mensajes/filtro/:tipo` - Filtrar mensajes (todos, no leídos)

#### Notificaciones
- `GET /api/notificaciones` - Obtener todas las notificaciones del usuario
- `POST /api/notificaciones` - Crear una nueva notificación
- `PUT /api/notificaciones/:id/leida` - Marcar notificación como leída
- `PUT /api/notificaciones/todas-leidas` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar una notificación
- `DELETE /api/notificaciones/todas` - Eliminar todas las notificaciones
- `GET /api/notificaciones/no-leidas` - Obtener notificaciones no leídas
- `GET /api/notificaciones/filtro/:tipo` - Filtrar notificaciones (todas, no leídas)

#### Dashboard
- `GET /api/dashboard/resumen/:mes` - Obtener resumen completo del mes (ingresos, gastos, balance, porcentaje)
- `GET /api/dashboard/comparativa/:mes` - Comparativa con mes anterior
- `GET /api/dashboard/gastos-recientes/:mes` - Obtener gastos recientes del mes
- `GET /api/dashboard/gastos-categorias/:mes` - Obtener gastos agrupados por categoría (para gráfica)
- `GET /api/dashboard/alertas/:mes` - Obtener alertas financieras del mes

**Modelos necesarios:**
- `Mensaje` - Modelo con: userId, remitente, asunto, contenido, leido, createdAt
- `Notificacion` - Modelo con: userId, tipo (info, success, warning, error), titulo, mensaje, leida, createdAt

**Funcionalidades:**
- Generación automática de notificaciones (presupuesto excedido, balance negativo, etc.)
- Cálculo de métricas del dashboard
- Comparativa con mes anterior
- Alertas financieras automáticas

---

## 🗄️ Estructura de Modelos MongoDB

### Modelo User
```typescript
{
  email: string (único, requerido)
  password: string (hasheada, requerida)
  nombre: string (requerido)
  descripcion?: string
  avatar?: string
  fechaCreacion: Date
}
```

### Modelo Gasto
```typescript
{
  userId: ObjectId (referencia a User)
  descripcion: string (requerido)
  monto: number (requerido, positivo)
  fecha: Date (requerido)
  categoria: string (requerido)
  mes: string (requerido, formato: "enero", "febrero", etc.)
  dividido: [{
    amigoId: ObjectId
    amigoNombre: string
    montoDividido: number
    pagado: boolean
  }]
  createdAt: Date
}
```

### Modelo Ingreso
```typescript
{
  userId: ObjectId (referencia a User)
  descripcion: string (requerido)
  monto: number (requerido, positivo)
  fecha: Date (requerido)
  categoria: string (requerido)
  mes: string (requerido)
  createdAt: Date
}
```

### Modelo Categoria
```typescript
{
  userId: ObjectId (referencia a User)
  nombre: string (requerido, único por usuario)
  tipo: string (requerido, enum: "gastos" | "ingresos" | "ambos")
  createdAt: Date
}
```

### Modelo Presupuesto
```typescript
{
  userId: ObjectId (referencia a User)
  mes: string (requerido)
  categoria: string (requerido)
  monto: number (requerido)
  porcentaje?: number (calculado)
  totalIngresos: number (para calcular porcentaje)
  createdAt: Date
}
```

### Modelo Amigo
```typescript
{
  userId: ObjectId (referencia a User)
  nombre: string (requerido)
  email: string (requerido, único por usuario)
  avatar?: string
  estado: string (requerido, enum: "activo" | "pendiente" | "bloqueado")
  fechaAmistad: Date
  createdAt: Date
}
```

### Modelo MensajeChat
```typescript
{
  remitenteId: ObjectId (referencia a User)
  destinatarioId: ObjectId (referencia a User)
  amigoId: ObjectId (referencia a Amigo)
  contenido: string (requerido)
  esSistema: boolean (default: false)
  leido: boolean (default: false)
  createdAt: Date
}
```

### Modelo Mensaje
```typescript
{
  userId: ObjectId (referencia a User)
  remitente: string (requerido)
  asunto: string (requerido)
  contenido: string (requerido)
  leido: boolean (default: false)
  createdAt: Date
}
```

### Modelo Notificacion
```typescript
{
  userId: ObjectId (referencia a User)
  tipo: string (requerido, enum: "info" | "success" | "warning" | "error")
  titulo: string (requerido)
  mensaje: string (requerido)
  leida: boolean (default: false)
  createdAt: Date
}
```

---

## 📁 Estructura de Archivos a Crear

```
src/
├── models/
│   ├── User.model.ts
│   ├── Gasto.model.ts
│   ├── Ingreso.model.ts
│   ├── Categoria.model.ts
│   ├── Presupuesto.model.ts
│   ├── Amigo.model.ts
│   ├── MensajeChat.model.ts
│   ├── Mensaje.model.ts
│   └── Notificacion.model.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── gastos.controller.ts
│   ├── ingresos.controller.ts
│   ├── categorias.controller.ts
│   ├── presupuestos.controller.ts
│   ├── amigos.controller.ts
│   ├── chat.controller.ts
│   ├── mensajes.controller.ts
│   ├── notificaciones.controller.ts
│   └── dashboard.controller.ts
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── gastos.routes.ts
│   ├── ingresos.routes.ts
│   ├── categorias.routes.ts
│   ├── presupuestos.routes.ts
│   ├── amigos.routes.ts
│   ├── chat.routes.ts
│   ├── mensajes.routes.ts
│   ├── notificaciones.routes.ts
│   └── dashboard.routes.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
└── utils/
    ├── jwt.utils.ts
    └── validators.ts
```

---

## 🔧 Dependencias Adicionales Necesarias

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6"
  }
}
```

---

## ✅ Checklist de Verificación

### Paso 1: Autenticación
- [ ] Modelo User creado con validaciones
- [ ] Endpoints de registro y login funcionando
- [ ] JWT generado correctamente
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Middleware de autenticación implementado
- [ ] Endpoints de perfil funcionando

### Paso 2: Gastos e Ingresos
- [ ] Modelos Gasto e Ingreso creados
- [ ] CRUD completo de gastos funcionando
- [ ] CRUD completo de ingresos funcionando
- [ ] Endpoints de totales y filtros funcionando
- [ ] Validación de datos implementada

### Paso 3: Categorías y Presupuestos
- [ ] Modelos Categoria y Presupuesto creados
- [ ] CRUD completo de categorías funcionando
- [ ] CRUD completo de presupuestos funcionando
- [ ] Cálculo de porcentajes funcionando
- [ ] Endpoint de distribución funcionando

### Paso 4: Amigos y Chat
- [ ] Modelos Amigo y MensajeChat creados
- [ ] CRUD completo de amigos funcionando
- [ ] Endpoints de chat funcionando
- [ ] Mensajes automáticos del sistema funcionando
- [ ] Filtros y búsqueda funcionando

### Paso 5: Mensajes, Notificaciones y Dashboard
- [ ] Modelos Mensaje y Notificacion creados
- [ ] CRUD completo de mensajes funcionando
- [ ] CRUD completo de notificaciones funcionando
- [ ] Endpoints del dashboard funcionando
- [ ] Generación automática de alertas funcionando

---

## 🎯 Criterios de Aceptación

1. **Autenticación funcional:**
   - Usuarios pueden registrarse y hacer login
   - Tokens JWT se generan y validan correctamente
   - Rutas protegidas requieren autenticación

2. **CRUD completo:**
   - Todas las operaciones CRUD funcionan para todos los modelos
   - Validaciones de datos funcionan correctamente
   - Errores se manejan apropiadamente

3. **Relaciones correctas:**
   - Todos los datos están asociados al usuario correcto
   - Referencias entre modelos funcionan correctamente

4. **Integración con frontend:**
   - Todos los endpoints requeridos por el frontend están implementados
   - Respuestas en formato JSON consistente
   - CORS configurado correctamente

5. **Rendimiento:**
   - Consultas optimizadas (índices en MongoDB)
   - Respuestas rápidas (< 200ms para operaciones simples)

---

## 📝 Notas Técnicas

- **Programación funcional:** Usar funciones puras cuando sea posible
- **MVC claro:** Separar lógica de negocio en controladores
- **Validación:** Usar express-validator para validar datos de entrada
- **Manejo de errores:** Middleware centralizado para errores
- **Código simple:** Evitar over-engineering, mantener código legible
- **Seguridad:** Validar todos los inputs, sanitizar datos
- **Índices MongoDB:** Crear índices en campos frecuentemente consultados (userId, mes, categoria)

---

## 🚀 Orden de Implementación Recomendado

1. **Paso 1 primero** - Sin autenticación no se puede proteger nada
2. **Paso 2 segundo** - Funcionalidad core de la aplicación
3. **Paso 3 tercero** - Complementa gastos e ingresos
4. **Paso 4 cuarto** - Funcionalidad social
5. **Paso 5 último** - Funcionalidades de soporte y dashboard

---

## 📊 Resumen de Endpoints Totales

**Total: 62+ endpoints REST**

- Autenticación: 6 endpoints
- Usuario: 2 endpoints
- Gastos: 6 endpoints
- Ingresos: 6 endpoints
- Categorías: 5 endpoints
- Presupuestos: 6 endpoints
- Amigos: 6 endpoints
- Chat: 4 endpoints
- Mensajes: 7 endpoints
- Notificaciones: 8 endpoints
- Dashboard: 5 endpoints

---

## 🔐 Seguridad

- Todas las rutas excepto `/api/auth/register` y `/api/auth/login` deben estar protegidas
- Validar que el usuario solo acceda a sus propios datos
- Validar todos los inputs antes de procesarlos
- Sanitizar datos antes de guardarlos en la base de datos
- Usar variables de entorno para JWT_SECRET y otros secretos

---

## 📋 To-Do List de Implementación

### ✅ Paso 1: Autenticación y Gestión de Usuarios
1. Instalar dependencias: `bcrypt`, `jsonwebtoken`, `express-validator`
2. Crear modelo `User.model.ts`
3. Crear utilidades JWT en `utils/jwt.utils.ts`
4. Crear middleware de autenticación `middleware/auth.middleware.ts`
5. Crear controlador `controllers/auth.controller.ts`
6. Crear controlador `controllers/user.controller.ts`
7. Crear rutas `routes/auth.routes.ts`
8. Crear rutas `routes/users.routes.ts`
9. Integrar rutas en `server.ts`
10. Probar endpoints con Postman

### ✅ Paso 2: Gestión de Gastos e Ingresos Mensuales
1. Crear modelo `Gasto.model.ts`
2. Crear modelo `Ingreso.model.ts`
3. Crear controlador `controllers/gastos.controller.ts`
4. Crear controlador `controllers/ingresos.controller.ts`
5. Crear rutas `routes/gastos.routes.ts`
6. Crear rutas `routes/ingresos.routes.ts`
7. Integrar rutas en `server.ts`
8. Probar endpoints con Postman

### ✅ Paso 3: Gestión de Categorías y Presupuestos
1. Crear modelo `Categoria.model.ts`
2. Crear modelo `Presupuesto.model.ts`
3. Crear controlador `controllers/categorias.controller.ts`
4. Crear controlador `controllers/presupuestos.controller.ts`
5. Crear rutas `routes/categorias.routes.ts`
6. Crear rutas `routes/presupuestos.routes.ts`
7. Integrar rutas en `server.ts`
8. Probar endpoints con Postman

### ✅ Paso 4: Gestión de Amigos y Chat
1. Crear modelo `Amigo.model.ts`
2. Crear modelo `MensajeChat.model.ts`
3. Crear controlador `controllers/amigos.controller.ts`
4. Crear controlador `controllers/chat.controller.ts`
5. Crear rutas `routes/amigos.routes.ts`
6. Crear rutas `routes/chat.routes.ts`
7. Integrar rutas en `server.ts`
8. Probar endpoints con Postman

### ✅ Paso 5: Mensajes, Notificaciones y Dashboard
1. Crear modelo `Mensaje.model.ts`
2. Crear modelo `Notificacion.model.ts`
3. Crear controlador `controllers/mensajes.controller.ts`
4. Crear controlador `controllers/notificaciones.controller.ts`
5. Crear controlador `controllers/dashboard.controller.ts`
6. Crear rutas `routes/mensajes.routes.ts`
7. Crear rutas `routes/notificaciones.routes.ts`
8. Crear rutas `routes/dashboard.routes.ts`
9. Integrar rutas en `server.ts`
10. Probar endpoints con Postman

---

## 🎓 Recursos de Aprendizaje

- **MongoDB con Mongoose:** https://mongoosejs.com/docs/
- **JWT Authentication:** https://jwt.io/introduction
- **Express Validator:** https://express-validator.github.io/docs/
- **REST API Best Practices:** https://restfulapi.net/

---

## 📞 Próximos Pasos Después del Milestone 1

- Implementar paginación en endpoints de listas
- Agregar filtros avanzados
- Implementar búsqueda full-text
- Agregar rate limiting
- Implementar logging estructurado
- Agregar tests unitarios e integración
- Implementar documentación con Swagger/OpenAPI

