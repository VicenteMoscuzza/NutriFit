const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number
  errores?: Record<string, string>

  constructor(message: string, status: number, errores?: Record<string, string>) {
    super(message)
    this.status = status
    this.errores = errores
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(
      body?.mensaje ?? 'Ocurrió un error inesperado',
      response.status,
      body?.errores,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
