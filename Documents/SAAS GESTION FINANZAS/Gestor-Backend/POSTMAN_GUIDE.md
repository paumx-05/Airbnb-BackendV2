# Guía de Postman para Gestor Backend API

## 📥 Importar la Colección

1. Abre Postman
2. Haz clic en **Import** (arriba izquierda)
3. Selecciona el archivo `postman-collection.json`
4. La colección "Gestor Backend API" aparecerá en tu workspace

## 🔧 Configurar Variables de Entorno

### Opción 1: Variables de Colección (Recomendado)
Las variables ya están configuradas en la colección:
- `base_url`: `http://localhost:4444`
- `auth_token`: Se actualiza automáticamente al hacer login
- `user_id`: Se actualiza automáticamente al hacer login

### Opción 2: Variables de Entorno Globales
1. Haz clic en el ícono de **ojo** (👁️) en la esquina superior derecha
2. Crea un nuevo entorno o edita uno existente
3. Agrega las siguientes variables:
   - `base_url` = `http://localhost:4444`
   - `auth_token` = (se llenará automáticamente)
   - `user_id` = (se llenará automáticamente)

## 🚀 Cómo Usar la Colección

### Paso 1: Verificar el Servidor
1. Ejecuta **Health Check > Health** para verificar que el servidor esté corriendo
2. Deberías recibir una respuesta `200 OK` con el estado del servidor

### Paso 2: Registrar un Nuevo Usuario (Opcional)
1. Ejecuta **Auth > Register**
2. Modifica el body con tus datos:
   ```json
   {
     "email": "tu-email@example.com",
     "password": "tu-password",
     "nombre": "Tu Nombre",
     "descripcion": "Tu descripción"
   }
   ```
3. Guarda el token que recibas en la respuesta

### Paso 3: Iniciar Sesión
1. Ejecuta **Auth > Login**
2. Usa las credenciales del usuario demo o las que creaste:
   ```json
   {
     "email": "demo@example.com",
     "password": "password123"
   }
   ```
3. **Importante:** El token se guarda automáticamente en la variable `auth_token`
4. El `user_id` también se guarda automáticamente

### Paso 4: Usar Endpoints Protegidos
Una vez que tengas el token, todos los endpoints protegidos funcionarán automáticamente porque:
- El token se incluye automáticamente en el header `Authorization`
- No necesitas copiar y pegar el token manualmente

## 📋 Endpoints Disponibles

### 🔓 Autenticación (Sin token)
- **POST** `/api/auth/register` - Registrar nuevo usuario
- **POST** `/api/auth/login` - Iniciar sesión
- **POST** `/api/auth/logout` - Cerrar sesión
- **GET** `/api/auth/me` - Obtener usuario autenticado (requiere token)
- **POST** `/api/auth/forgot-password` - Solicitar reset de contraseña
- **POST** `/api/auth/reset-password` - Restablecer contraseña con token

### 👤 Usuarios (Requiere token)
- **GET** `/api/users/profile` - Obtener perfil
- **PUT** `/api/users/profile` - Actualizar perfil

### 🔍 Verificación
- **GET** `/health` - Health check del servidor
- **GET** `/` - Información del API

## 📝 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Autenticación

1. **Registrar usuario:**
   ```bash
   POST /api/auth/register
   Body:
   {
     "email": "test@example.com",
     "password": "password123",
     "nombre": "Test User",
     "descripcion": "Usuario de prueba"
   }
   ```

