import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { crearEjercicio, listarEjercicios, type Ejercicio } from '../api/ejercicios'
import { ApiError } from '../api/client'
import {
  agregarEjercicioADia,
  crearDia,
  eliminarDia,
  eliminarEjercicioDeDia,
  obtenerDias,
  type DiaRutina,
} from '../api/rutinas'

const GRUPOS_MUSCULARES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']
const EJERCICIO_NUEVO = '__nuevo__'

export default function RutinaPage() {
  const [dias, setDias] = useState<DiaRutina[]>([])
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<Ejercicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [diaFormularioAbierto, setDiaFormularioAbierto] = useState<number | null>(null)
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('')
  const [nombreNuevoEjercicio, setNombreNuevoEjercicio] = useState('')
  const [grupoNuevoEjercicio, setGrupoNuevoEjercicio] = useState(GRUPOS_MUSCULARES[0])
  const [series, setSeries] = useState('4')
  const [repeticiones, setRepeticiones] = useState('10')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [agregandoDia, setAgregandoDia] = useState(false)

  useEffect(() => {
    Promise.all([obtenerDias(), listarEjercicios()])
      .then(([diasData, ejerciciosData]) => {
        setDias(diasData)
        setEjerciciosDisponibles(ejerciciosData)
        setEjercicioSeleccionado(ejerciciosData.length > 0 ? String(ejerciciosData[0].id) : EJERCICIO_NUEVO)
      })
      .finally(() => setCargando(false))
  }, [])

  function alternarFormulario(diaId: number) {
    setError('')
    setDiaFormularioAbierto((actual) => (actual === diaId ? null : diaId))
  }

  async function handleAgregarDia() {
    setError('')
    setAgregandoDia(true)
    try {
      const creado = await crearDia()
      setDias((actual) => [...actual, creado])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el día')
    } finally {
      setAgregandoDia(false)
    }
  }

  async function handleQuitarDia(diaId: number) {
    if (!window.confirm('¿Quitar este día y todos sus ejercicios?')) {
      return
    }
    await eliminarDia(diaId)
    setDias(await obtenerDias())
  }

  async function handleAgregar(event: FormEvent, diaId: number) {
    event.preventDefault()

    let ejercicioId: number

    if (ejercicioSeleccionado === EJERCICIO_NUEVO) {
      if (!nombreNuevoEjercicio.trim()) {
        setError('Ingresá un nombre para el ejercicio')
        return
      }
    } else if (!ejercicioSeleccionado) {
      setError('Elegí un ejercicio')
      return
    }

    setError('')
    setGuardando(true)
    try {
      if (ejercicioSeleccionado === EJERCICIO_NUEVO) {
        const nuevo = await crearEjercicio(nombreNuevoEjercicio.trim(), grupoNuevoEjercicio)
        setEjerciciosDisponibles((actuales) => [...actuales, nuevo])
        ejercicioId = nuevo.id
        setEjercicioSeleccionado(String(nuevo.id))
        setNombreNuevoEjercicio('')
      } else {
        ejercicioId = Number(ejercicioSeleccionado)
      }

      const creado = await agregarEjercicioADia(diaId, ejercicioId, Number(series), Number(repeticiones))
      setDias((actual) =>
        actual.map((d) => (d.id === diaId ? { ...d, ejercicios: [...d.ejercicios, creado] } : d)),
      )
      setDiaFormularioAbierto(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el ejercicio')
    } finally {
      setGuardando(false)
    }
  }

  async function handleQuitar(diaId: number, id: number) {
    await eliminarEjercicioDeDia(id)
    setDias((actual) =>
      actual.map((d) => (d.id === diaId ? { ...d, ejercicios: d.ejercicios.filter((e) => e.id !== id) } : d)),
    )
  }

  if (cargando) {
    return (
      <>
        <Navbar />
        <main className="page-content">
          <section className="page">
            <p>Cargando rutina...</p>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Mi rutina</h1>
          </div>

          {dias.length === 0 && <p className="dia-vacio">Todavía no agregaste días de entrenamiento.</p>}

          <div className="semana">
            {dias.map((dia) => (
              <div className="dia" key={dia.id}>
                <div className="dia-header">
                  <h2>Día {dia.numero}</h2>
                  <div className="dia-acciones">
                    <button type="button" onClick={() => alternarFormulario(dia.id)}>
                      {diaFormularioAbierto === dia.id ? 'Cancelar' : '+ Agregar ejercicio'}
                    </button>
                    <button type="button" className="btn-quitar-dia" onClick={() => handleQuitarDia(dia.id)}>
                      Quitar día
                    </button>
                  </div>
                </div>

                {dia.ejercicios.length === 0 ? (
                  <p className="dia-vacio">Sin ejercicios</p>
                ) : (
                  <ul className="lista-ejercicios">
                    {dia.ejercicios.map((ejercicio) => (
                      <li key={ejercicio.id}>
                        <span className="nombre">{ejercicio.nombreEjercicio}</span>
                        <span className="grupo">
                          {ejercicio.seriesObjetivo} series × {ejercicio.repeticionesObjetivo} reps
                        </span>
                        <button type="button" onClick={() => handleQuitar(dia.id, ejercicio.id)}>
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {diaFormularioAbierto === dia.id && (
                  <form className="auth-form" onSubmit={(event) => handleAgregar(event, dia.id)} noValidate>
                    <label htmlFor={`ejercicio-${dia.id}`}>Ejercicio</label>
                    <select
                      id={`ejercicio-${dia.id}`}
                      value={ejercicioSeleccionado}
                      onChange={(event) => setEjercicioSeleccionado(event.target.value)}
                    >
                      {ejerciciosDisponibles.map((ejercicio) => (
                        <option key={ejercicio.id} value={ejercicio.id}>
                          {ejercicio.nombre} ({ejercicio.grupoMuscular})
                        </option>
                      ))}
                      <option value={EJERCICIO_NUEVO}>+ Crear ejercicio nuevo...</option>
                    </select>

                    {ejercicioSeleccionado === EJERCICIO_NUEVO && (
                      <>
                        <label htmlFor={`nombre-nuevo-${dia.id}`}>Nombre del ejercicio</label>
                        <input
                          id={`nombre-nuevo-${dia.id}`}
                          value={nombreNuevoEjercicio}
                          onChange={(event) => setNombreNuevoEjercicio(event.target.value)}
                        />

                        <label htmlFor={`grupo-nuevo-${dia.id}`}>Grupo muscular</label>
                        <select
                          id={`grupo-nuevo-${dia.id}`}
                          value={grupoNuevoEjercicio}
                          onChange={(event) => setGrupoNuevoEjercicio(event.target.value)}
                        >
                          {GRUPOS_MUSCULARES.map((grupo) => (
                            <option key={grupo} value={grupo}>
                              {grupo}
                            </option>
                          ))}
                        </select>
                      </>
                    )}

                    <label htmlFor={`series-${dia.id}`}>Series</label>
                    <input
                      id={`series-${dia.id}`}
                      type="number"
                      min={1}
                      value={series}
                      onChange={(event) => setSeries(event.target.value)}
                    />

                    <label htmlFor={`reps-${dia.id}`}>Repeticiones</label>
                    <input
                      id={`reps-${dia.id}`}
                      type="number"
                      min={1}
                      value={repeticiones}
                      onChange={(event) => setRepeticiones(event.target.value)}
                    />

                    {error && <p className="field-error">{error}</p>}

                    <button type="submit" disabled={guardando}>
                      {guardando ? 'Agregando...' : 'Agregar'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="btn-agregar-dia" disabled={agregandoDia} onClick={handleAgregarDia}>
            {agregandoDia ? 'Agregando...' : '+ Agregar día'}
          </button>
        </section>
      </main>
    </>
  )
}
