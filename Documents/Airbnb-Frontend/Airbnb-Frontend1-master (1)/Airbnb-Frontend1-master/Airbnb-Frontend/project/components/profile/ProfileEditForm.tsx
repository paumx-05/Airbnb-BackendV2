'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Types for component props and form data
interface ProfileEditFormProps {
  className?: string;
}

interface ProfileFormData {
  name: string;
}

interface AvatarUpdateEvent {
  detail: {
    url: string;
  };
}

export default function ProfileEditForm({ className }: ProfileEditFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name ?? ''
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  // Handle profile save with early returns
  const handleSave = (): void => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      const raw = localStorage.getItem('airbnb_auth_token');
      if (!raw) {
        return;
      }
      
      // In a real app, call API and update context
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  // Handle file change with early returns
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUploadError('');
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Archivo no válido. Selecciona una imagen.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setPreview(result);
        }
      };
      reader.onerror = () => {
        setUploadError('No se pudo leer la imagen.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Error al procesar la imagen.');
      console.error('File reading error:', error);
    }
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  // Apply uploaded avatar with early returns
  const handleApplyUploadedAvatar = (): void => {
    if (!preview) {
      return;
    }

    try {
      localStorage.setItem('profile_avatar_override', preview);
      const customEvent = new CustomEvent('profile:avatarUpdated', { 
        detail: { url: preview } 
      });
      window.dispatchEvent(customEvent);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setPreview(null); // Clear preview after applying
    } catch (error) {
      setUploadError('No se pudo guardar el avatar.');
      console.error('Avatar save error:', error);
    }
  };

  // Clear preview
  const handleClearPreview = (): void => {
    setPreview(null);
    setUploadError('');
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-white">Información Personal</CardTitle>
        <CardDescription className="text-slate-400">Actualiza tu nombre y revisa tu correo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label 
            htmlFor="profile-name" 
            className="block text-sm text-slate-300 mb-1"
          >
            Nombre
          </label>
          <Input 
            id="profile-name"
            value={formData.name} 
            onChange={handleNameChange} 
            className="bg-slate-700 border-slate-600 text-white"
            aria-label="Nombre de usuario"
            tabIndex={0}
            required
          />
        </div>
        <div>
          <label 
            htmlFor="profile-email" 
            className="block text-sm text-slate-300 mb-1"
          >
            Email
          </label>
          <Input 
            id="profile-email"
            value={user?.email ?? ''} 
            readOnly 
            className="bg-slate-700 border-slate-600 text-white opacity-70"
            aria-label="Email de usuario (solo lectura)"
            tabIndex={-1}
          />
        </div>
        <div>
          <label 
            htmlFor="profile-avatar-upload" 
            className="block text-sm text-slate-300 mb-1"
          >
            Subir nueva foto
          </label>
          <input 
            id="profile-avatar-upload"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF385C] file:text-white hover:file:bg-[#E31C5F]"
            aria-label="Seleccionar imagen de avatar"
            tabIndex={0}
          />
          {preview && (
            <div className="mt-3">
              <img 
                src={preview} 
                alt="Vista previa del avatar" 
                className="h-24 w-24 rounded-full object-cover border border-slate-600"
              />
              <div className="mt-2 flex gap-2">
                <Button 
                  onClick={handleApplyUploadedAvatar} 
                  className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                  aria-label="Aplicar esta imagen como avatar"
                  tabIndex={0}
                >
                  Usar esta imagen
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700" 
                  onClick={handleClearPreview}
                  aria-label="Cancelar y eliminar vista previa"
                  tabIndex={0}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {uploadError && (
            <div className="text-sm text-red-400 mt-2" role="alert">
              {uploadError}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          aria-label="Guardar cambios del perfil"
          tabIndex={0}
        >
          Guardar cambios
        </Button>
        {isSaved && (
          <div className="text-sm text-green-400" role="status">
            Cambios guardados exitosamente
          </div>
        )}
      </CardContent>
    </Card>
  );
}


