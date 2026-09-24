import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const { usuario } = useAuth()

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="hero">
          <h1>¡Bienvenido a Nutrifit!</h1>
          <p className="hero-subtitle">Sesión iniciada como {usuario?.email}.</p>
        </section>

        <div className="dashboard-grid">
          <Link to="/entrenamiento" className="dashboard-card">
            <span className="dashboard-icon">💪</span>
            <h2>Entrenamiento de hoy</h2>
            <p>Registrá el peso y las repeticiones de cada serie en vivo.</p>
          </Link>
          <Link to="/rutina" className="dashboard-card">
            <span className="dashboard-icon">📅</span>
            <h2>Mi rutina</h2>
            <p>Organizá tus días de entrenamiento y sus ejercicios.</p>
          </Link>
          <Link to="/nutricion" className="dashboard-card">
            <span className="dashboard-icon">🍽️</span>
            <h2>Nutrición de hoy</h2>
            <p>Registrá los alimentos que comiste y seguí tus macros.</p>
          </Link>
          <Link to="/comidas-guardadas" className="dashboard-card">
            <span className="dashboard-icon">📋</span>
            <h2>Comidas guardadas</h2>
            <p>Agrupá alimentos frecuentes para aplicarlos rápido.</p>
          </Link>
        </div>
      </main>
    </>
  )
}
