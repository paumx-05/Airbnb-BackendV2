'use client';

import { useState, useEffect } from 'react';

interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Simular carga de notificaciones
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar notificaciones de ejemplo
        const mockNotifications: AdminNotification[] = [
          {
            id: '1',
            type: 'warning',
            title: 'Alta actividad de usuarios',
            message: 'Se ha detectado un aumento del 25% en el registro de usuarios en las últimas 24 horas.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: false
          },
          {
            id: '2',
            type: 'info',
            title: 'Nueva propiedad agregada',
            message: 'Se ha agregado una nueva propiedad en Madrid con 4 habitaciones.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isRead: false
          },
          {
            id: '3',
            type: 'error',
            title: 'Error en el sistema de pagos',
            message: 'Se ha detectado un error en el procesamiento de pagos. Revisar logs del sistema.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            isRead: true
          },
          {
            id: '4',
            type: 'success',
            title: 'Reserva completada exitosamente',
            message: 'Se ha completado una reserva de €150 en Barcelona.',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            isRead: true
          },
          {
            id: '5',
            type: 'info',
            title: 'Actualización del sistema',
            message: 'El sistema se actualizará mañana a las 2:00 AM. Tiempo estimado: 30 minutos.',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            isRead: false
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Eliminar notificación
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Obtener ícono según el tipo
  const getIcon = (type: string): string => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  // Obtener color según el tipo
  const getColor = (type: string): string => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título y acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notificaciones no leídas` : 'Todas las notificaciones han sido leídas'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">No tienes notificaciones pendientes en este momento.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${getColor(notification.type)} ${
                !notification.isRead ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Ícono */}
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {getIcon(notification.type)}
                  </span>
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
                
                {/* Acciones */}
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Marcar como leída
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas de Notificaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {notifications.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {notifications.filter(n => n.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Advertencias</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {notifications.filter(n => n.type === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Errores</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {notifications.filter(n => n.type === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Éxitos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
