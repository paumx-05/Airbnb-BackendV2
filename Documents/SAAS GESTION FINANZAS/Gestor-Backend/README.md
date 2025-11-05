# Gestor Backend

Backend para sistema de gestión financiera desarrollado con Express.js, MongoDB y TypeScript.

## 🚀 Tecnologías

- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **TypeScript** - Lenguaje de programación
- **Mongoose** - ODM para MongoDB

## 📁 Estructura del Proyecto

```
Gestor-Backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de MongoDB
│   ├── controllers/             # Controladores (lógica de negocio)
│   │   └── example.controller.ts
│   ├── models/                  # Modelos de datos (Mongoose)
│   │   └── example.model.ts
│   ├── routes/                  # Rutas de la API
│   │   └── example.routes.ts
│   └── server.ts                # Archivo principal del servidor
├── dist/                        # Código compilado (generado)
├── package.json
├── tsconfig.json
└── .env                         # Variables de entorno (crear manualmente)
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```env
PORT=4444
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gestor-finanzas
```

3. Asegurarse de que MongoDB esté corriendo

## 🏃 Ejecución

### Modo desarrollo:
```bash
npm run dev
```

### Compilar TypeScript:
```bash
npm run build
```

### Modo producción:
```bash
npm start
```

## 📡 Endpoints de Ejemplo

### Health Check
- `GET /health` - Verificar estado del servidor

### API de Ejemplo
- `GET /api/example` - Obtener todos los ejemplos
- `GET /api/example/:id` - Obtener un ejemplo por ID
- `POST /api/example` - Crear un nuevo ejemplo
- `PUT /api/example/:id` - Actualizar un ejemplo
- `DELETE /api/example/:id` - Eliminar un ejemplo

## 📝 Convenciones

- **Programación funcional** - Se prefiere funciones sobre clases
- **Arquitectura MVC** - Separación clara de responsabilidades
- **REST API** - Todos los endpoints siguen estándares REST
- **TypeScript** - Tipado fuerte para mejor mantenibilidad

## 🔧 Desarrollo

El proyecto sigue principios de:
- Código simple y comprensible
- Arquitectura escalable
- Separación de responsabilidades (MVC)
- Soluciones ligeras y eficientes