2. **Login:**
   ```bash
   POST /api/auth/login
   Body:
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   Respuesta incluye el token que se guarda automáticamente.

3. **Obtener perfil:**
   ```bash
   GET /api/users/profile
   Headers: Authorization: Bearer <token>
   ```
   El token se incluye automáticamente.

4. **Actualizar perfil:**
   ```bash
   PUT /api/users/profile
   Headers: Authorization: Bearer <token>
   Body:
   {
     "nombre": "Nombre Actualizado",
     "descripcion": "Nueva descripción"
   }
   ```

### Ejemplo 3: Recuperación de Contraseña

1. **Solicitar reset (Forgot Password):**
   ```bash
   POST /api/auth/forgot-password
   Body:
   {
     "email": "demo@example.com"
   }
   ```
   - En desarrollo, el token se devuelve en la respuesta
   - El token se guarda automáticamente en la variable `reset_token`
   - En producción, el token se enviaría por email

2. **Restablecer contraseña:**
   ```bash
   POST /api/auth/reset-password
   Body:
   {
     "token": "<token_recibido>",
     "newPassword": "nuevaPassword123"
   }
   ```
   - El token se obtiene automáticamente de la variable `reset_token`
   - El token expira en 1 hora
   - Después de usar el token, se elimina automáticamente

### Ejemplo 2: Usuario Demo

El sistema incluye un usuario demo por defecto:
- **Email:** `demo@example.com`
- **Password:** `password123`

Puedes usar este usuario directamente con **Auth > Login** sin necesidad de registrarte primero.

## 🔒 Manejo de Tokens

### Token Automático
El endpoint **Login** tiene un script que:
1. Detecta cuando el login es exitoso (status 200)
2. Extrae el token de la respuesta
3. Guarda el token en la variable `auth_token`
4. Guarda el `user_id` en la variable `user_id`

### Token Manual
Si necesitas usar un token manualmente:
1. Ve a las variables de la colección
2. Edita `auth_token`
3. Pega tu token JWT

### Verificar Token
Para verificar que el token está configurado:
1. Ejecuta **Auth > Get Me**
2. Si recibes información del usuario, el token funciona correctamente
3. Si recibes error 401, el token es inválido o expiró

## ⚠️ Errores Comunes

### Error 401: Unauthorized
- **Causa:** Token no válido o expirado
- **Solución:** Ejecuta **Auth > Login** nuevamente

### Error 400: Bad Request
- **Causa:** Datos de entrada inválidos
- **Solución:** Verifica que el body tenga el formato correcto

### Error 409: Conflict
- **Causa:** Email ya registrado
- **Solución:** Usa otro email o haz login con el existente

### Error 500: Internal Server Error
- **Causa:** Error del servidor
- **Solución:** Verifica que el servidor esté corriendo y revisa los logs

## 🎯 Próximos Pasos

Cuando se implementen más endpoints (Gastos, Ingresos, Categorías, etc.), se agregarán a esta colección con:
- Ejemplos de requests
- Scripts automáticos para guardar IDs
- Variables dinámicas

## 📚 Notas Técnicas

- **Base URL:** Por defecto es `http://localhost:4444`, puedes cambiarla en las variables
- **Token Expiración:** Los tokens JWT expiran en 7 días (configurable)
- **Reset Token Expiración:** Los tokens de reset expiran en 1 hora
- **Formato de Respuesta:** Todas las respuestas siguen el formato:
  ```json
  {
    "success": true/false,
    "data": {...},
    "message": "...",
    "error": "..."
  }
  ```

## 🔗 Recursos

- **Servidor:** http://localhost:4444
- **Health Check:** http://localhost:4444/health
- **Documentación:** Ver `milestonebackend1.md`

---

## 🔐 Recuperación de Contraseña

### Flujo Completo

1. **Forgot Password** - Solicitar reset:
   - Envía el email del usuario
   - Si el email existe, se genera un token de reset
   - En desarrollo, el token se devuelve en la respuesta
   - En producción, el token se enviaría por email
   - El token se guarda automáticamente en `reset_token`

2. **Reset Password** - Restablecer contraseña:
   - Usa el token recibido
   - Proporciona la nueva contraseña
   - El token se valida y se elimina después de usarlo
   - Si el token expiró (>1 hora), se rechaza

### Características de Seguridad

- ✅ Los tokens de reset expiran en 1 hora
- ✅ Los tokens se eliminan después de usarlos
- ✅ No se revela si un email existe o no (mismo mensaje en ambos casos)
- ✅ Solo se muestra el token en desarrollo (NODE_ENV=development)
- ✅ Las contraseñas se validan (mínimo 6 caracteres)

---

**Última actualización:** Paso 1 completado - Autenticación y Usuarios (incluye Forgot/Reset Password)

