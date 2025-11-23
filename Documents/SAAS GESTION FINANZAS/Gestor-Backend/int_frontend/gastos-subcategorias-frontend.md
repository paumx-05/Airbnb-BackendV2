# Guía Frontend: Implementación de Subcategorías en Gastos

## ⚠️ PROBLEMA IDENTIFICADO

Si la subcategoría aparece como `null` en la base de datos, el problema está en **cómo el frontend está enviando el campo `subcategoria`** al backend.

---

## 📋 Formato Correcto para Enviar Subcategorías

### ✅ CORRECTO: Crear Gasto CON Subcategoría

**Request Body:**
```json
{
  "descripcion": "Compra en Mercadona",
  "monto": 45.50,
  "fecha": "2024-11-23T10:00:00.000Z",
  "categoria": "Alimentación",
  "subcategoria": "Supermercado",
  "mes": "noviembre"
}
```

**Importante:** El campo `subcategoria` debe ser un **string NO vacío** con el nombre exacto de la subcategoría.

---

### ✅ CORRECTO: Crear Gasto SIN Subcategoría

**Opción 1: No incluir el campo (RECOMENDADO)**
```json
{
  "descripcion": "Compra general",
  "monto": 20.00,
  "fecha": "2024-11-23T10:00:00.000Z",
  "categoria": "Alimentación",
  "mes": "noviembre"
}
```

**Opción 2: Enviar string vacío**
```json
{
  "descripcion": "Compra general",
  "monto": 20.00,
  "fecha": "2024-11-23T10:00:00.000Z",
  "categoria": "Alimentación",
  "subcategoria": "",
  "mes": "noviembre"
}
```

**Opción 3: Enviar null explícito**
```json
{
  "descripcion": "Compra general",
  "monto": 20.00,
  "fecha": "2024-11-23T10:00:00.000Z",
  "categoria": "Alimentación",
  "subcategoria": null,
  "mes": "noviembre"
}
```

---

## ❌ ERRORES COMUNES (Evitar)

### ❌ ERROR 1: Enviar undefined
```typescript
// ❌ INCORRECTO
const body = {
  descripcion: "Compra",
  monto: 20,
  categoria: "Alimentación",
  subcategoria: undefined  // ❌ Esto no se serializa en JSON
};
```

### ❌ ERROR 2: Enviar objeto en lugar de string
```json
{
  "subcategoria": { "nombre": "Supermercado" }  // ❌ INCORRECTO
}
```

### ❌ ERROR 3: Enviar array
```json
{
  "subcategoria": ["Supermercado"]  // ❌ INCORRECTO
}
```

---

## 💻 Implementación Correcta en TypeScript/React

### Ejemplo 1: Función para Crear Gasto

```typescript
interface GastoFormData {
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
  mes: string;
  subcategoria?: string | null;  // Opcional: string o null
  carteraId?: string | null;
}

const createGasto = async (data: GastoFormData): Promise<Gasto> => {
  const token = localStorage.getItem('token');
  
  // Construir body asegurándonos de que subcategoria sea string o null
  const body: any = {
    descripcion: data.descripcion.trim(),
    monto: data.monto,
    fecha: data.fecha,
    categoria: data.categoria.trim(),
    mes: data.mes.toLowerCase().trim()
  };

  // IMPORTANTE: Solo incluir subcategoria si tiene un valor válido (string no vacío)
  if (data.subcategoria && data.subcategoria.trim().length > 0) {
    body.subcategoria = data.subcategoria.trim();
  } else {
    // Si no hay subcategoría, enviar string vacío o null explícito
    body.subcategoria = null;  // O puedes usar "" (string vacío)
  }

  // Incluir carteraId si existe
  if (data.carteraId) {
    body.carteraId = data.carteraId;
  }

  const response = await fetch('http://localhost:4444/api/gastos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear gasto');
  }

  const result = await response.json();
  return result.data;
};
```

---

### Ejemplo 2: Componente React con Formulario

