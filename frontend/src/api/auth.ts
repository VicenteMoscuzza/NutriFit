import { apiFetch } from './client'

export interface Usuario {
  id: number
  email: string
}

export interface LoginResponse {
  token: string
  tipo: string
}

export function registrarUsuario(email: string, contrasena: string) {
  return apiFetch<Usuario>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena }),
  })
}

export function iniciarSesion(email: string, contrasena: string) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena }),
  })
}
