# Sistema de Reset de Contraseña - Documentación

## 📋 Resumen

El sistema de reset de contraseña ha sido migrado de tokens en memoria a MongoDB, siguiendo el patrón MVC del proyecto. Los tokens ahora son persistentes y se eliminan automáticamente cuando expiran.

---

## 🏗️ Arquitectura (MVC)

### Estructura de Archivos

```
src/
├── models/
│   └── ResetToken.model.ts      # Modelo MongoDB para tokens
├── services/
│   └── resetToken.service.ts   # Lógica de negocio para tokens
├── controllers/
│   └── auth.controller.ts      # Controladores de autenticación
└── routes/
    └── auth.routes.ts          # Rutas de autenticación
```

### Flujo de Datos

1. **Request** → Frontend envía request a `/api/auth/forgot-password`
2. **Route** → `auth.routes.ts` recibe la request
3. **Controller** → `auth.controller.ts` valida datos y llama al servicio
4. **Service** → `resetToken.service.ts` genera token y lo guarda en MongoDB
5. **Model** → `ResetToken.model.ts` guarda el token en la base de datos
6. **Response** → Backend devuelve respuesta al frontend

---

## 📝 Modelo de Datos

### ResetToken (MongoDB)

```typescript
{
  userId: ObjectId,      // Referencia al usuario
  email: string,         // Email del usuario (lowercase)
  token: string,         // Token único generado con crypto
  expiresAt: Date,       // Fecha de expiración (1 hora)
  createdAt: Date        // Fecha de creación
}
```

**Características:**
- Índice único en `token` para búsquedas rápidas
- Índice TTL en `expiresAt` - MongoDB elimina automáticamente tokens expirados
- Índice en `email` y `userId` para consultas eficientes

---

## 🔧 Servicio de Tokens

### `src/services/resetToken.service.ts`

Funciones principales:

#### `generateResetToken(userId, email)`
- Genera un token seguro usando `crypto.randomBytes(32)`
- Elimina tokens antiguos del mismo usuario
- Guarda el token en MongoDB con expiración de 1 hora
- Retorna el token generado

#### `verifyResetToken(token)`
- Busca el token en MongoDB
- Verifica que no haya expirado
- Elimina tokens expirados automáticamente
- Retorna el email del usuario o `null` si es inválido

#### `deleteResetToken(token)`
- Elimina el token después de usarlo
- Previene reutilización del token

---

## 🔐 Controladores

### `forgotPassword` - Solicitar Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Flujo:**
1. Valida el email
2. Busca el usuario en MongoDB
3. Si existe, genera token y lo guarda en MongoDB
4. Construye el enlace de reset
5. En desarrollo: muestra enlace en consola y lo guarda en `reset-token.txt`
6. En producción: debería enviar email (TODO)
7. Siempre devuelve éxito (por seguridad)

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (desarrollo):**
```json
{
  "success": true,
  "message": "Si el email existe, se ha enviado un enlace para restablecer la contraseña",
  "resetToken": "abc123...",
  "resetLink": "http://localhost:3000/reset-password?token=abc123...",
  "note": "⚠️ En producción, este token se enviaría por email"
}
```

### `resetPassword` - Restablecer Contraseña

**Endpoint:** `POST /api/auth/reset-password`

**Flujo:**
1. Valida token y nueva contraseña
2. Decodifica el token (si viene en URL)
3. Verifica el token en MongoDB
4. Busca el usuario
5. Actualiza la contraseña (hasheada)
6. Elimina el token usado
7. Retorna éxito

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "nuevaPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

---

## 🔒 Seguridad

### Implementado

✅ **Tokens seguros:** Usa `crypto.randomBytes(32)` en lugar de `Math.random()`
✅ **Expiración:** Tokens expiran en 1 hora
✅ **One-time use:** Tokens se eliminan después de usarse
✅ **TTL Index:** MongoDB elimina automáticamente tokens expirados
✅ **Email normalization:** Emails se convierten a lowercase
✅ **No revela emails:** Mismo mensaje si el email existe o no

### Pendiente para Producción

⚠️ **Envío de emails:** Actualmente solo muestra en consola (desarrollo)
⚠️ **Rate limiting:** No hay límite de intentos de reset
⚠️ **Logging:** Podría agregarse logging de intentos

