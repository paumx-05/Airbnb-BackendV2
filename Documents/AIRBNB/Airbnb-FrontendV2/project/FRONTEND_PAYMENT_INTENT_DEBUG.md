# 🔍 Diagnóstico: Error en Payment Intent - Frontend Next.js

## ⚠️ Problemas Comunes

### Problema 1: Error 404 Not Found

El frontend está recibiendo:
```
Status Code: 404 Not Found
Endpoint: POST /api/payments/checkout/create-intent
```

**Causa:** El endpoint no está implementado en el backend.

**Solución:** Ver sección "✅ Verificaciones del Backend" más abajo.

### Problema 2: Error "Failed to fetch"

El frontend está recibiendo:
```
[paymentService] Error creando payment intent: TypeError: Failed to fetch
```

**Causa:** Problema de conexión entre el frontend y el backend (servidor no responde, URL incorrecta, o CORS).

**Solución:** Ver sección "🔧 Soluciones Comunes" más abajo.

---

## ✅ Verificaciones del Backend

### 1. Verificar que el servidor está corriendo

```bash
# Verificar que el servidor está activo en el puerto 5000
curl http://localhost:5000/

# Debe responder con información de la API
```

### 2. Verificar que el endpoint existe

```bash
# Probar el endpoint directamente (sin autenticación debería dar 401)
curl -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"test","checkIn":"2026-01-01","checkOut":"2026-01-02","guests":1}'

# Debe responder con: {"success":false,"error":{"message":"Usuario no autenticado"}}
# Si responde 404, el endpoint NO está registrado correctamente
```

### 3. Verificar que el endpoint está en la documentación de la API

```bash
# Verificar en http://localhost:5000/
# Debe incluir en la sección "payments":
#   createIntent: 'POST /api/payments/checkout/create-intent'
#   confirm: 'POST /api/payments/checkout/confirm'
```

---

## 🔍 Verificaciones del Frontend

### 1. Verificar la URL del endpoint

**Ubicación:** `lib/api/config.ts` y `lib/api/payments.ts`

**Configuración actual (Next.js):**
```typescript
// lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// lib/api/payments.ts
const response = await apiClient.post<CreatePaymentIntentResponse>(
  '/api/payments/checkout/create-intent',  // ← Ruta relativa
  data
);
```

**El endpoint completo se construye como:**
```
${API_BASE_URL}/api/payments/checkout/create-intent
= http://localhost:5000/api/payments/checkout/create-intent
```

**✅ Configuración correcta:**
- URL base: `http://localhost:5000` (sin `/api` al final)
- Endpoint: `/api/payments/checkout/create-intent` (con `/api` al inicio)
- Variable de entorno: `NEXT_PUBLIC_API_URL` (para Next.js, no `REACT_APP_API_URL`)

**❌ URLs incorrectas comunes:**
- `http://localhost:3000/api/payments/...` (puerto del frontend)
- `http://localhost:5000/payments/...` (falta `/api`)
- `http://127.0.0.1:5000/api/...` (puede causar problemas de CORS)

### 2. Verificar que el token de autenticación se está enviando

**El request debe incluir:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // ← CRÍTICO
}
```

**Verificar en el código del frontend (Next.js):**
```typescript
// lib/api/config.ts - El ApiClient maneja automáticamente:
// 1. Construye la URL completa: ${API_BASE_URL}${endpoint}
// 2. Agrega el token de autenticación desde localStorage
// 3. Agrega headers por defecto

// lib/api/payments.ts - Uso correcto:
const response = await apiClient.post<CreatePaymentIntentResponse>(
  '/api/payments/checkout/create-intent',
  {
    propertyId: data.propertyId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests
  }
);
```

**El ApiClient automáticamente:**
- Obtiene el token de `localStorage.getItem('airbnb_auth_token')`
- Agrega el header `Authorization: Bearer ${token}`
- Construye la URL completa: `http://localhost:5000/api/payments/checkout/create-intent`

### 3. Verificar la estructura del request body

**El body debe tener exactamente:**
```json
{
  "propertyId": "string (ID válido)",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "guests": number
}
```

**Ejemplo de código correcto:**
```typescript
const requestBody = {
  propertyId: propertyId, // Debe ser un string, no un objeto
  checkIn: checkIn, // Formato: "2026-01-01"
  checkOut: checkOut, // Formato: "2026-01-02"
  guests: parseInt(guests) || 1 // Debe ser un número
};
```

