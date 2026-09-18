import { apiFetch } from './client'

export interface Ejercicio {
  id: number
  nombre: string
  grupoMuscular: string
  esGlobal: boolean
}

export function listarEjercicios() {
  return apiFetch<Ejercicio[]>('/api/ejercicios')
}

export function crearEjercicio(nombre: string, grupoMuscular: string) {
  return apiFetch<Ejercicio>('/api/ejercicios', {
    method: 'POST',
    body: JSON.stringify({ nombre, grupoMuscular }),
  })
}
