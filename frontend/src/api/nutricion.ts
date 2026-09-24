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

export interface ComidaRegistrada {
  id: number
  numero: number
  items: ItemRegistro[]
  subtotalCalorias: number
  subtotalProteina: number
  subtotalCarbohidratos: number
  subtotalGrasa: number
}

export interface RegistroDiario {
  id: number | null
  fecha: string
  comidas: ComidaRegistrada[]
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

export interface ItemComidaNueva {
  alimentoId: number
  cantidadGramos: number
}

export function crearComida(items: ItemComidaNueva[], comidasGuardadasIds: number[]) {
  return apiFetch<ComidaRegistrada>('/api/nutricion/registro/comidas', {
    method: 'POST',
    body: JSON.stringify({ items, comidasGuardadasIds }),
  })
}

export function cargarComidaGuardada(comidaId: number, comidaGuardadaId: number) {
  return apiFetch<ComidaRegistrada>(`/api/nutricion/registro/comidas/${comidaId}/comida-guardada`, {
    method: 'POST',
    body: JSON.stringify({ comidaGuardadaId }),
  })
}

export function eliminarComida(id: number) {
  return apiFetch<void>(`/api/nutricion/registro/comidas/${id}`, { method: 'DELETE' })
}

export function agregarItemComida(comidaId: number, alimentoId: number, cantidadGramos: number) {
  return apiFetch<ItemRegistro>(`/api/nutricion/registro/comidas/${comidaId}/items`, {
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
