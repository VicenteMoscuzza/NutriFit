import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { listarEjercicios, type Ejercicio } from '../api/ejercicios'
import { ApiError } from '../api/client'
import { agregarEjercicioADia, eliminarEjercicioDeDia, obtenerSemana, type DiaSemana } from '../api/rutinas'

export default function RutinaPage() {
  const [semana, setSemana] = useState<DiaSemana[]>([])
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<Ejercicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [diaFormularioAbierto, setDiaFormularioAbierto] = useState<number | null>(null)
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState('')
  const [series, setSeries] = useState('4')
  const [repeticiones, setRepeticiones] = useState('10')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([obtenerSemana(), listarEjercicios()])
      .then(([semanaData, ejerciciosData]) => {
        setSemana(semanaData)
        setEjerciciosDisponibles(ejerciciosData)
        if (ejerciciosData.length > 0) {
          setEjercicioSeleccionado(String(ejerciciosData[0].id))
        }
      })
      .finally(() => setCargando(false))
  }, [])

  function alternarFormulario(dia: number) {
    setError('')
    setDiaFormularioAbierto((actual) => (actual === dia ? null : dia))
  }

  async function handleAgregar(event: FormEvent, dia: number) {
    event.preventDefault()

    if (!ejercicioSeleccionado) {
      setError('Elegí un ejercicio')
      return
    }

    setError('')
    setGuardando(true)
    try {
      const creado = await agregarEjercicioADia(
        dia,
        Number(ejercicioSeleccionado),
        Number(series),
        Number(repeticiones),
      )
      setSemana((actual) =>
        actual.map((d) => (d.diaSemana === dia ? { ...d, ejercicios: [...d.ejercicios, creado] } : d)),
      )
      setDiaFormularioAbierto(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el ejercicio')
    } finally {
      setGuardando(false)
    }
  }

  async function handleQuitar(dia: number, id: number) {
    await eliminarEjercicioDeDia(id)
    setSemana((actual) =>
      actual.map((d) => (d.diaSemana === dia ? { ...d, ejercicios: d.ejercicios.filter((e) => e.id !== id) } : d)),
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
            <h1>Mi rutina semanal</h1>
          </div>

          <div className="semana">
            {semana.map((dia) => (
              <div className="dia" key={dia.diaSemana}>
                <div className="dia-header">
                  <h2>{dia.nombreDia}</h2>
                  <button type="button" onClick={() => alternarFormulario(dia.diaSemana)}>
                    {diaFormularioAbierto === dia.diaSemana ? 'Cancelar' : '+ Agregar ejercicio'}
                  </button>
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
                        <button type="button" onClick={() => handleQuitar(dia.diaSemana, ejercicio.id)}>
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {diaFormularioAbierto === dia.diaSemana && (
                  <form className="auth-form" onSubmit={(event) => handleAgregar(event, dia.diaSemana)} noValidate>
                    <label htmlFor={`ejercicio-${dia.diaSemana}`}>Ejercicio</label>
                    <select
                      id={`ejercicio-${dia.diaSemana}`}
                      value={ejercicioSeleccionado}
                      onChange={(event) => setEjercicioSeleccionado(event.target.value)}
                    >
                      {ejerciciosDisponibles.map((ejercicio) => (
                        <option key={ejercicio.id} value={ejercicio.id}>
                          {ejercicio.nombre} ({ejercicio.grupoMuscular})
                        </option>
                      ))}
                    </select>

                    <label htmlFor={`series-${dia.diaSemana}`}>Series</label>
                    <input
                      id={`series-${dia.diaSemana}`}
                      type="number"
                      min={1}
                      value={series}
                      onChange={(event) => setSeries(event.target.value)}
                    />

                    <label htmlFor={`reps-${dia.diaSemana}`}>Repeticiones</label>
                    <input
                      id={`reps-${dia.diaSemana}`}
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
        </section>
      </main>
    </>
  )
}
