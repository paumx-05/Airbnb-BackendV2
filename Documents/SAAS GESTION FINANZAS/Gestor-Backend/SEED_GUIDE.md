# Guía de Seed - Base de Datos MongoDB

## 📋 Descripción

Script interactivo de seed para poblar la base de datos MongoDB con datos de ejemplo. El script pregunta confirmación en cada paso para que tengas control total sobre qué datos se crean.

## 🚀 Cómo Ejecutar

```bash
npm run seed
```

## ✅ Funcionalidades

### 1. Verificación de Conexión
- Se conecta a MongoDB usando la URI configurada
- Verifica que la conexión sea exitosa
- Te pregunta si quieres continuar antes de proceder

### 2. Limpieza de Base de Datos (Opcional)
- Pregunta si deseas limpiar todas las colecciones antes de crear datos nuevos
- Útil para empezar desde cero

### 3. Creación de Usuarios
- **Usuario Regular**: `usuario@example.com` / `password123`
- **Usuario Admin**: `admin@example.com` / `password123`
- Ambos con contraseñas hasheadas con bcrypt

### 4. Creación de Categorías
- 6 categorías de gastos: Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud
- 3 categorías de ingresos: Salario, Freelance, Inversiones
- 1 categoría personalizada: Personalizada (ambos)

### 5. Creación de Gastos
- 5 gastos de ejemplo para el mes actual
- Incluye diferentes categorías
- Un gasto con división de amigos (ejemplo)

### 6. Creación de Ingresos
- 3 ingresos de ejemplo para el mes actual
- Diferentes tipos de ingresos
- Total: 3150.00€

### 7. Creación de Presupuestos
- 5 presupuestos configurados para el mes actual
- Con porcentajes calculados automáticamente
- Basados en el total de ingresos

### 8. Creación de Amigos
- 3 amigos de ejemplo
- Estados: activo, activo, pendiente
- Con emails y nombres

### 9. Creación de Mensajes de Chat
- 3 mensajes de chat de ejemplo
- Incluye mensajes del sistema (recordatorios de pago)
- Mensajes normales entre usuarios

### 10. Creación de Mensajes
- 3 mensajes generales de ejemplo
- De diferentes remitentes (Sistema, Soporte, Administrador)
- Algunos leídos, otros no

### 11. Creación de Notificaciones
- 4 notificaciones de ejemplo
- Diferentes tipos: success, info, warning, error
- Ejemplos de alertas financieras

## 📊 Datos Creados

### Usuarios
- **Regular**: `usuario@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### Gastos (5)
- Supermercado semanal: 85.50€
- Gasolina: 45.00€
- Alquiler: 600.00€ (con división de amigos)
- Luz y agua: 120.00€
- Cine: 25.00€

### Ingresos (3)
- Salario mensual: 2500.00€
- Proyecto freelance: 500.00€
- Dividendos: 150.00€

### Presupuestos (5)
- Alimentación: 300.00€ (9.52%)
- Transporte: 200.00€ (6.35%)
- Vivienda: 600.00€ (19.05%)
- Servicios: 150.00€ (4.76%)
- Entretenimiento: 100.00€ (3.17%)

### Amigos (3)
- Juan Pérez (activo)
- María García (activo)
- Carlos López (pendiente)

## 🔄 Flujo del Script

1. **Conectar a MongoDB** → Verifica conexión
2. **Confirmar continuar** → Pregunta si proceder
3. **Limpiar DB** (opcional) → Elimina todos los datos existentes
4. **Crear usuarios** → Usuario regular y admin
5. **Crear categorías** → 10 categorías de ejemplo
6. **Crear amigos** → 3 amigos de ejemplo
7. **Crear gastos** → 5 gastos del mes actual
8. **Crear ingresos** → 3 ingresos del mes actual
9. **Crear presupuestos** → 5 presupuestos configurados
10. **Crear mensajes chat** → 3 mensajes de chat
11. **Crear mensajes** → 3 mensajes generales
12. **Crear notificaciones** → 4 notificaciones
13. **Resumen final** → Muestra conteo de registros creados

## ⚙️ Configuración

### Variables de Entorno

El script usa la variable `MONGODB_URI` del archivo `.env` o la URI por defecto:

```
MONGODB_URI=mongodb+srv://pablomaldonado422_db_user:Mbt3ylAXTIBSzhku@cluster0.tgnhplr.mongodb.net/gestor-finanzas?retryWrites=true&w=majority&appName=Cluster0
```

### Base de Datos

El script se conecta a la base de datos `gestor-finanzas` en MongoDB Atlas.

## 🎯 Ejemplo de Uso

```bash
$ npm run seed

🌱 Iniciando script de seed...

🔄 Conectando a MongoDB...
✅ MongoDB conectado exitosamente

✅ Conexión establecida. ¿Continuar con el seed? (s/n): s

⚠️  ¿Deseas limpiar TODAS las colecciones antes de crear los seeds? (s/n): s
🗑️  Limpiando base de datos...
✅ Base de datos limpiada exitosamente

👤 ¿Crear usuarios (regular y admin)? (s/n): s
👤 Creando usuarios...
✅ Usuario regular creado: usuario@example.com
✅ Usuario admin creado: admin@example.com

🏷️  ¿Crear categorías? (s/n): s
🏷️  Creando categorías...
✅ 10 categorías creadas

... (y así sucesivamente)
```

## 📝 Notas

- **Contraseñas**: Todos los usuarios tienen la contraseña `password123`
- **Mes actual**: Los gastos, ingresos y presupuestos se crean para el mes actual
- **Relaciones**: Los datos están relacionados correctamente (userId, amigoId, etc.)
- **Interactivo**: Puedes saltar cualquier paso respondiendo "n" o "no"
- **Seguro**: El script pregunta confirmación antes de limpiar la base de datos

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt antes de guardarse
- Los datos se crean solo para el usuario regular (no admin)
- El script no elimina datos sin confirmación explícita

## 🐛 Solución de Problemas

### Error de conexión
- Verifica que la URI de MongoDB sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica las credenciales de acceso

### Error de modelos
- Asegúrate de que todos los modelos estén correctamente definidos
- Verifica que los tipos TypeScript sean correctos

### Error de duplicados
- Si hay datos existentes, puedes limpiar la base de datos primero
- O simplemente no crear los datos que ya existen

---

**Última actualización**: Script de seed interactivo completo con todas las colecciones

