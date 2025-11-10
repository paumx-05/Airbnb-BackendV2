/**
 * Configuración base para las llamadas a la API del backend
 * Centraliza la URL base, headers por defecto y manejo de errores
 */

// URL base del backend - se puede configurar con variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Headers por defecto para todas las peticiones
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Clase para manejar las peticiones HTTP al backend
 * Incluye interceptores para manejo de errores y tokens
 */
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = { ...DEFAULT_HEADERS };
  }

  /**
   * Método genérico para realizar peticiones HTTP
   * @param endpoint - Endpoint de la API (ej: '/api/auth/login')
   * @param options - Opciones de fetch (method, body, headers, etc.)
   * @returns Promise con la respuesta parseada
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Combinar headers por defecto con los personalizados
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Agregar token de autenticación si existe
    const token = this.getAuthToken();
    console.log('🔍 [ApiClient] Token encontrado:', token ? 'SÍ' : 'NO');
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
      console.log('🔍 [ApiClient] Header Authorization agregado:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('⚠️ [ApiClient] No hay token disponible para esta petición');
    }

    try {
      console.log('🔍 [ApiClient] ============================================');
      console.log('🔍 [ApiClient] Enviando petición a:', url);
      console.log('🔍 [ApiClient] Método:', options.method || 'GET');
      console.log('🔍 [ApiClient] Headers:', JSON.stringify(headers, null, 2));
      console.log('🔍 [ApiClient] Body:', options.body);
      console.log('🔍 [ApiClient] ============================================');
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('🔍 [ApiClient] Status:', response.status);
      console.log('🔍 [ApiClient] Status Text:', response.statusText);

      // Verificar si el servidor envió un nuevo token en los headers
      const newToken = response.headers.get('x-new-token');
      if (newToken) {
        console.log('🔄 [ApiClient] Token renovado automáticamente');
        this.setAuthToken(newToken);
        localStorage.setItem('airbnb_auth_token', newToken);
      }

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            errorData = { message: text || `Error ${response.status}` };
          }
        } catch (parseError) {
          console.error('💥 [ApiClient] Error parseando respuesta de error:', parseError);
          errorData = { message: `Error ${response.status}: ${response.statusText}` };
        }
        
        console.log('❌ [ApiClient] Error response (status:', response.status, '):', errorData);
        
        // Si el error es 401 o 403 (token expirado), intentar renovar
        // ⚠️ PROTECCIÓN: No renovar si recibimos 429 (Too Many Requests) o si ya intentamos renovar
        if ((response.status === 401 || response.status === 403) && 
            response.status !== 429 && // NO renovar si recibimos 429
            (errorData.error?.message === 'Token inválido o expirado' || 
             errorData.message === 'Token inválido o expirado' ||
             errorData.message === 'Unauthorized')) {
          
          // Verificar si ya estamos en proceso de renovación (evitar bucles infinitos)
          const refreshInProgress = (this as any)._isRefreshing || false;
          const refreshAttempts = (this as any)._refreshAttempts || 0;
          const MAX_REFRESH_ATTEMPTS = 1; // Solo permitir 1 intento
          
          if (refreshInProgress || refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.warn('⚠️ [ApiClient] Renovación ya en progreso o máximo de intentos alcanzado, limpiando sesión');
            this.removeAuthToken();
            localStorage.removeItem('airbnb_auth_token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Token expirado y no se pudo renovar');
          }
          
          console.log('🔄 [ApiClient] Token expirado, intentando renovar...');
          (this as any)._isRefreshing = true;
          (this as any)._refreshAttempts = refreshAttempts + 1;
          
          try {
            const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ token })
            });
            
            // Si recibimos 429, no intentar más renovaciones
            if (refreshResponse.status === 429) {
              console.error('❌ [ApiClient] Error 429 (Too Many Requests) al renovar token - limpiando sesión');
              (this as any)._isRefreshing = false;
              (this as any)._refreshAttempts = MAX_REFRESH_ATTEMPTS + 1; // Marcar como máximo alcanzado
              
              // Marcar error 429 en localStorage para que otros componentes lo detecten
              localStorage.setItem('auth_429_error', 'true');
              
              this.removeAuthToken();
              localStorage.removeItem('airbnb_auth_token');
              localStorage.removeItem('user');
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              throw new Error('Error 429: Too Many Requests');
            }
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const newToken = refreshData.data?.token || refreshData.token;
              
              if (newToken) {
                console.log('✅ [ApiClient] Token renovado exitosamente');
                
                // Actualizar el token
                this.setAuthToken(newToken);
                localStorage.setItem('airbnb_auth_token', newToken);
                
                // Resetear contadores
                (this as any)._isRefreshing = false;
                (this as any)._refreshAttempts = 0;
                
                // Reintentar la petición original con el nuevo token (solo una vez)
                const retryResponse = await fetch(url, {
                  ...options,
                  headers: {
                    ...headers,
                    'Authorization': `Bearer ${newToken}`
                  }
                });
                
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json();
                  console.log('✅ [ApiClient] Petición reintentada exitosamente');
                  return retryData;
                }
              }
            }
          } catch (refreshError) {
            console.error('💥 [ApiClient] Error renovando token:', refreshError);
            (this as any)._isRefreshing = false;
            
            // Si no se puede renovar, limpiar tokens y redirigir al login
            this.removeAuthToken();
            localStorage.removeItem('airbnb_auth_token');
            localStorage.removeItem('user');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        
        // Mensaje más descriptivo para 404
        if (response.status === 404) {
          const endpoint = url.replace(this.baseURL, '');
          const errorMsg = errorData.message || errorData.error?.message || response.statusText;
          
          // Mensaje específico para endpoints de pagos
          if (endpoint.includes('/payments/checkout/create-intent')) {
            throw new Error(
              `El endpoint de creación de payment intent no está disponible (404).\n` +
              `Verifica que:\n` +
              `1. El backend esté corriendo en ${this.baseURL}\n` +
              `2. El endpoint esté implementado: POST ${endpoint}\n` +
              `3. La ruta esté correctamente registrada en el servidor\n` +
              `Error: ${errorMsg}`
            );
          }
          
          throw new Error(
            `Endpoint no encontrado (404): ${endpoint}\n` +
            `Verifica en la documentación de Postman cuál es el endpoint correcto.\n` +
            `Error: ${errorMsg}`
          );
        }
        
        throw new Error(
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      // Parsear respuesta JSON
      const data = await response.json();
      console.log('✅ [ApiClient] Response data:', data);
      return data;
    } catch (error) {
      console.log('💥 [ApiClient] Error:', error);
      // Manejar errores de red o parsing
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Obtener token de autenticación desde localStorage
   */
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('airbnb_auth_token');
    }
    return null;
  }

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('airbnb_auth_token', token);
    }
  }

  /**
   * Remover token de autenticación
   */
  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airbnb_auth_token');
    }
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Exportar también la URL base para uso en otros archivos
export { API_BASE_URL };
