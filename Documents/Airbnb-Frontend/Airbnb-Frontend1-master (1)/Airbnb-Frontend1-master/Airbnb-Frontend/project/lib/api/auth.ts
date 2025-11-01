/**
 * Servicios de autenticación para conectar con el backend real
 * Implementa persistencia de sesión JWT según mejores prácticas
 */

import { apiClient } from './config';

// Interfaces para tipado de las respuestas del backend
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  role: 'admin' | 'user'; // Rol del usuario - REQUERIDO - debe venir del backend
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Servicios de autenticación que se conectan al backend real
 */
export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   * POST /api/auth/login
   * Implementa guardado correcto de token y usuario según mejores prácticas
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // 🚨 MODO DEMO TEMPORAL - Para probar el flujo de cambio de contraseña
      const DEMO_MODE = process.env.NODE_ENV === 'development';
      const DEMO_CREDENTIALS = [
        { email: 'demo@airbnb.com', password: 'demo1234' },
        { email: 'admin@airbnb.com', password: 'Admin1234!' },
        { email: 'ana1@gmail.com', password: '123456789' }
      ];
      
      if (DEMO_MODE && DEMO_CREDENTIALS.some(cred => cred.email === email && cred.password === password)) {
        console.log('🎭 [authService] MODO DEMO ACTIVADO - Simulando login exitoso');
        
        const demoUser: User = {
          id: 'demo-user-123',
          email: email,
          name: email.split('@')[0],
          avatar: undefined,
          createdAt: new Date().toISOString(),
          role: email === 'admin@airbnb.com' ? 'admin' : 'user' // Asignar role según email en modo demo
        };
        
        const demoToken = 'demo-jwt-token-' + Date.now();
        
        // Guardar token y usuario usando tokenStorage
        tokenStorage.set(demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('✅ [authService] Login demo exitoso, token y usuario guardados');
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          message: 'Login exitoso (modo demo)'
        };
      }
      
      const loginData: LoginRequest = { email, password };
      console.log('🔍 [authService] Enviando datos de login:', loginData);
      
      const response = await apiClient.post<AuthResponse>('/api/auth/login', loginData);
      console.log('🔍 [authService] Respuesta COMPLETA del backend:', JSON.stringify(response, null, 2));
      
      // ✅ GUARDAR TOKEN Y USUARIO según recomendaciones del backend
      // El backend devuelve los datos dentro de un objeto 'data'
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      if (response.success && token && user) {
        console.log('✅ [authService] Login exitoso, guardando token y usuario');
        console.log('🔍 [authService] Token recibido:', token.substring(0, 20) + '...');
        console.log('🔍 [authService] Usuario recibido:', user.name);
        console.log('🔍 [authService] Rol del usuario:', user.role || 'NO ESPECIFICADO');
        
        // Verificar que el backend devolvió el campo role
        if (!user.role) {
          console.error('❌ [authService] ERROR: El backend NO devolvió el campo "role" en la respuesta de login');
          console.error('❌ [authService] Esto es CRÍTICO: sin el campo role no se pueden verificar permisos de admin');
          console.error('❌ [authService] Respuesta completa:', JSON.stringify(response, null, 2));
          console.error('❌ [authService] Por favor, verifica que el backend devuelva el campo "role" en el objeto user');
          // Asignar 'user' por defecto, pero esto es temporal hasta que el backend se corrija
          user.role = 'user';
          console.warn('⚠️ [authService] Asignando role="user" por defecto (TEMPORAL)');
        }
        
        // Usar tokenStorage para guardar token (localStorage + cookies + apiClient)
        tokenStorage.set(token);
        console.log('🔍 [authService] Token guardado con tokenStorage');
        
        // Guardar información del usuario (incluyendo el role)
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage con role:', user.role);
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('airbnb_auth_token');
        console.log('🔍 [authService] Verificación - Token guardado:', savedToken ? 'SÍ' : 'NO');
        if (savedToken) {
          console.log('🔍 [authService] Token verificado:', savedToken.substring(0, 20) + '...');
        }
        
        console.log('✅ [authService] Token y usuario guardados correctamente');
      } else {
        console.log('❌ [authService] No se recibió token o usuario válido');
        console.log('  - response.success:', response.success);
        console.log('  - response.data:', response.data);
        console.log('  - user:', user);
        console.log('  - token:', token);
      }
      
      return response;
    } catch (error) {
      console.log('💥 [authService] Error en login:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   * Implementa guardado correcto de token y usuario según mejores prácticas
   */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const registerData: RegisterRequest = { email, password, name };
      console.log('🔍 [authService] Enviando datos de registro:', { email, name });
      
      const response = await apiClient.post<AuthResponse>('/api/auth/register', registerData);
      console.log('🔍 [authService] Respuesta del backend:', response);
      
      // ✅ GUARDAR TOKEN Y USUARIO según recomendaciones del backend
      // El backend devuelve los datos dentro de un objeto 'data'
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      
      if (response.success && token && user) {
        console.log('✅ [authService] Registro exitoso, guardando token y usuario');
        console.log('🔍 [authService] Token recibido:', token.substring(0, 20) + '...');
        console.log('🔍 [authService] Usuario recibido:', user.name);
        
        // Usar tokenStorage para guardar token (localStorage + cookies + apiClient)
        tokenStorage.set(token);
        console.log('🔍 [authService] Token guardado con tokenStorage');
        
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(user));
        console.log('🔍 [authService] Usuario guardado en localStorage');
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('airbnb_auth_token');
        console.log('🔍 [authService] Verificación - Token guardado:', savedToken ? 'SÍ' : 'NO');
        if (savedToken) {
          console.log('🔍 [authService] Token verificado:', savedToken.substring(0, 20) + '...');
        }
        
        console.log('✅ [authService] Token y usuario guardados correctamente');
      } else {
        console.log('❌ [authService] No se recibió token o usuario válido');
        console.log('  - response.success:', response.success);
        console.log('  - response.data:', response.data);
        console.log('  - user:', user);
        console.log('  - token:', token);
      }
      
      return response;
    } catch (error) {
      console.log('💥 [authService] Error en registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   * Implementa logout correcto según recomendaciones del backend
   */
  async logout(): Promise<AuthResponse> {
    try {
      // Opcional: notificar al backend
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('💥 [authService] Error en logout del backend:', error);
    } finally {
      // ✅ SIEMPRE limpiar el frontend según recomendaciones
      localStorage.removeItem('airbnb_auth_token');
      localStorage.removeItem('user');
      
      // Sincronizar con apiClient
      apiClient.removeAuthToken();
      
      console.log('✅ [authService] Sesión cerrada correctamente');
    }
    
    return {
      success: true,
      message: 'Sesión cerrada correctamente'
    };
  },

  /**
   * Verificar token de autenticación
   * GET /api/auth/verify
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/verify', {
        'Authorization': `Bearer ${token}`
      });
      
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token inválido'
      };
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Resetear contraseña con token
   * POST /api/auth/reset-password (endpoint local de Next.js)
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Usar el endpoint local de Next.js en lugar del backend externo
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },


  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/me
   * IMPORTANTE: Debe devolver el campo 'role' en el objeto user
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      
      // Verificar que el usuario tenga el campo role
      const user = response.data?.user || response.user;
      if (user && !user.role) {
        console.warn('⚠️ [authService] El backend no devolvió el campo "role" en /api/auth/me');
        console.warn('⚠️ [authService] Respuesta recibida:', JSON.stringify(response, null, 2));
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  },

  /**
   * Renovar token JWT
   * POST /api/auth/refresh
   * Implementa renovación automática de tokens según la guía
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const currentToken = localStorage.getItem('airbnb_auth_token');
      if (!currentToken) {
        return {
          success: false,
          message: 'No hay token para renovar'
        };
      }

      console.log('🔄 [authService] Renovando token...');
      const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
        token: currentToken
      });

      if (response.success && response.token) {
        console.log('✅ [authService] Token renovado exitosamente');
        
        // Actualizar token usando tokenStorage
        tokenStorage.set(response.token);
        
        // Si también se devuelve información del usuario, actualizarla
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      console.error('💥 [authService] Error renovando token:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error renovando token'
      };
    }
  },

  /**
   * Verificar si el usuario está autenticado
   * Función recomendada por el backend para verificar sesión al cargar la página
   */
  async checkAuthStatus(): Promise<User | false> {
    const token = localStorage.getItem('airbnb_auth_token');
    
    if (!token) {
      console.log('🔍 [authService] No hay token, usuario no autenticado');
      return false;
    }
    
    try {
      console.log('🔍 [authService] Verificando token con el backend...');
      const response = await apiClient.get<AuthResponse>('/api/auth/me');
      
      console.log('🔍 [authService] Respuesta del backend:', response);
      
      // El backend puede devolver el usuario en response.user o response.data.user
      const user = response.user || response.data?.user;
      
      if (response.success && user) {
        console.log('✅ [authService] Token válido, usuario autenticado:', user.name);
        
        // Verificar que el usuario tenga el campo role
        if (!user.role) {
          console.warn('⚠️ [authService] El backend no devolvió el campo "role" en /api/auth/me');
          console.warn('⚠️ [authService] Usuario recibido:', JSON.stringify(user, null, 2));
          console.warn('⚠️ [authService] Esto puede causar problemas con las funciones de admin');
          // Por defecto, asumir 'user' si no viene el role
          user.role = 'user';
        }
        
        // Guardar el usuario con el role actualizado en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      } else {
        console.log('❌ [authService] Token inválido, limpiando storage');
        console.log('  - response.success:', response.success);
        console.log('  - response.user:', response.user);
        console.log('  - response.data:', response.data);
        console.log('  - user extraído:', user);
        console.log('  - response.message:', response.message);
        localStorage.removeItem('airbnb_auth_token');
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('💥 [authService] Error verificando autenticación:', error);
      // No limpiar el storage en caso de error de red, solo si es error de autenticación
      if (error instanceof Error && error.message.includes('401')) {
        console.log('❌ [authService] Error 401, limpiando storage');
        localStorage.removeItem('airbnb_auth_token');
        localStorage.removeItem('user');
      }
      return false;
    }
  }
};

/**
 * Función helper para hacer peticiones autenticadas
 * Envía JWT en todas las peticiones según recomendaciones del backend
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('airbnb_auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers
  });
};

// Utilidades para manejo de tokens (compatibilidad con el sistema actual)
export const tokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      // Guardar en localStorage para el AuthContext
      localStorage.setItem('airbnb_auth_token', token);
      
      // Guardar en cookies para el middleware
      // En desarrollo (HTTP) no usar Secure, en producción (HTTPS) sí
      const isSecure = window.location.protocol === 'https:';
      const maxAge = 7 * 24 * 60 * 60; // 7 días
      document.cookie = `airbnb_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      
      // Sincronizar con apiClient
      apiClient.setAuthToken(token);
      
      console.log('🔐 [tokenStorage] Token guardado en localStorage, cookies y apiClient');
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('airbnb_auth_token');
      console.log('🔐 [tokenStorage] Token recuperado:', token ? 'existe' : 'no existe');
      return token;
    }
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airbnb_auth_token');
      
      // Eliminar cookie
      document.cookie = 'airbnb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Sincronizar con apiClient
      apiClient.removeAuthToken();
      
      console.log('🔐 [tokenStorage] Token eliminado de localStorage, cookies y apiClient');
    }
  }
};
