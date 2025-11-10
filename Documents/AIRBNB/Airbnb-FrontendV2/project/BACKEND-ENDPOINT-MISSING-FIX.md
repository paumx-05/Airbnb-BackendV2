# 🚨 Problema: Endpoint de Stripe No Encontrado (404)

## Problema Actual

El frontend está intentando llamar al endpoint:
```
POST http://localhost:5000/api/payments/checkout/create-intent
```

Pero el backend está devolviendo **404 Not Found**, lo que significa que **este endpoint no está implementado en el backend**.

## ✅ Solución: Implementar el Endpoint en el Backend

### Paso 1: Verificar la Estructura del Backend

Asegúrate de tener una ruta de pagos en tu backend. La estructura debería ser algo como:

```
backend/
├── routes/
│   └── payments.js  (o payments.ts)
├── controllers/
│   └── paymentController.js
└── server.js (o app.js)
```

### Paso 2: Crear/Actualizar la Ruta de Pagos

En tu archivo de rutas de pagos (ej: `routes/payments.js`), agrega:

```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth'); // Tu middleware de autenticación
const Property = require('../models/Property'); // Tu modelo de Property

// POST /api/payments/checkout/create-intent
router.post('/checkout/create-intent', authenticateToken, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, guests, reservationId } = req.body;
    const userId = req.user.id || req.user.userId; // Ajusta según tu estructura de token

    // 1. Validar datos de entrada
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: propertyId, checkIn, checkOut, guests'
      });
    }

    // 2. Obtener la propiedad y calcular el precio total
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // 3. Calcular el precio total (usar la misma lógica que en /calculate)
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const totalNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const subtotal = property.pricePerNight * totalNights;
    const cleaningFee = Math.round(subtotal * 0.05);
    const serviceFee = Math.round(subtotal * 0.08);
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + cleaningFee + serviceFee + taxes;

    // 4. Convertir a centavos (Stripe usa centavos)
    const amountInCents = Math.round(total * 100);

    // 5. Crear Payment Intent con Stripe REAL
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        propertyId: propertyId,
        userId: userId.toString(),
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString(),
        reservationId: reservationId || ''
      },
      payment_method_types: ['card'],
    });

    // 6. IMPORTANTE: Usar el client_secret REAL de Stripe
    // NO crear valores mock como "pi_mock_..."
    const clientSecret = paymentIntent.client_secret;
    const paymentIntentId = paymentIntent.id;

    // 7. Validar que el clientSecret tenga el formato correcto
    if (!clientSecret || !clientSecret.includes('_secret_')) {
      console.error('❌ Error: Stripe no devolvió un clientSecret válido');
      return res.status(500).json({
        success: false,
        message: 'Error creando payment intent'
      });
    }

    // 8. Devolver respuesta
    return res.status(200).json({
      success: true,
      data: {
        clientSecret: clientSecret, // ✅ Este es el REAL de Stripe
        paymentIntentId: paymentIntentId
      }
    });

  } catch (error) {
    console.error('❌ Error creando payment intent:', error);
    
    // Si es un error de Stripe, devolver mensaje más específico
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear payment intent'
    });
  }
});

module.exports = router;
```

### Paso 3: Registrar la Ruta en el Servidor Principal

En tu archivo principal del servidor (ej: `server.js` o `app.js`), asegúrate de registrar la ruta:

```javascript
const express = require('express');
const paymentRoutes = require('./routes/payments');

const app = express();

// ... otros middlewares ...

// Registrar rutas de pagos
app.use('/api/payments', paymentRoutes);

// ... resto del código ...
```

### Paso 4: Verificar Variables de Entorno

Asegúrate de tener configurado en tu `.env` del backend:

```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
```

**⚠️ IMPORTANTE:** 
- Usa la clave de **test** (`sk_test_...`) para desarrollo
- **NUNCA** uses valores mock o hardcodeados
- La clave secreta solo debe estar en el backend, nunca en el frontend

### Paso 5: Instalar Stripe en el Backend

Si no lo has hecho ya:

```bash
cd backend  # o donde esté tu backend
npm install stripe
```

### Paso 6: Probar el Endpoint

Una vez implementado, prueba el endpoint con Postman o curl:

```bash
curl -X POST http://localhost:5000/api/payments/checkout/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "propertyId": "prop_123",
    "checkIn": "2024-03-15",
    "checkOut": "2024-03-20",
    "guests": 2
  }'
```

Deberías recibir una respuesta como:

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxxxx_secret_xxxxx",
    "paymentIntentId": "pi_xxxxx"
  }
}
```

## 🔍 Verificación

1. **Verifica que el endpoint responda:**
   - Debe devolver 200 (no 404)
   - Debe incluir `clientSecret` con formato `pi_xxxxx_secret_xxxxx`
   - **NO** debe incluir `pi_mock_...` (eso es un error)

2. **Verifica en la consola del navegador:**
   - Deberías ver: `✅ [PaymentForm] Payment intent creado:`
   - El componente de Stripe debería cargar correctamente

## 📝 Notas Adicionales

- El endpoint requiere autenticación (token JWT)
- El `clientSecret` debe ser real de Stripe, no un mock
- El formato del `clientSecret` debe ser: `pi_xxxxx_secret_xxxxx`
- Si ves errores, revisa los logs del backend para más detalles

## 🆘 Si Aún No Funciona

1. Verifica que el backend esté corriendo en `http://localhost:5000`
2. Verifica que la ruta esté correctamente registrada
3. Verifica que `STRIPE_SECRET_KEY` esté configurada
4. Revisa los logs del backend para ver errores específicos
5. Verifica que el middleware de autenticación esté funcionando correctamente

