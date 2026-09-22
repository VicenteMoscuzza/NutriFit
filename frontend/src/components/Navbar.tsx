import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/entrenamiento', label: 'Hoy' },
  { to: '/rutina', label: 'Rutina' },
]

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">N</span>
          Nutrifit
        </Link>
        <nav className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'navbar-link active' : 'navbar-link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-user">
          <span className="navbar-email">{usuario?.email}</span>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
