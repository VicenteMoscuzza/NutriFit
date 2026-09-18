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
          <Link to="/ejercicios" className="dashboard-card">
            <span className="dashboard-icon">🏋️</span>
            <h2>Mis ejercicios</h2>
            <p>Gestioná tu catálogo de ejercicios propios y globales.</p>
          </Link>
          <Link to="/rutina" className="dashboard-card">
            <span className="dashboard-icon">📅</span>
            <h2>Rutina semanal</h2>
            <p>Organizá tus ejercicios día por día.</p>
          </Link>
        </div>
      </main>
    </>
  )
}
