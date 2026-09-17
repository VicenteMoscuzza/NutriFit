const TOKEN_KEY = 'nutrifit_token'

export function guardarToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function limpiarToken() {
  localStorage.removeItem(TOKEN_KEY)
}