### 4. Verificar CORS

**Si el error persiste, verificar CORS en el navegador:**

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Intentar hacer la petición
4. Buscar la petición a `/api/payments/checkout/create-intent`
5. Verificar:
   - **Status:** Debe ser 200, 400, 401, 404, 500 (NO debe ser CORS error)
   - **Request Headers:** Debe incluir `Authorization: Bearer ...`
   - **Response Headers:** Debe incluir `access-control-allow-origin: *`

**Si ves un error de CORS:**
- El backend tiene `app.use(cors())` configurado
- Verificar que el frontend está en `http://localhost:3000` (o el puerto configurado)
- Verificar que no hay un proxy mal configurado

---

## 🐛 Pasos de Debugging

### Paso 1: Verificar en la consola del navegador

```javascript
// Abrir DevTools (F12) → Console
// Ejecutar manualmente:

const testRequest = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/payments/checkout/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        propertyId: 'test123',
        checkIn: '2026-01-01',
        checkOut: '2026-01-02',
        guests: 1
      })
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
};

testRequest();
```

**Resultados esperados:**
- ✅ **Status 401:** Token inválido o faltante (backend funciona)
- ✅ **Status 400:** Datos inválidos (backend funciona)
- ❌ **Failed to fetch:** Problema de conexión (servidor no responde o URL incorrecta)
- ❌ **CORS error:** Problema de configuración CORS

### Paso 2: Verificar en Network Tab

1. Abrir DevTools → Network
2. Filtrar por "create-intent"
3. Hacer la petición desde la aplicación
4. Verificar:
   - **Request URL:** `http://localhost:5000/api/payments/checkout/create-intent`
   - **Request Method:** `POST`
   - **Status Code:** Cualquier código (200, 400, 401, 404, 500)
   - **Request Headers:** Incluye `Authorization`
   - **Request Payload:** Tiene `propertyId`, `checkIn`, `checkOut`, `guests`

### Paso 3: Verificar logs del backend

**En la terminal del backend, deberías ver:**
```
POST /api/payments/checkout/create-intent 401
```
o
```
POST /api/payments/checkout/create-intent 400
```

**Si NO ves ningún log:**
- El request no está llegando al backend
- Verificar URL en el frontend
- Verificar que el servidor está corriendo

---

## 🔧 Soluciones Comunes

### Problema 1: Endpoint 404 (No encontrado)

**Síntoma:** Status Code 404, mensaje "Not Found"

**Causa:** El endpoint no está implementado en el backend.

**Solución:** 
1. Verificar que el backend tiene la ruta implementada
2. Verificar que la ruta está registrada en el servidor principal
3. Ver documentación: `BACKEND-STRIPE-INTEGRATION-GUIDE.md`

**Verificación:**
```bash
# Probar el endpoint directamente
curl -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"propertyId":"test","checkIn":"2026-01-01","checkOut":"2026-01-02","guests":1}'

# Si responde 404 → El endpoint NO existe en el backend
# Si responde 401 → El endpoint existe pero requiere autenticación (✅ correcto)
# Si responde 400 → El endpoint existe pero los datos son inválidos (✅ correcto)
```

### Problema 2: URL incorrecta

**Síntoma:** Error "Failed to fetch" inmediato

**Solución:**
```typescript
// ✅ Configuración actual (Next.js) - CORRECTO
// lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// lib/api/payments.ts
const response = await apiClient.post(
  '/api/payments/checkout/create-intent',  // Ruta relativa
  data
);
// Se construye como: ${API_BASE_URL}/api/payments/checkout/create-intent
```

### Problema 3: Token no se está enviando

**Síntoma:** Status 401 o "Usuario no autenticado"

**Solución:**
```typescript
// El ApiClient (lib/api/config.ts) maneja esto automáticamente:
// 1. Obtiene el token de localStorage
const token = localStorage.getItem('airbnb_auth_token');

// 2. Lo agrega automáticamente al header
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

// Si el token no se está enviando, verificar:
// - Que existe en localStorage: localStorage.getItem('airbnb_auth_token')
// - Que el ApiClient está obteniendo el token correctamente
// - Ver logs en consola: "🔍 [ApiClient] Token encontrado: SÍ/NO"
```

### Problema 4: Servidor no está corriendo

