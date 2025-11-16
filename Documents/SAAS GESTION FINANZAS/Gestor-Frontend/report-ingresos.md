# Módulo Ingresos: Reporte de Integración

## Resumen

Este documento describe la integración completa del módulo de ingresos con el backend MongoDB, reemplazando el sistema de localStorage (mock) por llamadas reales a la API. La integración sigue la metodología del Staff Engineer para garantizar contratos estables, validación de datos, manejo de errores y observabilidad.

**Fecha de integración:** $(date)  
**Estado:** ✅ Completado  
**Módulo:** Ingresos Mensuales  
**Backend:** MongoDB Atlas (API REST)

---

## Endpoints

### Base URL
- **Desarrollo:** `http://localhost:4444`
- **Producción:** Configurado via `NEXT_PUBLIC_API_URL`

### Endpoints Implementados

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/ingresos/:mes` | Obtener ingresos del mes | ✅ JWT |
| `POST` | `/api/ingresos` | Crear nuevo ingreso | ✅ JWT |
| `PUT` | `/api/ingresos/:id` | Actualizar ingreso | ✅ JWT |
| `DELETE` | `/api/ingresos/:id` | Eliminar ingreso | ✅ JWT |
| `GET` | `/api/ingresos/:mes/total` | Obtener total del mes | ✅ JWT |
| `GET` | `/api/ingresos/:mes/categoria/:categoria` | Filtrar por categoría | ✅ JWT |

### Autenticación
Todos los endpoints requieren token JWT en el header:
```
Authorization: Bearer <token>
```

El token se obtiene automáticamente de `localStorage` mediante `utils/jwt.ts`.

### Parámetros de Path
- `mes`: Mes en español (minúsculas): `enero`, `febrero`, `marzo`, etc.
- `id`: ID del ingreso (MongoDB ObjectId)
- `categoria`: Nombre de la categoría (URL encoded)

---

## Cambios en Frontend

### Archivos Creados

1. **`models/ingresos.ts`**
   - Tipos TypeScript para ingresos
   - Interfaces para requests/responses
   - Tipo `MesValido` para validación de meses
   - Interfaces de error personalizadas

2. **`schemas/ingresos.schema.ts`**
   - Schemas Zod para validación runtime
   - Validación de requests y responses
   - Validación de meses válidos
   - Tipos derivados de schemas

3. **`services/ingresos.service.ts`**
   - Servicio completo de ingresos
   - Funciones async para todas las operaciones CRUD
   - Manejo de errores y telemetría
   - Normalización de fechas (Date → ISO string)

4. **`report-ingresos.md`** (este archivo)
   - Documentación completa de la integración

### Archivos Modificados

1. **`config/api.ts`**
   - Agregada sección `INGRESOS` con todos los endpoints
   - Endpoints configurados como funciones para parámetros dinámicos

2. **`app/dashboard/ingresos/[mes]/page.tsx`**
   - ✅ Reemplazado localStorage por `ingresosService`
   - ✅ Agregados estados de loading y error
   - ✅ Manejo de errores con mensajes al usuario
   - ✅ Validación de mes antes de hacer requests
   - ✅ Cambio de `ingreso.id` a `ingreso._id` (formato backend)
   - ✅ Funciones async/await para todas las operaciones

3. **`lib/ingresos.ts`**
   - ⚠️ Marcado como DEPRECADO
   - Funciones mantenidas temporalmente para compatibilidad
   - Comentarios de migración agregados
   - Usado por: `app/dashboard/page.tsx`, `app/dashboard/distribucion/page.tsx`, `lib/distribucion.ts`

### Archivos Pendientes de Migración

Los siguientes archivos aún usan las funciones deprecadas de `lib/ingresos.ts`:
- `app/dashboard/page.tsx` - Dashboard principal
- `app/dashboard/distribucion/page.tsx` - Página de distribución
- `lib/distribucion.ts` - Utilidades de distribución

**Recomendación:** Migrar estos archivos en una fase posterior para usar `ingresosService`.

---

## Tipos/Validaciones

### Modelos TypeScript (`models/ingresos.ts`)

```typescript
export interface Ingreso {
  _id: string              // MongoDB ObjectId
  userId: string           // ID del usuario propietario
  descripcion: string      // Descripción del ingreso
  monto: number            // Monto (debe ser > 0)
  fecha: string            // ISO date string
  categoria: string        // Categoría del ingreso
  mes: string             // Mes en español (minúsculas)
  createdAt?: string       // Fecha de creación (ISO)
}

export type MesValido = 
  | 'enero' | 'febrero' | 'marzo' | 'abril' 
  | 'mayo' | 'junio' | 'julio' | 'agosto'
  | 'septiembre' | 'octubre' | 'noviembre' | 'diciembre'
