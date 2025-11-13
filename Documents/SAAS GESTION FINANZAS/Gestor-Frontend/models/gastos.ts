// Modelos de gastos
// Define las interfaces y tipos relacionados con gastos
// Alineados con la respuesta del backend

export interface Gasto {
  _id: string
  userId: string
  descripcion: string
  monto: number
  fecha: string // ISO date string
  categoria: string
  mes: string
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado: boolean
  }>
  createdAt?: string // ISO date string
}

// Request para crear un gasto
export interface CreateGastoRequest {
  descripcion: string
  monto: number
  fecha: string // ISO date string o formato "YYYY-MM-DD"
  categoria: string
  mes?: string // Opcional: se extrae de la fecha si no se proporciona
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado?: boolean // Opcional, default: false
  }> // Opcional: array de amigos con quienes se divide el gasto
}

// Request para actualizar un gasto (todos los campos opcionales)
export interface UpdateGastoRequest {
  descripcion?: string
  monto?: number
  fecha?: string
  categoria?: string
  mes?: string
  dividido?: Array<{
    amigoId: string
    amigoNombre: string
    montoDividido: number
    pagado?: boolean // Opcional, default: false
  }> // Opcional: si se envía, reemplaza completamente el array anterior
}

// Respuesta del backend para obtener gastos por mes
export interface BackendGastosResponse {
  success: boolean
  data: Gasto[]
  total?: number // Opcional: se calculará si no viene
}

// Respuesta del backend para crear/actualizar gasto
export interface BackendGastoResponse {
  success: boolean
  data: Gasto
  message?: string
}

// Respuesta del backend para total de gastos
export interface BackendTotalGastosResponse {
  success: boolean
  data: {
    mes: string
    total: number
  }
}

// Respuesta del backend para eliminar gasto
export interface BackendDeleteGastoResponse {
  success: boolean
  message: string
}

// Error del backend (reutilizado de auth)
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para gastos
export interface GastoError {
  message: string
  status?: number
}

