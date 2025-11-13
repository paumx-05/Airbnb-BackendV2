'use client'

// Página de Amigos
// Permite gestionar la lista de amigos del usuario
// Integración completa con API del backend

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth } from '@/lib/auth'
import { 
  getAmigos, 
  createAmigo, 
  deleteAmigo, 
  updateEstadoAmigo,
  searchAmigos,
  getAmigosByEstado,
  type Amigo 
} from '@/lib/amigos'

export default function AmigosPage() {
  const router = useRouter()
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'pendientes' | 'bloqueados'>('todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreAmigo, setNombreAmigo] = useState('')
  const [emailAmigo, setEmailAmigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAmigos, setLoadingAmigos] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticación y cargar amigos
  useEffect(() => {
    const isAuthenticated = getAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadAmigos()
  }, [router])

  // Cargar amigos desde el backend
  const loadAmigos = async () => {
    setLoadingAmigos(true)
    setError(null)
    
    try {
      const amigosData = await getAmigos()
      setAmigos(amigosData)
    } catch (err: any) {
      console.error('Error al cargar amigos:', err)
      setError(err.message || 'Error al cargar los amigos')
      setAmigos([])
    } finally {
      setLoadingAmigos(false)
    }
  }

  // Buscar y filtrar amigos cuando cambian los parámetros
  useEffect(() => {
    const cargarAmigos = async () => {
      try {
        setLoadingAmigos(true)
        let amigosData: Amigo[] = []
        
        // Si hay búsqueda, usar búsqueda del backend
        if (busqueda.trim()) {
          amigosData = await searchAmigos(busqueda)
        } 
        // Si hay filtro de estado (sin búsqueda), usar filtro del backend
        else if (filtro !== 'todos') {
          const estado = filtro === 'activos' ? 'activo' : filtro === 'pendientes' ? 'pendiente' : 'bloqueado'
          amigosData = await getAmigosByEstado(estado)
        }
        // Si no hay filtros, cargar todos
        else {
          amigosData = await getAmigos()
        }
        
        setAmigos(amigosData)
        setError(null)
      } catch (err: any) {
        console.error('Error al cargar amigos:', err)
        setError(err.message || 'Error al cargar los amigos')
        setAmigos([])
      } finally {
        setLoadingAmigos(false)
      }
    }
    
    // Debounce para búsqueda: esperar 300ms después de que el usuario deje de escribir
    if (busqueda.trim()) {
      const timeoutId = setTimeout(cargarAmigos, 300)
      return () => clearTimeout(timeoutId)
    } else {
      cargarAmigos()
    }
  }, [busqueda, filtro])

  // Filtrar amigos localmente (para cuando hay búsqueda y filtro simultáneos)
  const amigosFiltrados = amigos.filter(amigo => {
    // Filtro por estado
    if (filtro !== 'todos') {
      const estadoEsperado = filtro === 'activos' ? 'activo' : filtro === 'pendientes' ? 'pendiente' : 'bloqueado'
      if (amigo.estado !== estadoEsperado) {
        return false
      }
    }
    // Búsqueda por nombre o email (si hay búsqueda activa)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase()
      return (
        amigo.nombre.toLowerCase().includes(busquedaLower) ||
        amigo.email.toLowerCase().includes(busquedaLower)
      )
    }
    return true
  })

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Función para agregar amigo
  const agregarAmigo = async () => {
    if (!nombreAmigo.trim() || !emailAmigo.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const nuevoAmigo = await createAmigo({
        nombre: nombreAmigo.trim(),
        email: emailAmigo.trim(),
        estado: 'activo'
      })
      
      setAmigos([...amigos, nuevoAmigo])
      setNombreAmigo('')
      setEmailAmigo('')
      setMostrarFormulario(false)
    } catch (err: any) {
      console.error('Error al crear amigo:', err)
      alert(err.message || 'Error al agregar el amigo. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar amigo
  const eliminarAmigo = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este amigo?')) {
      try {
        await deleteAmigo(id)
        setAmigos(amigos.filter(amigo => amigo.id !== id))
      } catch (err: any) {
        console.error('Error al eliminar amigo:', err)
        alert(err.message || 'Error al eliminar el amigo. Por favor, intenta nuevamente.')
      }
    }
  }

  // Función para cambiar estado de amigo
  const cambiarEstado = async (id: string, nuevoEstado: Amigo['estado']) => {
    try {
      const amigoActualizado = await updateEstadoAmigo(id, nuevoEstado)
      setAmigos(amigos.map(amigo =>
        amigo.id === id ? amigoActualizado : amigo
      ))
    } catch (err: any) {
      console.error('Error al actualizar estado:', err)
      alert(err.message || 'Error al actualizar el estado. Por favor, intenta nuevamente.')
    }
  }

  const contarPorEstado = (estado: Amigo['estado']) => {
    return amigos.filter(amigo => amigo.estado === estado).length
  }

  return (
    <div className="amigos-page">
      <div className="amigos-container">
        {/* Header de la página */}
        <div className="amigos-header">
          <div>
            <h1 className="amigos-title">Amigos</h1>
            <p className="amigos-subtitle">
              {amigos.length > 0 
                ? `${amigos.length} amigo${amigos.length > 1 ? 's' : ''} en tu lista`
                : 'No tienes amigos agregados'}
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="btn btn-primary"
          >
            {mostrarFormulario ? 'Cancelar' : '+ Agregar Amigo'}
          </button>
        </div>

        {/* Formulario para agregar amigo */}
        {mostrarFormulario && (
          <div className="amigos-form-card">
            <h3 className="amigos-form-title">Agregar Nuevo Amigo</h3>
            <div className="amigos-form">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  className="form-input"
                  placeholder="Nombre completo"
                  value={nombreAmigo}
                  onChange={(e) => setNombreAmigo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="email@ejemplo.com"
                  value={emailAmigo}
                  onChange={(e) => setEmailAmigo(e.target.value)}
                />
              </div>
              <button
                onClick={agregarAmigo}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar Amigo'}
              </button>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="amigos-controls">
          <div className="amigos-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="amigos-search-input"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="amigos-filtros">
            <button
              onClick={() => setFiltro('todos')}
              className={`btn-filtro ${filtro === 'todos' ? 'active' : ''}`}
            >
              Todos ({amigos.length})
            </button>
            <button
              onClick={() => setFiltro('activos')}
              className={`btn-filtro ${filtro === 'activos' ? 'active' : ''}`}
            >
              Activos ({contarPorEstado('activo')})
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`btn-filtro ${filtro === 'pendientes' ? 'active' : ''}`}
            >
              Pendientes ({contarPorEstado('pendiente')})
            </button>
            <button
              onClick={() => setFiltro('bloqueados')}
              className={`btn-filtro ${filtro === 'bloqueados' ? 'active' : ''}`}
            >
              Bloqueados ({contarPorEstado('bloqueado')})
            </button>
          </div>
        </div>

        {/* Lista de amigos */}
        <div className="amigos-lista">
          {loadingAmigos ? (
            <div className="amigos-empty">
              <p>Cargando amigos...</p>
            </div>
          ) : error ? (
            <div className="amigos-empty">
              <p style={{ color: 'red' }}>Error: {error}</p>
              <button 
                onClick={loadAmigos}
                className="btn btn-primary"
                style={{ marginTop: '10px' }}
              >
                Reintentar
              </button>
            </div>
          ) : amigosFiltrados.length === 0 ? (
            <div className="amigos-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>
                {busqueda.trim() || filtro !== 'todos'
                  ? 'No se encontraron amigos con los filtros seleccionados'
                  : 'No tienes amigos agregados. ¡Agrega tu primer amigo!'}
              </p>
            </div>
          ) : (
            <div className="amigos-grid">
              {amigosFiltrados.map((amigo) => (
                <div key={amigo.id} className="amigo-card">
                  <div className="amigo-avatar">
                    {amigo.avatar ? (
                      <img src={amigo.avatar} alt={amigo.nombre} className="amigo-avatar-image" />
                    ) : (
                      <div className="amigo-avatar-placeholder">
                        {getInitials(amigo.nombre)}
                      </div>
                    )}
                  </div>
                  <div className="amigo-info">
                    <h3 className="amigo-nombre">{amigo.nombre}</h3>
                    <p className="amigo-email">{amigo.email}</p>
                    <span className={`amigo-estado estado-${amigo.estado}`}>
                      {amigo.estado === 'activo' && 'Activo'}
                      {amigo.estado === 'pendiente' && 'Pendiente'}
                      {amigo.estado === 'bloqueado' && 'Bloqueado'}
                    </span>
                    <p className="amigo-fecha">
                      Amigos desde {new Date(amigo.fechaAmistad).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="amigo-actions">
                    {/* Botón de chat - siempre visible */}
                    <Link
                      href={`/dashboard/chat/${amigo.id}`}
                      className="btn-link btn-link-chat"
                      title="Abrir chat"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Chat
                    </Link>
                    {amigo.estado === 'activo' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(amigo.id, 'pendiente')}
                          className="btn-link"
                          title="Marcar como pendiente"
                        >
                          Pendiente
                        </button>
                        <button
                          onClick={() => cambiarEstado(amigo.id, 'bloqueado')}
                          className="btn-link btn-link-warning"
                          title="Bloquear amigo"
                        >
                          Bloquear
                        </button>
                      </>
                    )}
                    {amigo.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(amigo.id, 'activo')}
                        className="btn-link"
                        title="Aceptar amigo"
                      >
                        Aceptar
                      </button>
                    )}
                    {amigo.estado === 'bloqueado' && (
                      <button
                        onClick={() => cambiarEstado(amigo.id, 'activo')}
                        className="btn-link"
                        title="Desbloquear amigo"
                      >
                        Desbloquear
                      </button>
                    )}
                    <button
                      onClick={() => eliminarAmigo(amigo.id)}
                      className="btn-link btn-link-danger"
                      title="Eliminar amigo"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