```typescript
import { useState, useEffect } from 'react';

interface Categoria {
  _id: string;
  nombre: string;
  tipo: 'gastos' | 'ingresos' | 'ambos';
  subcategorias: string[];
}

const GastoForm = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<string>('');
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<string[]>([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4444/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      setCategorias(result.data);
    };
    cargarCategorias();
  }, []);

  // Actualizar subcategorías disponibles cuando cambia la categoría
  useEffect(() => {
    if (categoriaSeleccionada) {
      const categoria = categorias.find(c => c.nombre === categoriaSeleccionada);
      if (categoria && categoria.subcategorias && categoria.subcategorias.length > 0) {
        setSubcategoriasDisponibles(categoria.subcategorias);
      } else {
        setSubcategoriasDisponibles([]);
      }
      // Resetear subcategoría seleccionada al cambiar categoría
      setSubcategoriaSeleccionada('');
    }
  }, [categoriaSeleccionada, categorias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      descripcion: (e.target as any).descripcion.value,
      monto: parseFloat((e.target as any).monto.value),
      fecha: (e.target as any).fecha.value,
      categoria: categoriaSeleccionada,
      mes: (e.target as any).mes.value,
      // IMPORTANTE: Enviar subcategoria solo si tiene valor
      subcategoria: subcategoriaSeleccionada && subcategoriaSeleccionada.trim().length > 0 
        ? subcategoriaSeleccionada.trim() 
        : null,
      carteraId: (e.target as any).carteraId?.value || null
    };

    try {
      await createGasto(formData);
      alert('Gasto creado exitosamente');
      // Resetear formulario
      (e.target as HTMLFormElement).reset();
      setCategoriaSeleccionada('');
      setSubcategoriaSeleccionada('');
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="descripcion" placeholder="Descripción" required />
      <input name="monto" type="number" step="0.01" placeholder="Monto" required />
      <input name="fecha" type="date" required />
      <input name="mes" placeholder="Mes" required />

      {/* Selector de categoría */}
      <select 
        value={categoriaSeleccionada} 
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        required
      >
        <option value="">Selecciona una categoría</option>
        {categorias
          .filter(c => c.tipo === 'gastos' || c.tipo === 'ambos')
          .map(cat => (
            <option key={cat._id} value={cat.nombre}>
              {cat.nombre}
            </option>
          ))}
      </select>

      {/* Selector de subcategoría (solo si hay subcategorías disponibles) */}
      {subcategoriasDisponibles.length > 0 && (
        <select 
          value={subcategoriaSeleccionada} 
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
        >
          <option value="">Sin subcategoría (opcional)</option>
          {subcategoriasDisponibles.map(sub => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      )}

      <button type="submit">Crear Gasto</button>
    </form>
  );
};
```

---

## 🔍 Validaciones que el Backend Realiza

El backend valida lo siguiente:

1. **Si se envía `subcategoria` con un valor (string no vacío):**
   - Verifica que la categoría tenga subcategorías definidas
   - Verifica que la subcategoría pertenezca a la categoría
   - Si la validación falla, retorna error `400`

2. **Si se envía `subcategoria` como `null`, `""` (string vacío), o no se envía:**
   - Se guarda como `null` en la base de datos
   - No se realiza validación

---

## 🐛 Debugging: Verificar qué se está enviando

Agrega este código en tu función de creación de gasto para verificar:

```typescript
const createGasto = async (data: GastoFormData): Promise<Gasto> => {
  const body: any = {
    descripcion: data.descripcion.trim(),
    monto: data.monto,
    fecha: data.fecha,
    categoria: data.categoria.trim(),
    mes: data.mes.toLowerCase().trim()
  };

  // Procesar subcategoria
  if (data.subcategoria && data.subcategoria.trim().length > 0) {
    body.subcategoria = data.subcategoria.trim();
  } else {
    body.subcategoria = null;  // O "" (string vacío)
  }

  // 🔍 DEBUG: Ver qué se está enviando
  console.log('📤 Enviando al backend:', JSON.stringify(body, null, 2));
  console.log('📤 Tipo de subcategoria:', typeof body.subcategoria);
  console.log('📤 Valor de subcategoria:', body.subcategoria);

  const response = await fetch('http://localhost:4444/api/gastos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  // ... resto del código
};
```

---

## ✅ Checklist de Implementación

- [ ] El campo `subcategoria` se envía como **string** (no objeto, no array)
- [ ] Si hay subcategoría seleccionada, se envía el **nombre exacto** de la subcategoría
- [ ] Si NO hay subcategoría, se envía `null` o `""` (string vacío), **NO** `undefined`
- [ ] El nombre de la subcategoría coincide **exactamente** con uno de los valores en `categoria.subcategorias[]`
- [ ] Se verifica en la consola del navegador que el JSON enviado tiene el formato correcto
- [ ] Se verifica en los logs del servidor que el backend recibe el campo correctamente

