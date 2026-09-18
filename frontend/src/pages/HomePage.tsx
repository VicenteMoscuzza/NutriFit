import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { usuario, cargando, cerrarSesion } = useAuth()

  if (cargando) {
    return null
  }

  if (!usuario) {
    return <Navigate to="/registro" replace />
  }

  async function handleLogout() {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <section className="auth">
      <h1>¡Bienvenido a Nutrifit!</h1>
      <p>Sesión iniciada como {usuario.email}.</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </section>
  )
}
