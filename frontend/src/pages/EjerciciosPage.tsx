import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { crearEjercicio, listarEjercicios, type Ejercicio } from '../api/ejercicios'
import { ApiError } from '../api/client'

const GRUPOS_MUSCULARES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']

export default function EjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [grupoMuscular, setGrupoMuscular] = useState(GRUPOS_MUSCULARES[0])
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    listarEjercicios()
      .then(setEjercicios)
      .finally(() => setCargando(false))
  }, [])

  async function handleCrear(event: FormEvent) {
    event.preventDefault()

    if (!nombre.trim()) {
      setError('Ingresá un nombre')
      return
    }

    setError('')
    setCreando(true)
    try {
      const creado = await crearEjercicio(nombre.trim(), grupoMuscular)
      setEjercicios((actuales) => [...actuales, creado])
      setNombre('')
      setMostrarFormulario(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el ejercicio')
    } finally {
      setCreando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Ejercicios</h1>
            <button type="button" onClick={() => setMostrarFormulario((valor) => !valor)}>
              {mostrarFormulario ? 'Cancelar' : 'Crear ejercicio'}
            </button>
          </div>

          {mostrarFormulario && (
            <form className="auth-form" onSubmit={handleCrear} noValidate>
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />

              <label htmlFor="grupoMuscular">Grupo muscular</label>
              <select
                id="grupoMuscular"
                value={grupoMuscular}
                onChange={(event) => setGrupoMuscular(event.target.value)}
              >
                {GRUPOS_MUSCULARES.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    {grupo}
                  </option>
                ))}
              </select>

              {error && <p className="field-error">{error}</p>}

              <button type="submit" disabled={creando}>
                {creando ? 'Creando...' : 'Guardar'}
              </button>
            </form>
          )}

          {cargando ? (
            <p>Cargando ejercicios...</p>
          ) : (
            <ul className="lista-ejercicios">
              {ejercicios.map((ejercicio) => (
                <li key={ejercicio.id}>
                  <span className="nombre">{ejercicio.nombre}</span>
                  <span className="grupo">{ejercicio.grupoMuscular}</span>
                  <span className={ejercicio.esGlobal ? 'etiqueta etiqueta-global' : 'etiqueta etiqueta-propio'}>
                    {ejercicio.esGlobal ? 'Global' : 'Mío'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