---

## 📝 Ejemplo Completo: Flujo Correcto

### Paso 1: Obtener Categorías con Subcategorías

```typescript
const categorias = await fetch('http://localhost:4444/api/categorias', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Resultado esperado:
// {
//   "success": true,
//   "data": [
//     {
//       "_id": "...",
//       "nombre": "Alimentación",
//       "tipo": "gastos",
//       "subcategorias": ["Supermercado", "Restaurantes", "Comida rápida"]
//     }
//   ]
// }
```

### Paso 2: Usuario Selecciona Categoría y Subcategoría

```typescript
const categoriaSeleccionada = "Alimentación";
const subcategoriaSeleccionada = "Supermercado";  // ✅ String válido
```

### Paso 3: Crear Gasto con Subcategoría

```typescript
const body = {
  descripcion: "Compra en Mercadona",
  monto: 45.50,
  fecha: "2024-11-23T10:00:00.000Z",
  categoria: "Alimentación",
  subcategoria: "Supermercado",  // ✅ String no vacío
  mes: "noviembre"
};

// JSON enviado:
// {
//   "descripcion": "Compra en Mercadona",
//   "monto": 45.50,
//   "fecha": "2024-11-23T10:00:00.000Z",
//   "categoria": "Alimentación",
//   "subcategoria": "Supermercado",  // ✅ Se guardará en la BD
//   "mes": "noviembre"
// }
```

### Paso 4: Verificar en Base de Datos

En MongoDB, el documento debería verse así:
```json
{
  "_id": ObjectId("..."),
  "descripcion": "Compra en Mercadona",
  "monto": 45.50,
  "categoria": "Alimentación",
  "subcategoria": "Supermercado",  // ✅ Guardado correctamente
  "mes": "noviembre",
  ...
}
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Subcategoría siempre es `null` en la BD

**Causa:** El frontend está enviando `undefined` o no está enviando el campo.

**Solución:**
```typescript
// ❌ INCORRECTO
const body = { ...otrosCampos, subcategoria: undefined };

// ✅ CORRECTO
const body = { 
  ...otrosCampos, 
  subcategoria: subcategoriaSeleccionada || null  // Siempre string o null
};
```

---

### Problema 2: Error "La subcategoría no pertenece a la categoría"

**Causa:** El nombre de la subcategoría no coincide exactamente (case-sensitive, espacios, etc.)

**Solución:**
```typescript
// Asegurarse de que el nombre coincida exactamente
const subcategoriaExacta = categoria.subcategorias.find(
  sub => sub.toLowerCase().trim() === subcategoriaSeleccionada.toLowerCase().trim()
);

if (subcategoriaExacta) {
  body.subcategoria = subcategoriaExacta;  // Usar el nombre exacto de la BD
}
```

---

### Problema 3: El campo no aparece en el request

**Causa:** El campo se está eliminando antes de serializar a JSON.

**Solución:**
```typescript
// ❌ INCORRECTO - JSON.stringify elimina undefined
const body = {
  subcategoria: undefined  // Se elimina del JSON
};

// ✅ CORRECTO
const body: any = {
  // otros campos
};
if (subcategoria) {
  body.subcategoria = subcategoria;
} else {
  body.subcategoria = null;  // Incluir explícitamente como null
}
```

---

## 📊 Verificación Final

Para verificar que todo funciona:

1. **Abre la consola del navegador** (F12)
2. **Crea un gasto con subcategoría**
3. **Verifica en Network tab** que el request body tenga:
   ```json
   {
     "subcategoria": "Supermercado"  // ✅ String no vacío
   }
   ```
4. **Verifica en MongoDB** que el documento tenga:
   ```json
   {
     "subcategoria": "Supermercado"  // ✅ Guardado correctamente
   }
   ```

---

## 📞 Soporte

Si después de seguir esta guía el problema persiste:

1. Verifica los logs del servidor (debería mostrar: `[Gasto creado] subcategoria guardada: ...`)
2. Verifica en la consola del navegador el JSON exacto que se está enviando
3. Verifica que la subcategoría existe en `categoria.subcategorias[]` antes de enviarla

---

**Documento generado:** 23 de noviembre de 2024  
**Versión:** 1.0  
**Estado:** ✅ Listo para implementar