**Síntoma:** "Failed to fetch" inmediato, sin respuesta del servidor

**Solución:**
```bash
# Verificar que el servidor está corriendo
cd backend  # Ir al directorio del backend
npm run dev
# o
npm start

# Debe mostrar: "Server running on port 5000"

# Verificar que responde:
curl http://localhost:5000/
```

### Problema 5: CORS bloqueado

**Síntoma:** Error de CORS en la consola del navegador

**Solución:**
El backend ya tiene `app.use(cors())` configurado. Si persiste:
1. Verificar que el frontend está en `http://localhost:3000` (Next.js)
2. Verificar que no hay un proxy mal configurado en `next.config.js`
3. Verificar headers CORS en la respuesta del backend

### Problema 6: Body mal formateado

**Síntoma:** Status 400 con "Faltan datos requeridos"

**Solución:**
```typescript
// El ApiClient (lib/api/config.ts) ya maneja JSON.stringify automáticamente
// Solo necesitas pasar el objeto:

const response = await apiClient.post(
  '/api/payments/checkout/create-intent',
  {
    propertyId: String(propertyId), // Asegurar que es string
    checkIn: checkIn, // Formato: "YYYY-MM-DD"
    checkOut: checkOut, // Formato: "YYYY-MM-DD"
    guests: Number(guests) // Asegurar que es número
  }
);
```

---

## 📋 Checklist de Verificación

- [ ] Servidor backend está corriendo en puerto 5000
- [ ] Endpoint `/api/payments/checkout/create-intent` responde (aunque sea 401)
- [ ] URL en el frontend es `http://localhost:5000/api/payments/checkout/create-intent`
- [ ] Token de autenticación se está enviando en el header `Authorization`
- [ ] Request body incluye: `propertyId`, `checkIn`, `checkOut`, `guests`
- [ ] Content-Type header es `application/json`
- [ ] No hay errores de CORS en la consola del navegador
- [ ] Los logs del backend muestran la petición entrante

---

## 🎯 Código Actual del Frontend (Next.js) - CORRECTO

```typescript
// lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiClient {
  // ... maneja automáticamente:
  // - Construcción de URL: ${baseURL}${endpoint}
  // - Token de autenticación desde localStorage
  // - Headers por defecto
  // - JSON.stringify del body
}

// lib/api/payments.ts
export const paymentService = {
  async createPaymentIntent(data: CreatePaymentIntentRequest) {
    try {
      const response = await apiClient.post<CreatePaymentIntentResponse>(
        '/api/payments/checkout/create-intent',
        data
      );
      
      if (response.success && response.data?.clientSecret) {
        return response;
      } else {
        return response; // Incluye mensaje de error
      }
    } catch (error) {
      console.error('💥 [paymentService] Error creando payment intent:', error);
      throw error;
    }
  }
};
```

**✅ El código actual está correctamente implementado.**
**❌ El problema es que el backend no tiene el endpoint implementado (404).**

---

## 📞 Si el Problema Persiste

1. **Verificar que el endpoint existe en el backend:**
   - Revisar `BACKEND-STRIPE-INTEGRATION-GUIDE.md` para la implementación
   - Verificar que la ruta está registrada en el servidor principal
   - Probar con curl/Postman para confirmar que el endpoint responde

2. **Verificar logs del backend:** Debe mostrar la petición entrante
   - Si no hay logs → El request no está llegando al backend
   - Si hay logs con 404 → El endpoint no está registrado

3. **Verificar Network tab:** Ver el request completo y la respuesta
   - Request URL: `http://localhost:5000/api/payments/checkout/create-intent`
   - Status Code: 404 (endpoint no existe) vs 401/400 (endpoint existe)

4. **Verificar variables de entorno (Next.js):**
   - Variable: `NEXT_PUBLIC_API_URL` (no `REACT_APP_API_URL`)
   - Archivo: `.env.local` en la raíz del proyecto
   - Formato: `NEXT_PUBLIC_API_URL=http://localhost:5000`

## 🔗 Documentación Relacionada

- `BACKEND-STRIPE-INTEGRATION-GUIDE.md` - Guía completa para implementar el endpoint en el backend
- `components/checkout/CheckoutForm.tsx` - Componente de checkout que usa el payment intent
- `lib/api/payments.ts` - Servicio de pagos del frontend

---

**Última actualización:** 2025-11-10
**Proyecto:** Next.js (no React puro)

