import { apiFetch } from './client'

export interface EjercicioRutina {
  id: number
  ejercicioId: number
  nombreEjercicio: string
  grupoMuscular: string
  seriesObjetivo: number
  repeticionesObjetivo: number
}

export interface DiaRutina {
  id: number
  numero: number
  ejercicios: EjercicioRutina[]
}

export function obtenerDias() {
  return apiFetch<DiaRutina[]>('/api/rutinas/dias')
}

export interface EjercicioDiaNuevo {
  ejercicioId: number
  seriesObjetivo: number
  repeticionesObjetivo: number
}

export function crearDia(ejercicios: EjercicioDiaNuevo[]) {
  return apiFetch<DiaRutina>('/api/rutinas/dias', {
    method: 'POST',
    body: JSON.stringify({ ejercicios }),
  })
}

export function eliminarDia(id: number) {
  return apiFetch<void>(`/api/rutinas/dias/${id}`, { method: 'DELETE' })
}

export function agregarEjercicioADia(
  diaId: number,
  ejercicioId: number,
  seriesObjetivo: number,
  repeticionesObjetivo: number,
) {
  return apiFetch<EjercicioRutina>(`/api/rutinas/dias/${diaId}/ejercicios`, {
    method: 'POST',
    body: JSON.stringify({ ejercicioId, seriesObjetivo, repeticionesObjetivo }),
  })
}

export function eliminarEjercicioDeDia(id: number) {
  return apiFetch<void>(`/api/rutinas/dias-ejercicios/${id}`, { method: 'DELETE' })
}
