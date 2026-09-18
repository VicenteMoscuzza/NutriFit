import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RutaPrivada({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return null
  }

  if (!usuario) {
    return <Navigate to="/registro" replace />
  }

  return <>{children}</>
}
