/**
 * Interceptor de Axios para renovación automática de tokens JWT
 * Implementa la renovación automática según la guía FRONTEND_TOKEN_REFRESH_GUIDE.md
 * 
 * ⚠️ IMPORTANTE: Este interceptor está DESHABILITADO porque ApiClient ya maneja la renovación.
 * Mantener este archivo solo para referencia futura.
 */

import { apiClient } from './config';

// Variable para evitar múltiples intentos de renovación simultáneos
let isRefreshing = false;
let refreshAttempts = 0; // Contador de intentos de renovación
const MAX_REFRESH_ATTEMPTS = 1; // Solo permitir 1 intento de renovación
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

/**
 * Procesar la cola de peticiones fallidas después de renovar el token
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Interceptor de respuesta para manejar tokens expirados
 * ⚠️ DESHABILITADO: ApiClient ya maneja la renovación de tokens
 * Este interceptor causaba bucles infinitos al duplicar la lógica de renovación
 */
export const setupResponseInterceptor = () => {
  console.log('⚠️ [authInterceptor] Interceptor DESHABILITADO - ApiClient ya maneja la renovación');
  // NO sobrescribir apiClient.request - ApiClient ya tiene la lógica de renovación
  // Esto evita bucles infinitos de renovación
};

/**
 * Interceptor de petición para agregar token automáticamente
 * Simplificado para evitar conflictos con la lógica existente
 */
export const setupRequestInterceptor = () => {
  console.log('🔧 [authInterceptor] Configurando interceptor de petición...');
  // El ApiClient ya maneja los tokens automáticamente, no necesitamos sobrescribir
  console.log('✅ [authInterceptor] Interceptor de petición configurado');
};

/**
 * Configurar todos los interceptores
 * ⚠️ DESHABILITADO: ApiClient ya maneja la renovación de tokens
 */
export const setupAuthInterceptors = () => {
  console.log('⚠️ [authInterceptor] Interceptores DESHABILITADOS - ApiClient ya maneja la renovación');
  // NO configurar interceptores - ApiClient ya tiene la lógica de renovación
  // Esto evita bucles infinitos de renovación
};

// NO configurar interceptores automáticamente - ApiClient ya maneja la renovación
// setupAuthInterceptors(); // DESHABILITADO
