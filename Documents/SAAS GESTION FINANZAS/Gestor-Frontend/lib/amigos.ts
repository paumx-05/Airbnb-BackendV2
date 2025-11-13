// Utilidades para manejar amigos con API del backend
// Funciones que integran con el servicio de amigos del backend
// Mantiene compatibilidad con la interfaz anterior

import { amigosService } from '@/services/amigos.service'
import type { Amigo as BackendAmigo } from '@/models/amigos'

// Interfaz local para compatibilidad con código existente
export interface Amigo {
  id: string
  nombre: string
  email: string
  avatar?: string
  fechaAmistad: string
  estado: 'activo' | 'pendiente' | 'bloqueado'
}

// Función helper para convertir Amigo del backend a Amigo local
function adaptBackendAmigoToLocal(backendAmigo: BackendAmigo): Amigo {
  return {
    id: backendAmigo._id,
    nombre: backendAmigo.nombre,
    email: backendAmigo.email,
    avatar: backendAmigo.avatar || undefined,
    fechaAmistad: backendAmigo.fechaAmistad,
    estado: backendAmigo.estado,
  }
}

// Función para obtener todos los amigos desde el backend
export async function getAmigos(userId?: string): Promise<Amigo[]> {
  try {
    const amigos = await amigosService.getAllAmigos()
    return amigos.map(adaptBackendAmigoToLocal)
  } catch (error) {
    console.error('Error al obtener amigos:', error)
    return []
  }
}

// Función para obtener un amigo por ID
export async function getAmigoById(id: string): Promise<Amigo | null> {
  try {
    const amigo = await amigosService.getAmigoById(id)
    return adaptBackendAmigoToLocal(amigo)
  } catch (error) {
    console.error('Error al obtener amigo:', error)
    return null
  }
}

// Función para buscar amigos
export async function searchAmigos(query: string): Promise<Amigo[]> {
  try {
    if (!query || query.trim().length === 0) {
      return await getAmigos()
    }
    const amigos = await amigosService.searchAmigos(query.trim())
    return amigos.map(adaptBackendAmigoToLocal)
  } catch (error) {
    console.error('Error al buscar amigos:', error)
    return []
  }
}

// Función para obtener amigos por estado
export async function getAmigosByEstado(estado: 'activo' | 'pendiente' | 'bloqueado'): Promise<Amigo[]> {
  try {
    const amigos = await amigosService.getAmigosByEstado(estado)
    return amigos.map(adaptBackendAmigoToLocal)
  } catch (error) {
    console.error('Error al obtener amigos por estado:', error)
    return []
  }
}

// Función para crear un nuevo amigo
export async function createAmigo(data: {
  nombre: string
  email: string
  avatar?: string
  estado?: 'activo' | 'pendiente' | 'bloqueado'
}): Promise<Amigo> {
  try {
    const amigo = await amigosService.createAmigo({
      nombre: data.nombre,
      email: data.email,
      avatar: data.avatar,
      estado: data.estado || 'activo',
    })
    return adaptBackendAmigoToLocal(amigo)
  } catch (error: any) {
    console.error('Error al crear amigo:', error)
    throw error
  }
}

// Función para actualizar un amigo
export async function updateAmigo(id: string, data: {
  nombre?: string
  email?: string
  avatar?: string
  estado?: 'activo' | 'pendiente' | 'bloqueado'
}): Promise<Amigo> {
  try {
    const amigo = await amigosService.updateAmigo(id, data)
    return adaptBackendAmigoToLocal(amigo)
  } catch (error: any) {
    console.error('Error al actualizar amigo:', error)
    throw error
  }
}

// Función para actualizar el estado de un amigo
export async function updateEstadoAmigo(id: string, estado: 'activo' | 'pendiente' | 'bloqueado'): Promise<Amigo> {
  try {
    const amigo = await amigosService.updateEstadoAmigo(id, estado)
    return adaptBackendAmigoToLocal(amigo)
  } catch (error: any) {
    console.error('Error al actualizar estado de amigo:', error)
    throw error
  }
}

// Función para eliminar un amigo
export async function deleteAmigo(id: string): Promise<void> {
  try {
    await amigosService.deleteAmigo(id)
  } catch (error: any) {
    console.error('Error al eliminar amigo:', error)
    throw error
  }
}

