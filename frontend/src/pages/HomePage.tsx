import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { usuario, cerrarSesion } = useAuth()

  async function handleLogout() {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <section className="auth">
      <h1>¡Bienvenido a Nutrifit!</h1>
      <p>Sesión iniciada como {usuario?.email}.</p>
      <p>
        <Link to="/ejercicios">Ver mis ejercicios</Link>
      </p>
      <p>
        <Link to="/rutina">Ver mi rutina semanal</Link>
      </p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </section>
  )
}
