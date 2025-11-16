'use client'

// Componente Header con logo y botones de autenticación
// Este componente se muestra fijo en la parte superior de todas las páginas
// Cambia según el estado de autenticación del usuario

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { authController } from '@/controllers/auth.controller'
import { notificacionesService } from '@/services/notificaciones.service'
import { chatService } from '@/services/chat.service'
import { getSolicitudesRecibidas } from '@/lib/amigos'
import type { Notificacion } from '@/models/notificaciones'
import type { Chat } from '@/models/chat'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMessagesMenuOpen, setIsMessagesMenuOpen] = useState(false)
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [chatsConMensajesNoLeidos, setChatsConMensajesNoLeidos] = useState<Chat[]>([])
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false)
  const [loadingMensajes, setLoadingMensajes] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const messagesMenuRef = useRef<HTMLDivElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)

  // Función para actualizar el estado de autenticación
  const updateAuthState = () => {
    setIsAuthenticated(getAuth())
  }

  // Verificar estado de autenticación al cargar y cuando cambia la ruta
  useEffect(() => {
    updateAuthState()
  }, [pathname])

  // Cargar notificaciones y mensajes cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      cargarNotificaciones()
      cargarMensajesNoLeidos()
      
      // Recargar cada 30 segundos para mantener actualizado
      const interval = setInterval(() => {
        cargarNotificaciones()
        cargarMensajesNoLeidos()
      }, 30000)
      
      return () => clearInterval(interval)
    } else {
      // Limpiar cuando no está autenticado
      setNotificaciones([])
      setChatsConMensajesNoLeidos([])
    }
  }, [isAuthenticated, pathname])

  // Función para cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoadingNotificaciones(true)
      
      // Verificar solicitudes de amistad nuevas y crear notificaciones
      try {
        const solicitudes = await getSolicitudesRecibidas()
        const todasLasNotificaciones = await notificacionesService.getNotificaciones()
        
        // Crear notificaciones para solicitudes que no tienen una notificación asociada
        for (const solicitud of solicitudes) {
          // Verificar si ya existe una notificación para esta solicitud
          const existeNotificacion = todasLasNotificaciones.some(
            notif => notif.titulo === 'Nueva solicitud de amistad' && 
                     notif.mensaje?.includes(solicitud.solicitante.nombre)
          )
          
          if (!existeNotificacion) {
            try {
              await notificacionesService.createNotificacion({
                tipo: 'info',
                titulo: 'Nueva solicitud de amistad',
                mensaje: `${solicitud.solicitante.nombre} quiere ser tu amigo`,
                leida: false,
              })
              console.log('✅ Notificación creada para solicitud:', solicitud._id)
            } catch (error) {
              console.error('Error al crear notificación de solicitud:', error)
            }
          }
        }
      } catch (error) {
        console.warn('Error al verificar solicitudes de amistad:', error)
        // No fallar si esto falla
      }
      
      // Cargar todas las notificaciones
      const data = await notificacionesService.getNotificaciones({ leida: false })
      
      // Filtrar notificaciones: excluir las de mensajes de chat
      // Solo mostrar: bienvenida, recordatorios, solicitudes de amistad
      const notificacionesFiltradas = data.filter(notif => {
        // Excluir notificaciones de mensajes de chat
        return !(notif.titulo === 'Nuevo mensaje' && notif.mensaje?.includes('te ha enviado un mensaje'))
      })
      
      // Ordenar por fecha descendente (más recientes primero) y tomar solo las 5 más recientes
      const notificacionesOrdenadas = notificacionesFiltradas
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      setNotificaciones(notificacionesOrdenadas)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoadingNotificaciones(false)
    }
  }

  // Función para cargar chats con mensajes no leídos
  const cargarMensajesNoLeidos = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoadingMensajes(true)
      // Obtener todos los chats desde el backend
      const chats = await chatService.getChatsList()
      
      console.log('📬 Chats cargados:', chats.length)
      
      // Filtrar solo los chats que tienen mensajes no leídos
      const chatsConNoLeidos = chats.filter(chat => chat.noLeidos > 0)
      
      console.log('💬 Chats con mensajes no leídos:', chatsConNoLeidos.length)
      
      // NO crear notificaciones para mensajes de chat - solo se muestran en el icono de mensajes
      
      // Ordenar por fecha del último mensaje descendente y tomar solo los 5 más recientes
      const chatsOrdenados = chatsConNoLeidos
        .filter(chat => chat.ultimoMensaje !== null)
        .sort((a, b) => {
          if (!a.ultimoMensaje || !b.ultimoMensaje) return 0
          return new Date(b.ultimoMensaje.fecha).getTime() - new Date(a.ultimoMensaje.fecha).getTime()
        })
        .slice(0, 5)
      
      console.log('📋 Chats ordenados para mostrar:', chatsOrdenados.length)
      setChatsConMensajesNoLeidos(chatsOrdenados)
    } catch (error) {
      console.error('❌ Error al cargar chats con mensajes no leídos:', error)
      // En caso de error, limpiar el estado
      setChatsConMensajesNoLeidos([])
    } finally {
      setLoadingMensajes(false)
    }
  }

  // Escuchar eventos personalizados de cambio de autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      updateAuthState()
    }

    // Escuchar evento personalizado 'authChange'
    window.addEventListener('authChange', handleAuthChange)
    
    // Escuchar cambios en localStorage (para otras pestañas)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Cerrar menús cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (messagesMenuRef.current && !messagesMenuRef.current.contains(event.target as Node)) {
        setIsMessagesMenuOpen(false)
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsMenuOpen(false)
      }
    }

    if (isProfileMenuOpen || isMessagesMenuOpen || isNotificationsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileMenuOpen, isMessagesMenuOpen, isNotificationsMenuOpen])

  // Función para cerrar sesión
  const handleLogout = async () => {
    await authController.logout()
    setIsAuthenticated(false)
    setIsProfileMenuOpen(false)
    router.push('/')
  }

  // Función para toggle del menú de perfil
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
    setIsMessagesMenuOpen(false)
    setIsNotificationsMenuOpen(false)
  }

  // Función para toggle del menú de mensajes
  const toggleMessagesMenu = () => {
    setIsMessagesMenuOpen(!isMessagesMenuOpen)
    setIsProfileMenuOpen(false)
    setIsNotificationsMenuOpen(false)
  }

  // Función para toggle del menú de notificaciones
  const toggleNotificationsMenu = () => {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen)
    setIsProfileMenuOpen(false)
    setIsMessagesMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo en la parte izquierda con enlace a home o dashboard según autenticación */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="logo">
          <span className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
          <span className="logo-text">Gestor Finanzas</span>
        </Link>

        {/* Navegación - cambia según el estado de autenticación */}
        <nav className="header-nav">
          {isAuthenticated ? (
            // Si está autenticado: mostrar iconos de mensajes, notificaciones, perfil y logout
            <div className="header-user">
              {/* Icono de mensajes con menú desplegable */}
              <div className="header-menu-container" ref={messagesMenuRef}>
                <button 
                  onClick={toggleMessagesMenu}
                  className="header-icon-btn"
                  title="Mensajes"
                  aria-label="Mensajes"
                  style={{ position: 'relative' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {chatsConMensajesNoLeidos.length > 0 && (
                    <span className="header-badge">
                      {chatsConMensajesNoLeidos.reduce((total, chat) => total + chat.noLeidos, 0)}
                    </span>
                  )}
                </button>
                
                {/* Menú desplegable de mensajes */}
                {isMessagesMenuOpen && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-header">
                      <h3 className="header-dropdown-title">Mensajes</h3>
                      <Link 
                        href="/dashboard/mensajes" 
                        className="header-dropdown-link"
                        onClick={() => setIsMessagesMenuOpen(false)}
                      >
                        Ver todos
                      </Link>
                    </div>
                    <div className="header-dropdown-content">
                      {loadingMensajes ? (
                        <div className="header-dropdown-empty">
                          <p>Cargando mensajes...</p>
                        </div>
                      ) : chatsConMensajesNoLeidos.length === 0 ? (
                        <div className="header-dropdown-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          <p>No hay mensajes nuevos</p>
                        </div>
                      ) : (
                        <div className="header-dropdown-list">
                          {chatsConMensajesNoLeidos.map((chat) => (
                            <Link
                              key={chat.amigoId}
                              href={`/dashboard/chat/${chat.amigoId}`}
                              className="header-dropdown-item header-dropdown-item-mensaje"
                              onClick={async () => {
                                // Marcar mensajes del chat como leídos al hacer clic
                                try {
                                  await chatService.markChatAsLeido(chat.amigoId)
                                  // Recargar chats después de marcar como leídos
                                  cargarMensajesNoLeidos()
                                } catch (error) {
                                  console.error('Error al marcar chat como leído:', error)
                                }
                                setIsMessagesMenuOpen(false)
                              }}
                            >
                              <div className="header-dropdown-item-content">
                                <div className="header-dropdown-item-header">
                                  <span className="header-dropdown-item-title header-dropdown-item-title-mensaje">
                                    {chat.amigoNombre}
                                    {chat.noLeidos > 1 && (
                                      <span className="header-dropdown-item-badge-count"> ({chat.noLeidos})</span>
                                    )}
                                  </span>
                                  <span className="header-dropdown-item-time">
                                    {chat.ultimoMensaje && new Date(chat.ultimoMensaje.fecha).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {chat.ultimoMensaje && (
                                  <>
                                    <p className="header-dropdown-item-text">
                                      {chat.ultimoMensaje.contenido.length > 60 
                                        ? chat.ultimoMensaje.contenido.substring(0, 60) + '...' 
                                        : chat.ultimoMensaje.contenido}
                                    </p>
                                  </>
                                )}
                              </div>
                              {/* Indicador de no leído */}
                              <div className="header-dropdown-item-unread header-dropdown-item-unread-mensaje"></div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Icono de notificaciones con menú desplegable */}
              <div className="header-menu-container" ref={notificationsMenuRef}>
                <button 
                  onClick={toggleNotificationsMenu}
                  className="header-icon-btn"
                  title="Notificaciones"
                  aria-label="Notificaciones"
                  style={{ position: 'relative' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {notificaciones.length > 0 && (
                    <span className="header-badge">{notificaciones.length}</span>
                  )}
                </button>
                
                {/* Menú desplegable de notificaciones */}
                {isNotificationsMenuOpen && (
                  <div className="header-dropdown">
                    <div className="header-dropdown-header">
                      <h3 className="header-dropdown-title">Notificaciones</h3>
                      <Link 
                        href="/dashboard/notificaciones" 
                        className="header-dropdown-link"
                        onClick={() => setIsNotificationsMenuOpen(false)}
                      >
                        Ver todas
                      </Link>
                    </div>
                    <div className="header-dropdown-content">
                      {loadingNotificaciones ? (
                        <div className="header-dropdown-empty">
                          <p>Cargando notificaciones...</p>
                        </div>
                      ) : notificaciones.length === 0 ? (
                        <div className="header-dropdown-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                          <p>No hay notificaciones nuevas</p>
                        </div>
                      ) : (
                        <div className="header-dropdown-list">
                          {notificaciones.map((notificacion) => (
                            <div
                              key={notificacion._id}
                              className={`header-dropdown-item header-dropdown-item-${notificacion.tipo}`}
                              onClick={async () => {
                                if (!notificacion.leida) {
                                  try {
                                    await notificacionesService.markAsLeida(notificacion._id)
                                    cargarNotificaciones() // Recargar después de marcar como leída
                                  } catch (error) {
                                    console.error('Error al marcar notificación como leída:', error)
                                  }
                                }
                                setIsNotificationsMenuOpen(false)
                                
                                // Redirigir según el tipo de notificación
                                if (notificacion.titulo === 'Nueva solicitud de amistad') {
                                  router.push('/dashboard/amigos?tab=solicitudes')
                                } else {
                                  router.push('/dashboard/notificaciones')
                                }
                              }}
                            >
                              <div className="header-dropdown-item-content">
                                <div className="header-dropdown-item-header">
                                  <span className={`header-dropdown-item-title header-dropdown-item-title-${notificacion.tipo}`}>
                                    {notificacion.titulo}
                                  </span>
                                  <span className="header-dropdown-item-time">
                                    {new Date(notificacion.createdAt).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="header-dropdown-item-text">{notificacion.mensaje}</p>
                              </div>
                              {!notificacion.leida && (
                                <div className="header-dropdown-item-unread"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Icono de perfil con menú desplegable */}
              <div className="profile-menu-container" ref={menuRef}>
                <button 
                  onClick={toggleProfileMenu}
                  className="header-icon-btn"
                  title="Perfil"
                  aria-label="Perfil"
                >
                  <svg className="profile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                
                {/* Menú desplegable */}
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <Link 
                      href="/dashboard/perfil" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Perfil</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/opciones" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                      </svg>
                      <span>Opciones</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/amigos" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>Amigos</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/notificaciones" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <span>Notificaciones</span>
                    </Link>
                    
                    <Link 
                      href="/dashboard/mensajes" 
                      className="profile-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span>Mensajes</span>
                    </Link>
                    
                    <div className="profile-menu-divider"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="profile-menu-item profile-menu-item-danger"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Icono de cerrar sesión */}
              <button 
                onClick={handleLogout} 
                className="header-icon-btn"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            // Si no está autenticado: mostrar botones de login y registro
            <>
              <Link href="/login" className="btn-nav btn-login">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-nav btn-signup">
                Crear Cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
