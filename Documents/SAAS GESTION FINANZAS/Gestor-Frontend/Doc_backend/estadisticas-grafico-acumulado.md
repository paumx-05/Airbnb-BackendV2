# Actualización Frontend: Gráfico de Evolución Acumulada

## Resumen

El frontend ha sido actualizado para mostrar valores **acumulados** en el gráfico de "Evolución de Ingresos y Gastos" en lugar de valores diarios/semanales/mensuales. Esto mejora significativamente la visualización para usuarios que tienen ingresos concentrados (como una nómina mensual) y permite ver claramente si se está gastando más de lo que se ingresa.

**Fecha de actualización:** Noviembre 2024

---

## Cambios en el Frontend

### Comportamiento Anterior

El gráfico mostraba valores **por periodo** (día/semana/mes):
- Si ingresas 1350€ el día 1, el gráfico mostraba 1350€ solo ese día
- Si ingresas 500€ el día 5, el gráfico mostraba 500€ solo ese día
- **Problema:** Para usuarios con una sola nómina al mes, el gráfico mostraba un pico al inicio y luego todo en 0

### Comportamiento Actual (Acumulado)

El gráfico ahora muestra valores **acumulados**:
- Si ingresas 1350€ el día 1, el gráfico muestra 1350€
- Si ingresas 500€ el día 5, el gráfico muestra **1850€** (1350 + 500)
- Si gastas 20€ el día 1, el gráfico muestra 20€
- Si gastas 30€ el día 3, el gráfico muestra **50€** (20 + 30)

**Ventajas:**
- ✅ Visualización clara de si gastos > ingresos (línea roja cruza por encima de la verde)
- ✅ Permite ver la evolución acumulativa del periodo
- ✅ Útil para usuarios con ingresos concentrados
- ✅ Muestra si estás cerca de gastar más de lo que ingresas

---

## Impacto en el Backend

### ✅ NO se requieren cambios en el backend

El endpoint `/api/estadisticas/tendencias` **sigue funcionando exactamente igual**. El frontend calcula los valores acumulados localmente antes de renderizar el gráfico.

**Estructura de datos actual (sin cambios):**
```json
{
  "datosGrafico": [
    {
      "fecha": "2024-11-01",
      "ingresos": 0,
      "gastos": 0
    },
    {
      "fecha": "2024-11-05",
      "ingresos": 500,
      "gastos": 300
    },
    {
      "fecha": "2024-11-10",
      "ingresos": 800,
      "gastos": 450
    }
  ]
}
```

**Cálculo en frontend:**
```typescript
// El frontend acumula los valores antes de renderizar
let ingresosAcumulados = 0
let gastosAcumulados = 0

datosGrafico.map((punto) => {
  ingresosAcumulados += punto.ingresos
  gastosAcumulados += punto.gastos
  return {
    fecha: punto.fecha,
    ingresos: ingresosAcumulados,
    gastos: gastosAcumulados,
    balance: ingresosAcumulados - gastosAcumulados
  }
})
```

---

## Mejoras Visuales Implementadas

### 1. Área Sombreada

El gráfico ahora incluye un área sombreada entre las líneas de ingresos y gastos:
- **Verde** cuando ingresos > gastos
- **Roja** cuando gastos > ingresos

Esto permite ver visualmente la diferencia acumulada entre ingresos y gastos.

### 2. Línea de Balance Neto (Opcional)

Se agregó una línea azul punteada que muestra el balance neto acumulado (ingresos - gastos):
- Por encima de 0: balance positivo
- Por debajo de 0: balance negativo (gastando más de lo ingresado)

### 3. Leyenda Actualizada

La leyenda ahora indica "Ingresos Acumulados" y "Gastos Acumulados" para mayor claridad.

---

## Consideraciones Futuras (Opcional)

### Opción 1: Mantener como está (Recomendado)

El cálculo en el frontend es eficiente y no requiere cambios en el backend. Es la solución más simple y flexible.

### Opción 2: Agregar campo opcional en el backend

Si en el futuro se quiere optimizar o dar más control, se podría agregar un query parameter opcional:

```
GET /api/estadisticas/tendencias?periodo=mensual&acumulado=true
```

**Respuesta con acumulado:**
```json
{
  "datosGrafico": [
    {
      "fecha": "2024-11-01",
      "ingresos": 0,
      "gastos": 0,
      "ingresosAcumulados": 0,
      "gastosAcumulados": 0,
      "balance": 0
    },
    {
      "fecha": "2024-11-05",
      "ingresos": 500,
      "gastos": 300,
      "ingresosAcumulados": 500,
      "gastosAcumulados": 300,
      "balance": 200
    }
  ]
}
```

**Ventajas:**
- Cálculo en el backend (más eficiente para grandes volúmenes)
- Consistencia garantizada
- Menos procesamiento en el cliente

**Desventajas:**
- Requiere cambios en el backend
- Más complejidad en la API
- El cálculo en frontend ya es suficientemente rápido

**Recomendación:** Mantener el cálculo en el frontend a menos que se identifique un problema de rendimiento.

---

## Testing

### Casos de Prueba Recomendados

1. **Usuario con nómina única:**
   - Ingreso de 2000€ el día 1
   - Gastos distribuidos durante el mes
   - **Verificar:** Gráfico muestra línea de ingresos plana en 2000€, gastos subiendo gradualmente

2. **Usuario con múltiples ingresos:**
   - Ingresos en días 1, 15, 20
   - **Verificar:** Línea de ingresos sube en escalones

3. **Gastos superan ingresos:**
   - Ingresos: 1000€
   - Gastos: 1200€
   - **Verificar:** Línea roja cruza por encima de la verde, área sombreada roja

4. **Balance negativo:**
   - Gastos acumulados > Ingresos acumulados
   - **Verificar:** Línea de balance neto está por debajo de 0

---

## Compatibilidad

- ✅ **Totalmente compatible** con la API actual
- ✅ **Sin breaking changes**
- ✅ **Retrocompatible** con versiones anteriores del frontend
- ✅ **No afecta** otros endpoints o funcionalidades

---

## Documentación Relacionada

- `estadisticas-integracion.md` - Documentación completa de endpoints de estadísticas
- `report-estadisticas.md` - Reporte de integración del módulo de estadísticas

---

**Última actualización:** Noviembre 2024
**Estado:** ✅ Implementado y funcional
**Requiere cambios en backend:** ❌ NO

