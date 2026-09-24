import { apiFetch } from './client'
import type { SerieRegistrada } from './entrenamiento'
import type { RegistroDiario } from './nutricion'

export interface DiaCalendario {
  fecha: string
  seriesRegistradas: number
  comidasRegistradas: number
  calorias: number
  proteina: number
  carbohidratos: number
  grasa: number
}

export interface EjercicioRealizado {
  nombreEjercicio: string
  grupoMuscular: string
  diaRutina: number
  series: SerieRegistrada[]
}

export interface DetalleDia {
  fecha: string
  ejercicios: EjercicioRealizado[]
  nutricion: RegistroDiario
}

// mes en formato "yyyy-MM"
export function obtenerMesCalendario(mes: string) {
  return apiFetch<DiaCalendario[]>(`/api/calendario?mes=${mes}`)
}

// fecha en formato "yyyy-MM-dd"
export function obtenerDetalleDia(fecha: string) {
  return apiFetch<DetalleDia>(`/api/calendario/${fecha}`)
}
