import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../api/auth'
import { ApiError } from '../api/client'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(email: string, contrasena: string): Record<string, string> {
  const errores: Record<string, string> = {}
  if (!EMAIL_REGEX.test(email)) {
    errores.email = 'Ingresá un email válido'
  }
  if (contrasena.length < 8) {
    errores.contrasena = 'La contraseña debe tener al menos 8 caracteres'
  }
  return errores
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const erroresValidacion = validar(email, contrasena)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})
    setEnviando(true)
    try {
      await registrarUsuario(email, contrasena)
      navigate('/login')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrores(error.errores ?? { general: error.message })
      } else {
        setErrores({ general: 'No se pudo completar el registro. Intentá de nuevo.' })
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <span className="auth-logo">N</span>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Empezá a organizar tus rutinas hoy.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          {errores.email && <p className="field-error">{errores.email}</p>}

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            autoComplete="new-password"
          />
          {errores.contrasena && <p className="field-error">{errores.contrasena}</p>}

          {errores.general && <p className="field-error">{errores.general}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>
        <p className="auth-footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </section>
  )
}
