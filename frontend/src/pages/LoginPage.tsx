import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../api/auth'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUsuario } = useAuth()
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setErrorGeneral('')
    setEnviando(true)
    try {
      const usuario = await iniciarSesion(email, contrasena)
      setUsuario(usuario)
      navigate('/')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorGeneral('Credenciales inválidas')
      } else {
        setErrorGeneral('No se pudo iniciar sesión. Intentá de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="auth">
      <h1>Iniciar sesión</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          value={contrasena}
          onChange={(event) => setContrasena(event.target.value)}
          autoComplete="current-password"
        />

        {errorGeneral && <p className="field-error">{errorGeneral}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
      <p>
        ¿Todavía no tenés cuenta? <Link to="/registro">Registrarme</Link>
      </p>
    </section>
  )
}
