/**
 * Hook personalizado para manejar la renovación automática de tokens
 * Implementa la renovación automática según la guía FRONTEND_TOKEN_REFRESH_GUIDE.md
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UseTokenRefreshOptions {
  // Intervalo en milisegundos para verificar la renovación (por defecto 14 minutos)
  checkInterval?: number;
  // Tiempo antes de la expiración para renovar (por defecto 5 minutos)
  refreshBeforeExpiry?: number;
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const { refreshToken } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const has429Error = useRef<boolean>(false); // Flag para detectar error 429
  const refreshAttempts = useRef<number>(0); // Contador de intentos
  const MAX_REFRESH_ATTEMPTS = 1; // Solo permitir 1 intento
  
  const {
    checkInterval = 14 * 60 * 1000, // 14 minutos
    refreshBeforeExpiry = 5 * 60 * 1000 // 5 minutos
  } = options;

  useEffect(() => {
    console.log('🔄 [useTokenRefresh] Configurando renovación automática de tokens...');
    
    const checkAndRefreshToken = async () => {
      // ⚠️ PROTECCIÓN: Verificar flag en localStorage (persistente entre recargas)
      const has429ErrorInStorage = localStorage.getItem('auth_429_error') === 'true';
      if (has429ErrorInStorage || has429Error.current) {
        console.warn('⚠️ [useTokenRefresh] Error 429 detectado anteriormente, deteniendo renovación automática');
        has429Error.current = true;
        // Limpiar intervalo si existe
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      // ⚠️ PROTECCIÓN: No intentar renovar si ya se alcanzó el máximo de intentos
      if (refreshAttempts.current >= MAX_REFRESH_ATTEMPTS) {
        console.warn('⚠️ [useTokenRefresh] Máximo de intentos alcanzado, deteniendo renovación automática');
        // Limpiar intervalo si existe
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      try {
        const token = localStorage.getItem('airbnb_auth_token');
        if (!token) {
          console.log('🔍 [useTokenRefresh] No hay token, saltando renovación');
          return;
        }

        // Decodificar el token para obtener la fecha de expiración
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // Convertir a milisegundos
          const now = Date.now();
          const timeUntilExpiry = exp - now;

          console.log('🔍 [useTokenRefresh] Tiempo hasta expiración:', Math.round(timeUntilExpiry / 1000 / 60), 'minutos');

          // Si el token expira en menos de refreshBeforeExpiry, renovarlo
          if (timeUntilExpiry < refreshBeforeExpiry) {
            console.log('🔄 [useTokenRefresh] Token próximo a expirar, renovando...');
            refreshAttempts.current += 1;
            try {
              await refreshToken();
              refreshAttempts.current = 0; // Resetear si tiene éxito
            } catch (error: any) {
              // Detectar error 429 y detener renovación automática
              if (error?.message?.includes('429') || 
                  error?.message?.includes('Too Many Requests') ||
                  error?.message?.includes('Error 429')) {
                console.error('❌ [useTokenRefresh] Error 429 detectado, deteniendo renovación automática');
                has429Error.current = true;
                // Marcar en localStorage para persistencia
                localStorage.setItem('auth_429_error', 'true');
                // Limpiar intervalo
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                return; // NO re-lanzar, solo detener
              }
              throw error; // Re-lanzar otros errores
            }
          } else {
            console.log('✅ [useTokenRefresh] Token aún válido, no es necesario renovar');
          }
        } catch (error) {
          console.error('💥 [useTokenRefresh] Error decodificando token:', error);
          // Si no se puede decodificar el token, NO intentar renovar automáticamente
          // Esto evita bucles infinitos
          console.warn('⚠️ [useTokenRefresh] Token inválido, pero NO renovando automáticamente para evitar bucles');
        }
      } catch (error: any) {
        console.error('💥 [useTokenRefresh] Error en renovación automática:', error);
        // Detectar error 429 y detener renovación automática
        if (error?.message?.includes('429') || 
            error?.message?.includes('Too Many Requests') ||
            error?.message?.includes('Error 429')) {
          console.error('❌ [useTokenRefresh] Error 429 detectado, deteniendo renovación automática');
          has429Error.current = true;
          // Marcar en localStorage para persistencia
          localStorage.setItem('auth_429_error', 'true');
          // Limpiar intervalo
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    };

    // Ejecutar inmediatamente
    checkAndRefreshToken();

    // Configurar intervalo
    intervalRef.current = setInterval(checkAndRefreshToken, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🧹 [useTokenRefresh] Limpiando intervalo de renovación');
      }
    };
  }, [refreshToken, checkInterval, refreshBeforeExpiry]);

  return {
    // Función para renovar manualmente
    refreshToken: async () => {
      try {
        await refreshToken();
        console.log('✅ [useTokenRefresh] Token renovado manualmente');
      } catch (error) {
        console.error('💥 [useTokenRefresh] Error en renovación manual:', error);
      }
    }
  };
};
