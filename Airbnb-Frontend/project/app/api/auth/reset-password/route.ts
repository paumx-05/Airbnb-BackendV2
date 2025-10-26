import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/auth/reset-password
 * Maneja la redirección a la página de reset password con el token
 * 
 * GET /api/auth/reset-password?token=reset_xxx
 * Redirige a: /reset-password/[token]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validar que existe el token
    if (!token) {
      return NextResponse.redirect(new URL('/forgot-password?error=no-token', request.url));
    }

    // Validar formato básico del token
    if (!token.startsWith('reset_')) {
      return NextResponse.redirect(new URL('/forgot-password?error=invalid-token', request.url));
    }

    // Redirigir a la página de reset password con el token
    const resetUrl = new URL(`/reset-password/${token}`, request.url);
    return NextResponse.redirect(resetUrl);

  } catch (error) {
    console.error('Error en /api/auth/reset-password:', error);
    return NextResponse.redirect(new URL('/forgot-password?error=server-error', request.url));
  }
}

/**
 * POST /api/auth/reset-password
 * Maneja el reset de contraseña (llamada desde el frontend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validar datos requeridos
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del token
    if (!token.startsWith('reset_')) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Llamar al backend real para actualizar la contraseña en la base de datos
    try {
      console.log('🔄 [ResetPassword] Llamando al backend real...');
      console.log('🔄 [ResetPassword] Token:', token);
      console.log('🔄 [ResetPassword] Nueva contraseña:', newPassword ? '***' : 'undefined');
      
      const backendResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      console.log('📥 [ResetPassword] Status del backend:', backendResponse.status);
      console.log('📥 [ResetPassword] Headers del backend:', Object.fromEntries(backendResponse.headers.entries()));

      const backendData = await backendResponse.json();
      console.log('📥 [ResetPassword] Respuesta del backend:', backendData);

      if (backendResponse.ok && backendData.success) {
        console.log('✅ [ResetPassword] Contraseña actualizada exitosamente en el backend');
        return NextResponse.json({
          success: true,
          message: 'Contraseña restablecida exitosamente en la base de datos'
        });
      } else {
        console.log('❌ [ResetPassword] Error del backend:', backendData);
        return NextResponse.json({
          success: false,
          message: backendData.message || 'Error al actualizar la contraseña en el backend'
        }, { status: 400 });
      }
    } catch (backendError) {
      console.error('💥 [ResetPassword] Error llamando al backend:', backendError);
      console.error('💥 [ResetPassword] Tipo de error:', typeof backendError);
      console.error('💥 [ResetPassword] Mensaje de error:', backendError instanceof Error ? backendError.message : 'Error desconocido');
      
      return NextResponse.json({
        success: false,
        message: `Error de conexión con el backend: ${backendError instanceof Error ? backendError.message : 'Error desconocido'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error en POST /api/auth/reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
