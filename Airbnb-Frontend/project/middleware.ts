import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para protección de rutas
 * Verifica si el usuario tiene token de autenticación para acceder a rutas protegidas
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/profile'];
  
  // Rutas de autenticación que no deben ser accesibles si ya está logueado
  const authRoutes = ['/login', '/register'];
  
  // Obtener token de las cookies
  const token = request.cookies.get('airbnb_auth_token')?.value;
  
  console.log('🔍 [Middleware] Verificando ruta:', pathname);
  console.log('🔍 [Middleware] Token encontrado:', token ? 'SÍ' : 'NO');
  
  // Si no hay token en cookies, verificar localStorage (para desarrollo)
  // En producción, el token debe estar en cookies
  if (!token && typeof window !== 'undefined') {
    const localToken = localStorage.getItem('airbnb_auth_token');
    if (localToken) {
      console.log('🔍 [Middleware] Token encontrado en localStorage');
    }
  }
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  console.log('🔍 [Middleware] Es ruta protegida:', isProtectedRoute);
  console.log('🔍 [Middleware] Es ruta de auth:', isAuthRoute);
  
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    console.log('❌ [Middleware] Redirigiendo a login - no hay token');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si es una ruta de auth y ya hay token, verificar si el token es válido
  if (isAuthRoute && token) {
    // En lugar de redirigir automáticamente, permitir acceso
    // El AuthContext se encargará de verificar si el token es válido
    console.log('🔍 [Middleware] Token encontrado en ruta de auth, permitiendo acceso para verificación');
    return NextResponse.next();
  }
  
  console.log('✅ [Middleware] Permitiendo acceso a:', pathname);
  return NextResponse.next();
}

// Configurar en qué rutas ejecutar el middleware
export const config = {
  matcher: [
    // Excluir archivos estáticos y API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


