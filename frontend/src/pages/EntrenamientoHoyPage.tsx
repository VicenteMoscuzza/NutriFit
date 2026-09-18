import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { ApiError } from '../api/client'
import {
  eliminarSerie,
  obtenerEntrenamientoDeHoy,
  registrarSerie,
  type EjercicioEntrenamiento,
  type EntrenamientoHoy,
} from '../api/entrenamiento'

interface FilaPendiente {
  key: string
  peso: string
  repeticiones: string
}

let contadorKeys = 0
function nuevaKey() {
  contadorKeys += 1
  return `pendiente-${contadorKeys}`
}

function filasIniciales(ejercicio: EjercicioEntrenamiento): FilaPendiente[] {
  const faltantes = ejercicio.seriesObjetivo - ejercicio.series.length
  const cantidad = faltantes > 0 ? faltantes : 1
  return Array.from({ length: cantidad }, () => ({
    key: nuevaKey(),
    peso: '',
    repeticiones: String(ejercicio.repeticionesObjetivo),
  }))
}

export default function EntrenamientoHoyPage() {
  const [entrenamiento, setEntrenamiento] = useState<EntrenamientoHoy | null>(null)
  const [pendientes, setPendientes] = useState<Record<number, FilaPendiente[]>>({})
  const [cargando, setCargando] = useState(true)
  const [guardandoKey, setGuardandoKey] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    obtenerEntrenamientoDeHoy()
      .then((data) => {
        setEntrenamiento(data)
        const inicial: Record<number, FilaPendiente[]> = {}
        data.ejercicios.forEach((ejercicio) => {
          inicial[ejercicio.ejercicioRutinaId] = filasIniciales(ejercicio)
        })
        setPendientes(inicial)
      })
      .finally(() => setCargando(false))
  }, [])

  function actualizarFila(ejercicioRutinaId: number, key: string, campo: 'peso' | 'repeticiones', valor: string) {
    setPendientes((actual) => ({
      ...actual,
      [ejercicioRutinaId]: (actual[ejercicioRutinaId] ?? []).map((fila) =>
        fila.key === key ? { ...fila, [campo]: valor } : fila,
      ),
    }))
  }

  function agregarFila(ejercicio: EjercicioEntrenamiento) {
    setPendientes((actual) => ({
      ...actual,
      [ejercicio.ejercicioRutinaId]: [
        ...(actual[ejercicio.ejercicioRutinaId] ?? []),
        { key: nuevaKey(), peso: '', repeticiones: String(ejercicio.repeticionesObjetivo) },
      ],
    }))
  }

  function quitarFilaPendiente(ejercicioRutinaId: number, key: string) {
    setPendientes((actual) => ({
      ...actual,
      [ejercicioRutinaId]: (actual[ejercicioRutinaId] ?? []).filter((fila) => fila.key !== key),
    }))
    setErrores((actual) => {
      const { [key]: _quitado, ...resto } = actual
      return resto
    })
  }

  async function completarSerie(ejercicioRutinaId: number, fila: FilaPendiente) {
    const peso = Number(fila.peso)
    const repeticiones = Number(fila.repeticiones)

    if (fila.peso.trim() === '' || Number.isNaN(peso) || peso < 0) {
      setErrores((actual) => ({ ...actual, [fila.key]: 'Ingresá un peso válido' }))
      return
    }
    if (fila.repeticiones.trim() === '' || !Number.isInteger(repeticiones) || repeticiones < 1) {
      setErrores((actual) => ({ ...actual, [fila.key]: 'Ingresá repeticiones válidas' }))
      return
    }

    setErrores((actual) => {
      const { [fila.key]: _quitado, ...resto } = actual
      return resto
    })
    setGuardandoKey(fila.key)
    try {
      const creada = await registrarSerie(ejercicioRutinaId, peso, repeticiones)
      setEntrenamiento((actual) =>
        actual
          ? {
              ...actual,
              ejercicios: actual.ejercicios.map((ejercicio) =>
                ejercicio.ejercicioRutinaId === ejercicioRutinaId
                  ? { ...ejercicio, series: [...ejercicio.series, creada] }
                  : ejercicio,
              ),
            }
          : actual,
      )
      quitarFilaPendiente(ejercicioRutinaId, fila.key)
    } catch (err) {
      setErrores((actual) => ({
        ...actual,
        [fila.key]: err instanceof ApiError ? err.message : 'No se pudo guardar la serie',
      }))
    } finally {
      setGuardandoKey(null)
    }
  }

  async function handleEliminarSerieGuardada(ejercicioRutinaId: number, serieId: number) {
    await eliminarSerie(serieId)
    setEntrenamiento((actual) =>
      actual
        ? {
            ...actual,
            ejercicios: actual.ejercicios.map((ejercicio) =>
              ejercicio.ejercicioRutinaId === ejercicioRutinaId
                ? { ...ejercicio, series: ejercicio.series.filter((serie) => serie.id !== serieId) }
                : ejercicio,
            ),
          }
        : actual,
    )
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Entrenamiento de hoy</h1>
          </div>

          {cargando ? (
            <p>Cargando entrenamiento...</p>
          ) : !entrenamiento || entrenamiento.ejercicios.length === 0 ? (
            <p className="dia-vacio">
              No tenés ejercicios planificados para hoy ({entrenamiento?.nombreDia ?? ''}).
            </p>
          ) : (
            <div className="entrenamiento-lista">
              {entrenamiento.ejercicios.map((ejercicio) => (
                <article className="entrenamiento-card" key={ejercicio.ejercicioRutinaId}>
                  <div className="entrenamiento-card-header">
                    <h2>{ejercicio.nombreEjercicio}</h2>
                    <span className="grupo">{ejercicio.grupoMuscular}</span>
                  </div>
                  <p className="entrenamiento-objetivo">
                    Objetivo: {ejercicio.seriesObjetivo} series × {ejercicio.repeticionesObjetivo} reps
                  </p>

                  <div className="series-lista">
                    {ejercicio.series.map((serie) => (
                      <div className="serie-fila serie-completa" key={serie.id}>
                        <span className="serie-numero">{serie.numeroSerie}</span>
                        <span className="serie-dato">{serie.pesoKg} kg</span>
                        <span className="serie-dato">{serie.repeticiones} reps</span>
                        <button
                          type="button"
                          className="btn-icon"
                          aria-label="Eliminar serie"
                          onClick={() => handleEliminarSerieGuardada(ejercicio.ejercicioRutinaId, serie.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {(pendientes[ejercicio.ejercicioRutinaId] ?? []).map((fila, index) => (
                      <div className="serie-fila" key={fila.key}>
                        <span className="serie-numero">{ejercicio.series.length + index + 1}</span>
                        <input
                          className="serie-input"
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min="0"
                          placeholder="Peso (kg)"
                          value={fila.peso}
                          onChange={(event) =>
                            actualizarFila(ejercicio.ejercicioRutinaId, fila.key, 'peso', event.target.value)
                          }
                        />
                        <input
                          className="serie-input"
                          type="number"
                          inputMode="numeric"
                          step="1"
                          min="1"
                          placeholder="Reps"
                          value={fila.repeticiones}
                          onChange={(event) =>
                            actualizarFila(ejercicio.ejercicioRutinaId, fila.key, 'repeticiones', event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="btn-icon"
                          aria-label="Quitar serie"
                          onClick={() => quitarFilaPendiente(ejercicio.ejercicioRutinaId, fila.key)}
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className="btn-completar"
                          disabled={guardandoKey === fila.key}
                          onClick={() => completarSerie(ejercicio.ejercicioRutinaId, fila)}
                        >
                          {guardandoKey === fila.key ? 'Guardando...' : 'Completar serie'}
                        </button>
                        {errores[fila.key] && <p className="field-error serie-error">{errores[fila.key]}</p>}
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn-agregar-serie" onClick={() => agregarFila(ejercicio)}>
                    + Agregar serie
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
