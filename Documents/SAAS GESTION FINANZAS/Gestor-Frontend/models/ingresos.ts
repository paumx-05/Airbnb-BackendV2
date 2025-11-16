// Modelos de ingresos
// Define las interfaces y tipos relacionados con ingresos
// Alineados con la respuesta del backend

export type MesValido = 
  | 'enero' 
  | 'febrero' 
  | 'marzo' 
  | 'abril' 
  | 'mayo' 
  | 'junio' 
  | 'julio' 
  | 'agosto' 
  | 'septiembre' 
  | 'octubre' 
  | 'noviembre' 
  | 'diciembre'

export interface Ingreso {
  _id: string
  userId: string
  descripcion: string
  monto: number
  fecha: string // ISO date string
  categoria: string
  mes: string
  createdAt?: string // ISO date string
}

// Request para crear un ingreso
export interface CreateIngresoRequest {
  descripcion: string
  monto: number
  fecha: string | Date // ISO date string o Date object
  categoria: string
  mes: MesValido
}

// Request para actualizar un ingreso (todos los campos opcionales)
export interface UpdateIngresoRequest {
  descripcion?: string
  monto?: number
  fecha?: string | Date
  categoria?: string
  mes?: MesValido
}

// Respuesta del backend para obtener ingresos por mes
export interface BackendIngresosResponse {
  success: boolean
  data: Ingreso[]
}

// Respuesta del backend para crear/actualizar ingreso
export interface BackendIngresoResponse {
  success: boolean
  data: Ingreso
  message?: string
}

// Respuesta del backend para total de ingresos
export interface BackendTotalIngresosResponse {
  success: boolean
  data: {
    mes: string
    total: number
  }
}

// Respuesta del backend para ingresos por categoría
export interface BackendIngresosByCategoriaResponse {
  success: boolean
  data: Ingreso[]
  total: number
}

// Respuesta del backend para eliminar ingreso
export interface BackendDeleteIngresoResponse {
  success: boolean
  message: string
}

// Error del backend (reutilizado de auth)
export interface BackendError {
  success: false
  error: string
  message?: string
}

// Error personalizado para ingresos
export interface IngresoError {
  message: string
  status?: number
}


