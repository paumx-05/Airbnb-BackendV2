'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Types for component props and form data
interface ChangePasswordFormProps {
  className?: string;
}

interface PasswordFormData {
  current: string;
  next: string;
  confirm: string;
}

export default function ChangePasswordForm({ className }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    current: '',
    next: '',
    confirm: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Handle form submission with early returns
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const { current, next, confirm } = formData;

    if (!current.trim()) {
      setError('La contraseña actual es requerida');
      return;
    }

    if (next.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (next !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (current === next) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    // Mock success - in real app, call API here
    setSuccess(true);
    setFormData({ current: '', next: '', confirm: '' });
  };

  // Handle input changes
  const handleInputChange = (field: keyof PasswordFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-white">Cambiar contraseña</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu contraseña de forma segura</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="current-password" 
              className="block text-sm text-slate-300 mb-1"
            >
              Contraseña actual
            </label>
            <Input 
              id="current-password"
              type="password" 
              value={formData.current} 
              onChange={handleInputChange('current')} 
              className="bg-slate-700 border-slate-600 text-white"
              aria-label="Contraseña actual"
              tabIndex={0}
              required
            />
          </div>
          <div>
            <label 
              htmlFor="new-password" 
              className="block text-sm text-slate-300 mb-1"
            >
              Nueva contraseña
            </label>
            <Input 
              id="new-password"
              type="password" 
              value={formData.next} 
              onChange={handleInputChange('next')} 
              className="bg-slate-700 border-slate-600 text-white"
              aria-label="Nueva contraseña"
              tabIndex={0}
              minLength={6}
              required
            />
          </div>
          <div>
            <label 
              htmlFor="confirm-password" 
              className="block text-sm text-slate-300 mb-1"
            >
              Confirmar contraseña
            </label>
            <Input 
              id="confirm-password"
              type="password" 
              value={formData.confirm} 
              onChange={handleInputChange('confirm')} 
              className="bg-slate-700 border-slate-600 text-white"
              aria-label="Confirmar nueva contraseña"
              tabIndex={0}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-400" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-400" role="status">
              Contraseña actualizada exitosamente
            </div>
          )}
          <Button 
            type="submit" 
            className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            aria-label="Cambiar contraseña"
            tabIndex={0}
          >
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


