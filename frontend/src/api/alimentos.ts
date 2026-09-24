import { apiFetch } from './client'

export interface Alimento {
  id: number
  nombre: string
  caloriasPor100g: number
  proteinaPor100g: number
  carbohidratosPor100g: number
  grasaPor100g: number
  esGlobal: boolean
}

export function listarAlimentos() {
  return apiFetch<Alimento[]>('/api/alimentos')
}

export function crearAlimento(
  nombre: string,
  caloriasPor100g: number,
  proteinaPor100g: number,
  carbohidratosPor100g: number,
  grasaPor100g: number,
) {
  return apiFetch<Alimento>('/api/alimentos', {
    method: 'POST',
    body: JSON.stringify({ nombre, caloriasPor100g, proteinaPor100g, carbohidratosPor100g, grasaPor100g }),
  })
}