```

### Schemas Zod (`schemas/ingresos.schema.ts`)

**Validaciones implementadas:**
- ✅ `descripcion`: string, mínimo 1 carácter
- ✅ `monto`: number, debe ser positivo (> 0)
- ✅ `fecha`: string (ISO) o Date object
- ✅ `categoria`: string, mínimo 1 carácter
- ✅ `mes`: enum de 12 meses válidos en español
- ✅ `_id`: string (MongoDB ObjectId)
- ✅ `userId`: string

**Schemas de respuesta:**
- `IngresosResponseSchema`: Array de ingresos
- `IngresoResponseSchema`: Un solo ingreso (create/update)
- `TotalIngresosResponseSchema`: Total del mes
- `IngresosByCategoriaResponseSchema`: Ingresos filtrados + total
- `DeleteIngresoResponseSchema`: Confirmación de eliminación

**Validación en runtime:**
- Requests se validan antes de enviar al backend
- Responses se validan antes de retornar al componente
- Errores de validación se capturan y muestran al usuario

---

## Estados y Errores

### Estados de UI Implementados

1. **Loading States:**
   - `loading`: Estado de carga para operaciones de formulario (crear)
   - `loadingIngresos`: Estado de carga para obtener ingresos del mes

2. **Error States:**
   - `error`: Mensaje de error para mostrar al usuario
   - Errores se muestran en el header y en la lista de ingresos

3. **Empty States:**
   - Mensaje cuando no hay ingresos para el mes
   - Mensaje de carga mientras se obtienen datos

4. **Success States:**
   - Lista de ingresos con total del mes
   - Formulario se limpia después de crear exitosamente

### Manejo de Errores

**Estrategia implementada:**

1. **Errores de Red:**
   - Timeout: 10 segundos (configurable en `API_CONFIG.TIMEOUT`)
   - Mensaje: "Error de conexión. Verifica que el servidor esté disponible."

2. **Errores de Autenticación (401):**
   - Token se limpia automáticamente
   - Usuario debería ser redirigido al login (manejado por auth)

3. **Errores de Validación (400):**
   - Mensaje específico del backend
   - Ejemplo: "El monto debe ser mayor a 0"

4. **Errores de Recurso No Encontrado (404):**
   - Mensaje: "Ingreso no encontrado"
   - Solo aplica para update/delete

5. **Errores del Servidor (500):**
   - Mensaje genérico del backend
   - Log detallado en consola para debugging

**Códigos de Error Manejados:**
- `400`: Datos inválidos, mes inválido, monto inválido
- `401`: Usuario no autenticado
- `404`: Ingreso no encontrado o no pertenece al usuario
- `500`: Error del servidor
- `0`: Error de red/conexión

**Mensajes al Usuario:**
- Errores se muestran en español
- Mensajes claros y accionables
- No se exponen detalles técnicos al usuario final

---

## Observabilidad

### Telemetría Implementada

**Logs de Desarrollo:**
- ✅ Logs detallados de requests (método, URL, headers, body)
- ✅ Logs de respuestas (datos recibidos)
- ✅ Logs de validación (éxito/fallo de schemas)
- ✅ Logs de latencia (tiempo de respuesta en ms)
- ✅ Logs de errores (endpoint, método, status, mensaje)

**Formato de Logs:**
```
[INGRESOS API] GET /api/ingresos/noviembre - 245ms
[INGRESOS API DEBUG] { method: 'GET', url: '...', headers: {...}, body: {...} }
[INGRESOS API] Validando respuesta con schema: {...}
[INGRESOS API] Validación exitosa: {...}
[INGRESOS API ERROR] DELETE /api/ingresos/123 - 404: Ingreso no encontrado
```

**Información Registrada:**
- Endpoint y método HTTP
- Tiempo de respuesta (latencia)
- Headers de request (sin token completo por seguridad)
- Body de request/response (solo en desarrollo)
- Errores con status code y mensaje
- Validación de token (userId, email, exp)

**Dónde se Registra:**
- Consola del navegador (solo en desarrollo)
- Logs estructurados para facilitar debugging
- No se envían a servicios externos (por ahora)

**Métricas Disponibles:**
- Latencia por endpoint
- Tasa de éxito/error
- Validaciones fallidas
- Errores por tipo (400, 401, 404, 500)

---

## Riesgos y Next Steps

### Riesgos Identificados

1. **Compatibilidad con Archivos Legacy:**
   - ⚠️ `app/dashboard/page.tsx` y `app/dashboard/distribucion/page.tsx` aún usan localStorage
   - **Mitigación:** Funciones deprecadas mantenidas temporalmente
   - **Acción:** Migrar estos archivos en fase posterior

2. **Validación de Mes:**
   - ⚠️ El backend valida meses, pero el frontend también valida antes de enviar
   - **Mitigación:** Validación en ambos lados (defensa en profundidad)
   - **Estado:** ✅ Implementado

3. **Manejo de Fechas:**
   - ⚠️ Conversión entre Date objects y ISO strings
   - **Mitigación:** Normalización automática en el servicio
   - **Estado:** ✅ Implementado

4. **Token Expiration:**
   - ⚠️ Tokens pueden expirar durante la sesión
   - **Mitigación:** Limpieza automática en 401, redirección a login
   - **Estado:** ✅ Implementado

5. **Rate Limiting:**
   - ⚠️ No hay límites de tasa implementados en el frontend
   - **Riesgo:** Múltiples requests simultáneos pueden sobrecargar el backend
   - **Recomendación:** Implementar debounce/throttle en formularios

### Próximos Pasos

#### Fase 1: Completar Migración (Prioridad Alta)
- [ ] Migrar `app/dashboard/page.tsx` para usar `ingresosService`
- [ ] Migrar `app/dashboard/distribucion/page.tsx` para usar `ingresosService`
- [ ] Migrar `lib/distribucion.ts` para usar `ingresosService`
- [ ] Eliminar completamente `lib/ingresos.ts` (o mantener solo tipos si se necesitan)

#### Fase 2: Mejoras de UX (Prioridad Media)
- [ ] Agregar funcionalidad de editar ingreso (modal/formulario)
- [ ] Implementar filtro por categoría en la UI
- [ ] Agregar paginación si hay muchos ingresos
- [ ] Implementar búsqueda de ingresos por descripción

#### Fase 3: Optimizaciones (Prioridad Baja)
- [ ] Implementar cache de ingresos (React Query/SWR)
- [ ] Agregar optimistic updates para mejor UX
- [ ] Implementar debounce en búsquedas/filtros
- [ ] Agregar retry automático en caso de error de red

#### Fase 4: Testing (Prioridad Media)
- [ ] Tests unitarios para `ingresosService`
- [ ] Tests de integración para endpoints
- [ ] Tests E2E para flujo completo de ingresos
- [ ] Tests de validación de schemas Zod

#### Fase 5: Observabilidad Avanzada (Prioridad Baja)
- [ ] Integrar con servicio de telemetría (Sentry, LogRocket, etc.)
- [ ] Métricas de performance (Core Web Vitals)
- [ ] Alertas automáticas para errores críticos
- [ ] Dashboard de métricas de uso

---

## Checklist de Integración

### ✅ Completado

- [x] Instalar dependencias necesarias (Zod ya estaba instalado)
- [x] Configurar la URL base del API (`config/api.ts`)
- [x] Sistema de autenticación implementado (JWT)
- [x] Servicio de ingresos creado con todas las funciones
- [x] Componentes de UI actualizados para mostrar ingresos
- [x] Selector de mes implementado (vía URL params)
- [x] Formulario de creación implementado
- [x] Mostrar total del mes
- [x] Manejar estados de carga y errores
- [x] Validar formatos de fecha y monto
- [x] Tipos TypeScript completos
- [x] Schemas Zod para validación
- [x] Telemetría básica habilitada
- [x] Documentación generada

### ⏳ Pendiente

- [ ] Migrar otros archivos que usan localStorage
- [ ] Implementar funcionalidad de editar
- [ ] Tests unitarios e integración
- [ ] Optimizaciones de performance

---

## Notas Técnicas

### Diferencias entre Mock y Real

| Aspecto | Mock (localStorage) | Real (Backend) |
|---------|---------------------|----------------|
| ID | `id: string` (generado local) | `_id: string` (MongoDB ObjectId) |
| Persistencia | localStorage (solo navegador) | MongoDB Atlas (persistente) |
| Sincronización | No sincroniza entre dispositivos | Sincroniza automáticamente |
| Validación | Mínima (frontend) | Completa (backend + frontend) |
| Autenticación | No requerida | JWT requerido |
| Errores | No hay errores de red | Manejo completo de errores |

### Decisiones Técnicas

1. **Normalización de Fechas:**
   - El servicio acepta `Date` objects o `string` (ISO)
   - Se normaliza a ISO string antes de enviar al backend
   - Facilita el uso desde formularios HTML (`<input type="date">`)

2. **Validación Dual:**
   - Validación en frontend (Zod) para UX rápida
   - Validación en backend para seguridad
   - Errores de validación se muestran inmediatamente

3. **Estados de Loading Separados:**
   - `loading`: Para operaciones de formulario
   - `loadingIngresos`: Para carga inicial de datos
   - Permite mejor feedback al usuario

4. **Manejo de Errores Centralizado:**
   - Función `fetchAPI` centraliza el manejo de errores
   - Consistente con otros servicios (gastos, mensajes, etc.)
   - Fácil de mantener y extender

---

## Conclusión

La integración del módulo de ingresos con el backend MongoDB ha sido completada exitosamente. El sistema ahora:

- ✅ Usa datos reales de MongoDB Atlas
- ✅ Tiene validación completa de datos
- ✅ Maneja errores apropiadamente
- ✅ Proporciona feedback claro al usuario
- ✅ Incluye telemetría básica para debugging
- ✅ Sigue las mejores prácticas del proyecto

**Estado Final:** ✅ **PRODUCCIÓN READY** (para la página principal de ingresos)

**Próxima Fase:** Migrar archivos legacy que aún usan localStorage.

---

**Generado por:** Staff Engineer Integration Process  
**Fecha:** $(date)  
**Versión:** 1.0.0

