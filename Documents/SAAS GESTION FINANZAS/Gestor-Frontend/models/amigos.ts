// Modelos de amigos
// Define las interfaces y tipos relacionados con amigos
// Alineados con la respuesta del backend

export interface Amigo {
  _id: string
  userId: string
  nombre: string
  email: string
  avatar?: string | null
  estado: 'activo' | 'pendiente' | 'bloqueado'
  fechaAmistad: string // ISO date string
  createdAt?: string // ISO date string
}

// Request para crear un amigo
export interface CreateAmigoRequest {
  nombre: string
  email: string
  avatar?: string
  estado?: 'activo' | 'pendiente' | 'bloqueado'
}

// Request para actualizar un amigo (todos los campos opcionales)
export interface UpdateAmigoRequest {
  nombre?: string
  email?: string
  avatar?: string
  estado?: 'activo' | 'pendiente' | 'bloqueado'
}

// Respuesta del backend para obtener amigos
export interface BackendAmigosResponse {
  success: boolean
  data: Amigo[]
}

// Respuesta del backend para obtener un amigo
export interface BackendAmigoResponse {
  success: boolean
  data: Amigo
  message?: string
}

// Respuesta del backend para actualizar estado
export interface BackendUpdateEstadoResponse {
  success: boolean
  data: {
    _id: string
    estado: 'activo' | 'pendiente' | 'bloqueado'
  }
  message?: string
}

// Respuesta del backend para eliminar amigo
export interface BackendDeleteAmigoResponse {
  success: boolean
  message: string
}

// Error del backend
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para amigos
export interface AmigoError {
  message: string
  status?: number
}

