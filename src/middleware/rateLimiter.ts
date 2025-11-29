/**
 * RATE LIMITING MIDDLEWARE
 * Limita el número de requests por IP para prevenir abuso
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Almacén de requests por IP
const requestStore = new Map<string, RequestRecord>();

// Configuraciones por endpoint
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100, // Aumentado para evitar bloqueos en producción
    message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.'
  },
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: process.env.NODE_ENV === 'development' ? 2000 : 100, // Mucho más permisivo en desarrollo
    message: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.'
  },
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: process.env.NODE_ENV === 'development' ? 500 : 20, // Más permisivo en desarrollo
    message: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.'
  }
};

export const createRateLimiter = (configType: keyof typeof rateLimitConfigs = 'general') => {
  const config = rateLimitConfigs[configType];
  
  return (req: any, res: any, next: any) => {
    // En desarrollo, permitir deshabilitar rate limiting con variable de entorno
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMITING === 'true') {
      return next();
    }
    
    // Obtener IP real del cliente (soporta proxies y load balancers)
    // Esta función maneja correctamente X-Forwarded-For, X-Real-IP y otros headers comunes
    const getClientIP = (req: any): string => {
      // 1. Intentar obtener IP de X-Forwarded-For (más común en proxies)
      // X-Forwarded-For puede contener múltiples IPs separadas por comas
      // La primera IP es la IP original del cliente
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        const ips = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
          .split(',')
          .map((ip: string) => ip.trim())
          .filter((ip: string) => ip && ip !== 'unknown');
        if (ips.length > 0) {
          return ips[0];
        }
      }
      
      // 2. Intentar obtener IP de X-Real-IP (usado por nginx)
      const realIP = req.headers['x-real-ip'];
      if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP;
      }
      
      // 3. Usar req.ip si está configurado con trust proxy
      // Esto funciona cuando app.set('trust proxy', true) está configurado
      if (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') {
        return req.ip;
      }
      
      // 4. Fallback a remoteAddress (último recurso)
      const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
      if (remoteAddress) {
        return remoteAddress;
      }
      
      // 5. Si todo falla, usar 'unknown' (no ideal, pero evita errores)
      return 'unknown';
    };
    
    const clientIP = getClientIP(req);
    const now = Date.now();
    
    // Obtener registro del cliente
    let record = requestStore.get(clientIP);
    
    // Si no existe registro o ha expirado, crear uno nuevo
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs
      };
      requestStore.set(clientIP, record);
    }
    
    // Incrementar contador
    record.count++;
    
    // Verificar si excede el límite
    if (record.count > config.maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          message: config.message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        }
      });
      return;
    }
    
    // Agregar headers informativos
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });
    
    next();
  };
};

// Rate limiters específicos
export const authRateLimit = createRateLimiter('auth');
export const generalRateLimit = createRateLimiter('general');
export const strictRateLimit = createRateLimiter('strict');

// Limpiar registros expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Función para obtener estadísticas de rate limiting
export const getRateLimitStats = () => {
  const now = Date.now();
  const activeIPs = Array.from(requestStore.entries())
    .filter(([_, record]) => now <= record.resetTime)
    .map(([ip, record]) => ({
      ip,
      requests: record.count,
      resetTime: new Date(record.resetTime).toISOString()
    }));
  
  return {
    totalActiveIPs: activeIPs.length,
    activeIPs: activeIPs.slice(0, 10), // Solo mostrar primeras 10
    configs: rateLimitConfigs
  };
};

// Función para limpiar todos los rate limits (útil para desarrollo)
export const clearAllRateLimits = () => {
  requestStore.clear();
  console.log('✅ Todos los rate limits han sido limpiados');
};

// Función para limpiar rate limit de una IP específica
export const clearRateLimitForIP = (ip: string) => {
  const deleted = requestStore.delete(ip);
  console.log(deleted ? `✅ Rate limit limpiado para IP: ${ip}` : `❌ No se encontró rate limit para IP: ${ip}`);
  return deleted;
};