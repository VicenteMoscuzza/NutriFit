import { apiFetch } from './client'

export interface EjercicioRutina {
  id: number
  ejercicioId: number
  nombreEjercicio: string
  grupoMuscular: string
  seriesObjetivo: number
  repeticionesObjetivo: number
}

export interface DiaSemana {
  diaSemana: number
  nombreDia: string
  ejercicios: EjercicioRutina[]
}

export function obtenerSemana() {
  return apiFetch<DiaSemana[]>('/api/rutinas/semana')
}

export function agregarEjercicioADia(
  diaSemana: number,
  ejercicioId: number,
  seriesObjetivo: number,
  repeticionesObjetivo: number,
) {
  return apiFetch<EjercicioRutina>(`/api/rutinas/dias/${diaSemana}/ejercicios`, {
    method: 'POST',
    body: JSON.stringify({ ejercicioId, seriesObjetivo, repeticionesObjetivo }),
  })
}

export function eliminarEjercicioDeDia(id: number) {
  return apiFetch<void>(`/api/rutinas/dias-ejercicios/${id}`, { method: 'DELETE' })
}
