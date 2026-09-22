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

export interface EntrenamientoDia {
  diaId: number
  numero: number
  ejercicios: EjercicioEntrenamiento[]
}

export function obtenerEntrenamientoDelDia(diaId: number) {
  return apiFetch<EntrenamientoDia>(`/api/entrenamiento/dias/${diaId}`)
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
