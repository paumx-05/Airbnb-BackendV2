'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ResetPasswordDebugger from '@/components/auth/ResetPasswordDebugger';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Reset Password Page - Página de restablecimiento de contraseña
 * URL: /reset-password/[token]
 * Features: Validación de token, formulario seguro, redirección automática
 */
export default function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Extraer y validar token de la URL
  useEffect(() => {
    const urlToken = params.token as string;
    
    if (!urlToken) {
      setTokenError('Token de recuperación no encontrado');
      setIsValidating(false);
      return;
    }

    // Validar formato básico del token
    if (!urlToken.startsWith('reset_')) {
      setTokenError('Token de recuperación inválido');
      setIsValidating(false);
      return;
    }

    setToken(urlToken);
    setIsValidating(false);
  }, [params.token]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSuccess = () => {
    router.push('/login');
  };

  const handleBackToForgotPassword = () => {
    router.push('/forgot-password');
  };

  // No mostrar nada si ya está autenticado (evita flash)
  if (isAuthenticated) {
    return null;
  }

  // Mostrar loading mientras valida token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C] mx-auto mb-4"></div>
          <p className="text-slate-400">Validando token...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si token es inválido
  if (tokenError || !token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Header con Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <svg 
                  width="102" 
                  height="32" 
                  fill="#FF385C" 
                  viewBox="0 0 102 32"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
                </svg>
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Token Inválido
            </h1>
            <p className="text-slate-400">
              El enlace de recuperación no es válido
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-slate-800 border border-red-500/20 rounded-lg p-8 shadow-xl">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Enlace Expirado o Inválido
              </h2>
              <p className="text-slate-400 mb-6">
                {tokenError}
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Los enlaces de recuperación expiran después de 24 horas por seguridad.
              </p>
              
              <div className="space-y-3">
                <Link 
                  href="/forgot-password"
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white px-4 py-2 rounded-md inline-block text-center transition-colors duration-200"
                >
                  Solicitar nuevo enlace
                </Link>
                
                <Link 
                  href="/login"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md inline-block text-center transition-colors duration-200"
                >
                  Volver al login
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar formulario si token es válido
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header con Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <svg 
                width="102" 
                height="32" 
                fill="#FF385C" 
                viewBox="0 0 102 32"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
              </svg>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-slate-400">
            Crea una nueva contraseña segura
          </p>
        </div>

        {/* Reset Password Debugger */}
        <div className="mb-6">
          <ResetPasswordDebugger token={token} />
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <ResetPasswordForm 
            token={token}
            onSuccess={handleSuccess}
            onBackToForgotPassword={handleBackToForgotPassword}
          />
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
