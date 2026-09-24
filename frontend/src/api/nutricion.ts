import { apiFetch } from './client'

export interface ItemRegistro {
  id: number
  alimentoId: number
  nombreAlimento: string
  cantidadGramos: number
  caloriasCalculadas: number
  proteinaCalculada: number
  carbohidratosCalculados: number
  grasaCalculada: number
}

export interface RegistroDiario {
  id: number | null
  fecha: string
  items: ItemRegistro[]
  totalCalorias: number
  totalProteina: number
  totalCarbohidratos: number
  totalGrasa: number
}

export interface ItemComidaGuardada {
  id: number
  alimentoId: number
  nombreAlimento: string
  cantidadGramos: number
}

export interface ComidaGuardada {
  id: number
  nombre: string
  items: ItemComidaGuardada[]
}

export function obtenerRegistroDeHoy() {
  return apiFetch<RegistroDiario>('/api/nutricion/registro')
}

export function agregarItemRegistro(alimentoId: number, cantidadGramos: number) {
  return apiFetch<ItemRegistro>('/api/nutricion/registro/items', {
    method: 'POST',
    body: JSON.stringify({ alimentoId, cantidadGramos }),
  })
}

export function eliminarItemRegistro(id: number) {
  return apiFetch<void>(`/api/nutricion/registro/items/${id}`, { method: 'DELETE' })
}

export function listarComidasGuardadas() {
  return apiFetch<ComidaGuardada[]>('/api/nutricion/comidas-guardadas')
}

export function crearComidaGuardada(nombre: string) {
  return apiFetch<ComidaGuardada>('/api/nutricion/comidas-guardadas', {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function eliminarComidaGuardada(id: number) {
  return apiFetch<void>(`/api/nutricion/comidas-guardadas/${id}`, { method: 'DELETE' })
}

export function agregarItemComidaGuardada(comidaId: number, alimentoId: number, cantidadGramos: number) {
  return apiFetch<ItemComidaGuardada>(`/api/nutricion/comidas-guardadas/${comidaId}/items`, {
    method: 'POST',
    body: JSON.stringify({ alimentoId, cantidadGramos }),
  })
}

export function eliminarItemComidaGuardada(id: number) {
  return apiFetch<void>(`/api/nutricion/comidas-guardadas/items/${id}`, { method: 'DELETE' })
}

export function aplicarComidaGuardada(comidaId: number) {
  return apiFetch<RegistroDiario>(`/api/nutricion/comidas-guardadas/${comidaId}/aplicar`, { method: 'POST' })
}
