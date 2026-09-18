import { apiFetch } from './client'

export interface Usuario {
  id: number
  email: string
}

export function registrarUsuario(email: string, contrasena: string) {
  return apiFetch<Usuario>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena }),
  })
}

export function iniciarSesion(email: string, contrasena: string) {
  return apiFetch<Usuario>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena }),
  })
}

export function cerrarSesion() {
  return apiFetch<void>('/api/auth/logout', { method: 'POST' })
}

export function obtenerUsuarioActual() {
  return apiFetch<Usuario>('/api/auth/me')
}
