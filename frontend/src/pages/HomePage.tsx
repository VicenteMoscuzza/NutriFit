import { Navigate } from 'react-router-dom'
import { obtenerToken } from '../api/token'

export default function HomePage() {
  if (!obtenerToken()) {
    return <Navigate to="/registro" replace />
  }

  return (
    <section className="auth">
      <h1>¡Bienvenido a Nutrifit!</h1>
      <p>Sesión iniciada correctamente.</p>
    </section>
  )
}
