import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { cerrarSesion as cerrarSesionApi, obtenerUsuarioActual, type Usuario } from '../api/auth'

interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  setUsuario: (usuario: Usuario | null) => void
  cerrarSesion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  async function cerrarSesion() {
    await cerrarSesionApi().catch(() => {})
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, setUsuario, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
