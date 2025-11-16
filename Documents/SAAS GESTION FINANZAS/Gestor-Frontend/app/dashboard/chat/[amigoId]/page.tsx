'use client'

// Página de Chat con un Amigo
// Permite enviar y recibir mensajes con un amigo específico
// Integración completa con backend MongoDB

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getAuth, getUsuarioActual } from '@/lib/auth'
import { getToken, decodeToken } from '@/utils/jwt'
import { chatService } from '@/services/chat.service'
import type { MensajeChat } from '@/models/chat'
import type { ChatError } from '@/models/chat'

interface Amigo {
  id: string // ID del registro de amistad
  userId: string // ID del usuario actual
  amigoUserId: string // ID del usuario amigo
  nombre: string
  email: string
  avatar?: string
  fechaAmistad?: string // Solo para amigos activos
  estado: 'activo' | 'pendiente' | 'rechazada' | 'bloqueado'
  solicitadoPor?: string
}

// Función para obtener amigo desde el backend
// El amigoId en la URL es el _id del registro de amistad
async function getAmigo(amigoId: string): Promise<Amigo | null> {
  try {
    const { getAmigos } = await import('@/lib/amigos')
    const amigos = await getAmigos()
    
    console.log('🔍 Buscando amigo:', {
      amigoIdBuscado: amigoId,
      totalAmigos: amigos.length,
      amigos: amigos.map(a => ({ id: a.id, userId: a.userId, nombre: a.nombre, email: a.email })),
    })
    
    // Buscar por id del registro de amistad (el backend espera este ID)
    const amigo = amigos.find(a => a.id === amigoId)
    
    if (amigo) {
      console.log('✅ Amigo encontrado:', {
        id: amigo.id,
        userId: amigo.userId,
        amigoUserId: amigo.amigoUserId,
        nombre: amigo.nombre,
        email: amigo.email,
        estado: amigo.estado,
      })
      return {
        id: amigo.id,
        userId: amigo.userId,
        amigoUserId: amigo.amigoUserId,
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        fechaAmistad: amigo.fechaAmistad,
        estado: amigo.estado,
        solicitadoPor: amigo.solicitadoPor,
      }
    }
    
    console.warn('⚠️ Amigo no encontrado con id:', amigoId)
    return null
  } catch (error) {
    console.error('Error al obtener amigo:', error)
    return null
  }
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const amigoId = params?.amigoId as string
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [amigo, setAmigo] = useState<Amigo | null>(null)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMensajes, setLoadingMensajes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [previousMensajesCount, setPreviousMensajesCount] = useState(0)

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const loadAmigo = async () => {
      const isAuthenticated = getAuth()
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (amigoId) {
        const usuarioActual = getUsuarioActual()
        if (usuarioActual) {
          const amigoData = await getAmigo(amigoId)
          if (!amigoData) {
            // Si no se encuentra el amigo, redirigir a mensajes
            router.push('/dashboard/mensajes')
            return
          }
          
          // Validar que el amigo esté activo (amistad mutua requerida para chatear)
          if (amigoData.estado !== 'activo') {
            console.warn('⚠️ Intento de chatear con amigo no activo:', {
              amigoId: amigoData.id,
              estado: amigoData.estado,
            })
            alert('Solo puedes chatear con amigos activos. La amistad debe ser mutua.')
            router.push('/dashboard/mensajes')
            return
          }
          
          setAmigo(amigoData)
        }
      }
    }

    loadAmigo()
  }, [amigoId, router])

  // Cargar mensajes cuando el amigo esté disponible
  useEffect(() => {
    if (amigo && amigoId) {
      // Prevenir scroll de la página al cargar
      window.scrollTo(0, 0)
      loadMensajes()
      // Marcar mensajes como leídos al abrir el chat
      markAsLeido()
    }
  }, [amigo, amigoId])
  
  // Asegurar que la página esté en la parte superior al montar y cuando cambia el amigo
  useEffect(() => {
    // Forzar scroll de la página a la parte superior
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // También asegurar después de un pequeño delay por si acaso
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [amigoId])

  // Scroll automático al final solo cuando hay nuevos mensajes (no en carga inicial)
  useEffect(() => {
    // Si es la carga inicial, no hacer scroll - solo actualizar el estado
    if (isInitialLoad) {
      setIsInitialLoad(false)
      setPreviousMensajesCount(mensajes.length)
      return
    }
    
    // Solo hacer scroll si hay nuevos mensajes (más mensajes que antes)
    // Y solo si el contenedor está disponible
    if (mensajes.length > previousMensajesCount && messagesContainerRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        scrollToBottom()
      }, 50)
      setPreviousMensajesCount(mensajes.length)
    }
  }, [mensajes, isInitialLoad, previousMensajesCount])

  // Polling para recibir nuevos mensajes (cada 3 segundos)
  useEffect(() => {
    if (!amigo || !amigoId) return

    const intervalId = setInterval(() => {
      loadMensajes(true) // Cargar en modo silencioso para no mostrar loading cada vez
    }, 3000) // Verificar cada 3 segundos

    return () => {
      clearInterval(intervalId)
    }
  }, [amigo, amigoId])

  const scrollToBottom = () => {
    // Hacer scroll solo en el contenedor de mensajes, no en toda la página
    if (messagesContainerRef.current) {
      // Asegurar que la página no haga scroll
      window.scrollTo(0, 0)
      // Hacer scroll solo en el contenedor
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Función para cargar mensajes del chat desde el backend
  const loadMensajes = async (silent = false) => {
    if (!amigo) return

    try {
      if (!silent) setLoadingMensajes(true)
      setError(null)
      
      // El backend espera el _id del registro de amistad, no el userId
      const usuarioActual = getUsuarioActual()
      console.log('📥 Cargando mensajes:', {
        amigoId: amigo.id,
        userId: amigo.userId,
        amigoNombre: amigo.nombre,
        usuarioActualId: usuarioActual?.id,
        usuarioActualEmail: usuarioActual?.email,
      })
      
      const mensajesData = await chatService.getMensajesByAmigo(amigo.id)
      
      console.log('📨 Mensajes recibidos del backend:', {
        cantidad: mensajesData.length,
        mensajes: mensajesData.map(m => ({
          id: m._id,
          remitenteId: m.remitenteId,
          destinatarioId: m.destinatarioId,
          contenido: m.contenido.substring(0, 30) + '...',
          createdAt: m.createdAt,
        })),
      })
      
      // Ordenar por fecha (más antiguos primero)
      mensajesData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      
      // Si es la carga inicial, centrar el scroll en el medio del contenedor
      const isFirstLoad = mensajes.length === 0 && !silent
      const hadPreviousMensajes = mensajes.length > 0
      const previousCount = mensajes.length
      
      setMensajes(mensajesData)
      
      // Actualizar el contador para el useEffect que detecta nuevos mensajes
      if (!isFirstLoad && hadPreviousMensajes) {
        setPreviousMensajesCount(previousCount)
      }
      
      // Si es la primera carga, centrar el scroll después de que se rendericen los mensajes
      if (isFirstLoad && mensajesData.length > 0) {
        // Asegurar que la página esté en la parte superior
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        
        // Usar requestAnimationFrame para asegurar que el DOM esté completamente renderizado
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              // Asegurar nuevamente que la página no haya hecho scroll
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
              
              // Calcular la posición para centrar: scrollHeight / 2 - altura visible / 2
              const scrollHeight = messagesContainerRef.current.scrollHeight
              const clientHeight = messagesContainerRef.current.clientHeight
              
              // Si hay pocos mensajes, mostrar desde el inicio
              // Si hay muchos mensajes, centrar en el medio
              if (scrollHeight <= clientHeight * 2) {
                // Pocos mensajes: mostrar desde el inicio
                messagesContainerRef.current.scrollTop = 0
              } else {
                // Muchos mensajes: centrar en el medio
                const scrollPosition = Math.max(0, (scrollHeight - clientHeight) / 2)
                messagesContainerRef.current.scrollTop = scrollPosition
              }
              
              // Verificar una vez más que la página no haya hecho scroll
              setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
              }, 50)
            }
          }, 200)
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar mensajes'
      setError(errorMessage)
      console.error('Error al cargar mensajes:', err)
    } finally {
      setLoadingMensajes(false)
    }
  }

  // Función para marcar mensajes como leídos
  const markAsLeido = async () => {
    if (!amigo) return

    try {
      // El backend espera el _id del registro de amistad
      await chatService.markChatAsLeido(amigo.id)
    } catch (err) {
      console.error('Error al marcar mensajes como leídos:', err)
      // No mostrar error al usuario, es una operación silenciosa
    }
  }

  // Función para enviar mensaje
  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !amigo) return

    const usuarioActual = getUsuarioActual()
    if (!usuarioActual) {
      console.error('❌ Usuario actual no encontrado')
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // El backend espera el _id del registro de amistad para identificar la relación
      // Internamente el backend usa el userId del amigo para crear el mensaje
      console.log('📤 Enviando mensaje:', {
        amigoId: amigo.id, // _id del registro de amistad
        userId: amigo.userId, // ID del usuario amigo (destinatario)
        amigoNombre: amigo.nombre,
        amigoEmail: amigo.email,
        remitenteId: usuarioActual.id, // ID del usuario actual (remitente)
        remitenteEmail: usuarioActual.email,
        contenido: nuevoMensaje.trim().substring(0, 50) + '...',
      })
      
      const mensajeEnviado = await chatService.sendMensaje(amigo.id, {
        contenido: nuevoMensaje.trim(),
        esSistema: false,
      })

      console.log('✅ Mensaje enviado exitosamente:', {
        mensajeId: mensajeEnviado._id,
        remitenteId: mensajeEnviado.remitenteId,
        destinatarioId: mensajeEnviado.destinatarioId,
        amigoId: mensajeEnviado.amigoId,
      })

      // Agregar el mensaje a la lista localmente (optimistic update)
      setMensajes(prev => {
        const nuevosMensajes = [...prev, mensajeEnviado]
        // Actualizar el contador para que el useEffect detecte el nuevo mensaje
        setPreviousMensajesCount(nuevosMensajes.length - 1)
        return nuevosMensajes
      })
      setNuevoMensaje('')
      
      // Scroll al final después de enviar mensaje
      // Actualizar el contador para que el useEffect no interfiera
      setTimeout(() => {
        setPreviousMensajesCount(mensajes.length)
        scrollToBottom()
      }, 100)
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al enviar mensaje'
      setError(errorMessage)
      
      console.error('❌ Error al enviar mensaje:', {
        error: err,
        errorMessage: errorMessage,
        errorStatus: err?.status,
        amigoId: amigo.id, // _id del registro de amistad
        userId: amigo.userId, // ID del usuario amigo (destinatario)
        amigoNombre: amigo.nombre,
        amigoEmail: amigo.email,
        remitenteId: usuarioActual?.id,
        remitenteEmail: usuarioActual?.email,
      })
      
      // Si el error es que el usuario destinatario no existe, mostrar mensaje más claro
      if (errorMessage.includes('destinatario no existe') || errorMessage.includes('usuario no existe')) {
        setError(`Error: El usuario ${amigo.nombre} (${amigo.email}) no existe en el sistema. Verifica que el amigo esté correctamente registrado.`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    const ahora = new Date()
    const esHoy = fecha.toDateString() === ahora.toDateString()
    
    if (esHoy) {
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!amigo) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-loading">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header del chat */}
        <div className="chat-header">
          <Link href="/dashboard/mensajes" className="chat-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="chat-header-info">
            <div className="chat-avatar">
              {amigo.avatar ? (
                <img src={amigo.avatar} alt={amigo.nombre} className="chat-avatar-image" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {getInitials(amigo.nombre)}
                </div>
              )}
            </div>
            <div>
              <h1 className="chat-title">{amigo.nombre}</h1>
              <p className="chat-subtitle">{amigo.email}</p>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="chat-error-banner">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)} className="btn-close">×</button>
          </div>
        )}

        {/* Área de mensajes */}
        <div className="chat-messages-container" ref={messagesContainerRef}>
          {loadingMensajes && mensajes.length === 0 ? (
            <div className="chat-loading">
              <p>Cargando mensajes...</p>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="chat-empty">
              <p>No hay mensajes aún. ¡Comienza la conversación!</p>
            </div>
          ) : (
            <div className="chat-messages">
              {mensajes.map((mensaje) => {
                const usuarioActual = getUsuarioActual()
                
                // Obtener el userId del token JWT (es el ID real del usuario en MongoDB)
                const token = getToken()
                const decodedToken = token ? decodeToken(token) : null
                const userIdFromToken = decodedToken?.userId || usuarioActual?.id || ''
                
                // Determinar si el mensaje es del usuario actual o del amigo
                // El remitenteId es el ID del usuario que envió el mensaje (del backend/MongoDB)
                // Usamos el userId del token JWT para comparar, ya que es el ID real en MongoDB
                const remitenteIdStr = mensaje.remitenteId?.toString() || ''
                const usuarioActualIdStr = userIdFromToken?.toString() || ''
                
                // Comparación directa de IDs
                const esMio = remitenteIdStr === usuarioActualIdStr
                
                // Log de depuración para verificar la comparación (solo en desarrollo y solo los primeros mensajes)
                if (process.env.NODE_ENV === 'development' && mensajes.indexOf(mensaje) < 3) {
                  console.log('🔍 Comparando mensaje:', {
                    mensajeId: mensaje._id,
                    remitenteId: remitenteIdStr,
                    usuarioActualId: usuarioActualIdStr,
                    userIdFromToken: userIdFromToken,
                    usuarioActualEmail: usuarioActual?.email,
                    esMio: esMio,
                    contenido: mensaje.contenido.substring(0, 30) + '...',
                    igualdad: remitenteIdStr === usuarioActualIdStr,
                  })
                }
                
                const esSistema = mensaje.esSistema === true
                const esDelAmigo = !esMio && !esSistema
                
                // Los mensajes se muestran a la derecha solo si fueron enviados por el usuario actual
                const mostrarDerecha = esMio
                
                return (
                  <div
                    key={mensaje._id}
                    className={`chat-message ${mostrarDerecha ? 'chat-message-mio' : ''} ${esSistema && mostrarDerecha ? 'chat-message-sistema' : ''}`}
                  >
                    <div className="chat-message-content">
                      {esDelAmigo && (
                        <div className="chat-message-remitente">{amigo?.nombre || 'Amigo'}</div>
                      )}
                      <div className="chat-message-text">{mensaje.contenido}</div>
                      <div className="chat-message-fecha">{formatFecha(mensaje.createdAt)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Formulario para enviar mensaje */}
        <form className="chat-form" onSubmit={enviarMensaje}>
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!nuevoMensaje.trim() || loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
