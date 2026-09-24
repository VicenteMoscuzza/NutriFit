import { useCallback, useEffect, useState } from 'react'
import DialogoConfirmar from '../components/DialogoConfirmar'
import ModalAgregarEjercicio from '../components/ModalAgregarEjercicio'
import ModalNuevoDia from '../components/ModalNuevoDia'
import Navbar from '../components/Navbar'
import { listarEjercicios, type Ejercicio } from '../api/ejercicios'
import { agregarEjercicioADia, eliminarDia, eliminarEjercicioDeDia, obtenerDias, type DiaRutina } from '../api/rutinas'

export default function RutinaPage() {
  const [dias, setDias] = useState<DiaRutina[]>([])
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<Ejercicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [diaAgregando, setDiaAgregando] = useState<DiaRutina | null>(null)
  const [diaAQuitar, setDiaAQuitar] = useState<DiaRutina | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    Promise.all([obtenerDias(), listarEjercicios()])
      .then(([diasData, ejerciciosData]) => {
        setDias(diasData)
        setEjerciciosDisponibles(ejerciciosData)
      })
      .finally(() => setCargando(false))
  }, [])

  const cerrarModal = useCallback(() => setModalAbierto(false), [])

  function handleEjercicioCreado(ejercicio: Ejercicio) {
    setEjerciciosDisponibles((actuales) => [...actuales, ejercicio])
  }

  function handleDiaCreado(dia: DiaRutina) {
    setDias((actual) => [...actual, dia])
    setModalAbierto(false)
  }

  async function handleQuitarDia(diaId: number) {
    await eliminarDia(diaId)
    setDias(await obtenerDias())
  }

  async function handleAgregarEjercicio(
    diaId: number,
    ejercicio: Ejercicio,
    seriesObjetivo: number,
    repeticionesObjetivo: number,
  ) {
    const creado = await agregarEjercicioADia(diaId, ejercicio.id, seriesObjetivo, repeticionesObjetivo)
    setDias((actual) => actual.map((d) => (d.id === diaId ? { ...d, ejercicios: [...d.ejercicios, creado] } : d)))
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
                    <button type="button" onClick={() => setDiaAgregando(dia)}>
                      + Agregar ejercicio
                    </button>
                    <button type="button" className="btn-quitar-dia" onClick={() => setDiaAQuitar(dia)}>
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
              </div>
            ))}
          </div>

          <button type="button" className="btn-agregar-dia" onClick={() => setModalAbierto(true)}>
            + Agregar día {dias.length + 1}
          </button>

          {modalAbierto && (
            <ModalNuevoDia
              numero={dias.length + 1}
              ejerciciosDisponibles={ejerciciosDisponibles}
              onEjercicioCreado={handleEjercicioCreado}
              onCreado={handleDiaCreado}
              onCerrar={cerrarModal}
            />
          )}

          {diaAgregando && (
            <ModalAgregarEjercicio
              titulo={`Día ${diaAgregando.numero}`}
              ejerciciosDisponibles={ejerciciosDisponibles}
              onEjercicioCreado={handleEjercicioCreado}
              onAgregar={(ejercicio, series, repeticiones) =>
                handleAgregarEjercicio(diaAgregando.id, ejercicio, series, repeticiones)
              }
              onCerrar={() => setDiaAgregando(null)}
            />
          )}

          {diaAQuitar && (
            <DialogoConfirmar
              titulo={`¿Quitar el día ${diaAQuitar.numero}?`}
              mensaje="Se van a eliminar el día y todos sus ejercicios. Esta acción no se puede deshacer."
              textoConfirmar="Quitar día"
              onConfirmar={() => handleQuitarDia(diaAQuitar.id)}
              onCerrar={() => setDiaAQuitar(null)}
            />
          )}
        </section>
      </main>
    </>
  )
}
