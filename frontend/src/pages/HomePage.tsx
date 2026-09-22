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
        </div>
      </main>
    </>
  )
}
