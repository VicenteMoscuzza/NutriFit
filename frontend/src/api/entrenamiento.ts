import { apiFetch } from './client'

export interface SerieRegistrada {
  id: number
  numeroSerie: number
  pesoKg: number
  repeticiones: number
}

export interface EjercicioEntrenamiento {
  ejercicioRutinaId: number
  ejercicioId: number
  nombreEjercicio: string
  grupoMuscular: string
  seriesObjetivo: number
  repeticionesObjetivo: number
  series: SerieRegistrada[]
}

export interface EntrenamientoHoy {
  diaSemana: number
  nombreDia: string
  ejercicios: EjercicioEntrenamiento[]
}

export function obtenerEntrenamientoDeHoy() {
  return apiFetch<EntrenamientoHoy>('/api/entrenamiento/hoy')
}

export function registrarSerie(ejercicioRutinaId: number, pesoKg: number, repeticiones: number) {
  return apiFetch<SerieRegistrada>('/api/entrenamiento/series', {
    method: 'POST',
    body: JSON.stringify({ ejercicioRutinaId, pesoKg, repeticiones }),
  })
}

export function eliminarSerie(id: number) {
  return apiFetch<void>(`/api/entrenamiento/series/${id}`, { method: 'DELETE' })
}