---

## 🚀 Uso

### Desarrollo

1. **Solicitar reset:**
   ```bash
   POST /api/auth/forgot-password
   {
     "email": "usuario@example.com"
   }
   ```

2. **Obtener token:**
   - En desarrollo, el token viene en la respuesta
   - También se guarda en `reset-token.txt` (archivo local)
   - Se muestra en la consola del servidor

3. **Restablecer contraseña:**
   ```bash
   POST /api/auth/reset-password
   {
     "token": "token_obtenido",
     "newPassword": "nuevaPassword123"
   }
   ```

### Producción

Para producción, necesitarás:

1. **Configurar servicio de email:**
   - Instalar `nodemailer` o usar `resend`
   - Configurar variables de entorno SMTP
   - Implementar función `sendResetPasswordEmail()`

2. **Agregar al `.env`:**
   ```env
   FRONTEND_URL=https://tu-frontend.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   ```

3. **Descomentar/enablear envío de email:**
   En `auth.controller.ts`, línea 271:
   ```typescript
   // Cambiar de:
   // await sendResetPasswordEmail(user.email, resetLink);
   
   // A:
   await sendResetPasswordEmail(user.email, resetLink);
   ```

---

## 📊 Base de Datos

### Colección: `resettokens`

Los tokens se guardan en MongoDB en la colección `resettokens` (Mongoose pluraliza automáticamente).

**Ejemplo de documento:**
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "email": "usuario@example.com",
  "token": "a1b2c3d4e5f6...",
  "expiresAt": ISODate("2025-11-05T11:00:00.000Z"),
  "createdAt": ISODate("2025-11-05T10:00:00.000Z")
}
```

**Limpieza automática:**
- MongoDB elimina automáticamente documentos cuando `expiresAt` pasa
- Gracias al índice TTL configurado

---

## 🧪 Testing

### Con Postman

1. **Forgot Password:**
   - Request: `POST /api/auth/forgot-password`
   - Body: `{ "email": "usuario@example.com" }`
   - Response incluye `resetToken` en desarrollo

2. **Reset Password:**
   - Request: `POST /api/auth/reset-password`
   - Body: `{ "token": "<token_obtenido>", "newPassword": "nueva123" }`
   - Response: `{ "success": true, "message": "..." }`

### Verificar en MongoDB

```javascript
// Ver tokens activos
db.resettokens.find({ expiresAt: { $gt: new Date() } })

// Ver tokens expirados (MongoDB los elimina automáticamente)
db.resettokens.find({ expiresAt: { $lte: new Date() } })
```

---

## 🔍 Debugging

### Archivo `reset-token.txt`

En desarrollo, el enlace completo se guarda en `reset-token.txt` en la raíz del proyecto.

**Contenido:**
```
http://localhost:3000/reset-password?token=abc123...
```

### Logs en Consola

El servidor muestra en consola:
```
🔗 Enlace de reset: http://localhost:3000/reset-password?token=abc123...
```

### Verificar Token

Puedes usar la función helper `getTokenInfo()` del servicio:

```typescript
import { getTokenInfo } from '../services/resetToken.service';

const info = await getTokenInfo(token);
console.log(info);
// { email: "...", userId: "...", expiresAt: ..., isValid: true }
```

---

## 📝 Notas Importantes

1. **Tokens únicos:** Cada token es único y no se puede reutilizar
2. **Expiración:** Tokens expiran en 1 hora (configurable)
3. **Limpieza automática:** MongoDB elimina tokens expirados automáticamente
4. **Seguridad:** Nunca se revela si un email existe o no
5. **Desarrollo vs Producción:** En desarrollo, el token se devuelve en la respuesta. En producción, se enviaría por email.

---

## 🎯 Próximos Pasos

Para completar la funcionalidad:

1. **Implementar servicio de email:**
   - Crear `src/services/email.service.ts`
   - Usar nodemailer o resend
   - Template HTML para el email

2. **Agregar rate limiting:**
   - Limitar intentos de reset por IP
   - Prevenir abuso

3. **Logging:**
   - Registrar intentos de reset
   - Alertas de seguridad

4. **Testing:**
   - Tests unitarios del servicio
   - Tests de integración de los endpoints

---

**Última actualización:** Migración completa a MongoDB con tokens persistentes

