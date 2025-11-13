// Configuración de la API
// Centraliza la URL base del backend y configuración de endpoints

export const API_CONFIG = {
  // URL base del backend - debe ser configurada via variable de entorno
  // Según documentación: http://localhost:4444
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444',
  
  // Endpoints de autenticación
  // Formato: /api/auth/<endpoint>
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me', // Obtener usuario actual
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USERS: {
      PROFILE: '/api/users/profile', // Obtener perfil
      UPDATE_PROFILE: '/api/users/profile', // Actualizar perfil
    },
    GASTOS: {
      GET_BY_MES: (mes: string) => `/api/gastos/${mes}`, // Obtener gastos por mes
      CREATE: '/api/gastos', // Crear gasto
      UPDATE: (id: string) => `/api/gastos/${id}`, // Actualizar gasto
      DELETE: (id: string) => `/api/gastos/${id}`, // Eliminar gasto
      GET_TOTAL: (mes: string) => `/api/gastos/${mes}/total`, // Obtener total de gastos por mes
      GET_BY_CATEGORIA: (mes: string, categoria: string) => `/api/gastos/${mes}/categoria/${encodeURIComponent(categoria)}`, // Obtener gastos por categoría
    },
    AMIGOS: {
      GET_ALL: '/api/amigos', // Obtener todos los amigos
      GET_BY_ID: (id: string) => `/api/amigos/${id}`, // Obtener amigo por ID
      SEARCH: (query: string) => `/api/amigos/search?q=${encodeURIComponent(query)}`, // Buscar amigos
      GET_BY_ESTADO: (estado: string) => `/api/amigos/estado/${estado}`, // Obtener amigos por estado
      CREATE: '/api/amigos', // Crear amigo
      UPDATE: (id: string) => `/api/amigos/${id}`, // Actualizar amigo
      UPDATE_ESTADO: (id: string) => `/api/amigos/${id}/estado`, // Actualizar estado de amigo
      DELETE: (id: string) => `/api/amigos/${id}`, // Eliminar amigo
    }
  },
  
  // Timeout para requests (ms)
  TIMEOUT: 10000,
}

