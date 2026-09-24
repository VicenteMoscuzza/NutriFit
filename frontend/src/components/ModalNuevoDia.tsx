import { useRef, useState } from 'react'
import Modal from './Modal'
import SelectorEjercicio from './SelectorEjercicio'
import { IconoBasura, IconoPesa } from './Iconos'
import { type Ejercicio } from '../api/ejercicios'
import { ApiError } from '../api/client'
import { crearDia, type DiaRutina } from '../api/rutinas'

interface Pendiente {
  clave: number
  ejercicio: Ejercicio
  seriesObjetivo: number
  repeticionesObjetivo: number
}

interface ModalNuevoDiaProps {
  numero: number
  ejerciciosDisponibles: Ejercicio[]
  onEjercicioCreado: (ejercicio: Ejercicio) => void
  onCreado: (dia: DiaRutina) => void
  onCerrar: () => void
}

export default function ModalNuevoDia({
  numero,
  ejerciciosDisponibles,
  onEjercicioCreado,
  onCreado,
  onCerrar,
}: ModalNuevoDiaProps) {
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const siguienteClave = useRef(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleAgregarEjercicio(ejercicio: Ejercicio, seriesObjetivo: number, repeticionesObjetivo: number) {
    const clave = siguienteClave.current++
    setError('')
    setPendientes((actuales) => [...actuales, { clave, ejercicio, seriesObjetivo, repeticionesObjetivo }])
  }

  async function handleGuardar() {
    if (pendientes.length === 0) {
      setError('Agregá al menos un ejercicio al día')
      return
    }
    setError('')
    setGuardando(true)
    try {
      const creado = await crearDia(
        pendientes.map((p) => ({
          ejercicioId: p.ejercicio.id,
          seriesObjetivo: p.seriesObjetivo,
          repeticionesObjetivo: p.repeticionesObjetivo,
        })),
      )
      onCreado(creado)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el día')
      setGuardando(false)
    }
  }

  const totalSeries = pendientes.reduce((suma, p) => suma + p.seriesObjetivo, 0)

  return (
    <Modal
      titulo={`Nuevo día ${numero}`}
      subtitulo="Elegí los ejercicios y cuántas series y repeticiones vas a hacer."
      icono={<IconoPesa />}
      onCerrar={onCerrar}
      bloqueado={guardando}
      pie={
        <>
          <button type="button" className="btn btn-secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primario"
            onClick={handleGuardar}
            disabled={guardando || pendientes.length === 0}
          >
            {guardando ? 'Guardando...' : `Guardar día ${numero}`}
          </button>
        </>
      }
    >
      <SelectorEjercicio
        idPrefix="nuevo-dia"
        ejerciciosDisponibles={ejerciciosDisponibles}
        onEjercicioCreado={onEjercicioCreado}
        onAgregar={handleAgregarEjercicio}
        textoBoton="Agregar al día"
      />

      <div className="resumen">
        <div className="resumen-header">
          <h3>En este día</h3>
          {pendientes.length > 0 && (
            <span className="resumen-contador">
              {pendientes.length} {pendientes.length === 1 ? 'ejercicio' : 'ejercicios'} · {totalSeries} series
            </span>
          )}
        </div>
        {pendientes.length === 0 ? (
          <p className="resumen-vacio">Los ejercicios que agregues van a aparecer acá.</p>
        ) : (
          <ul className="resumen-lista">
            {pendientes.map((pendiente, indice) => (
              <li key={pendiente.clave} className="resumen-item">
                <span className="resumen-indice">{indice + 1}</span>
                <span className="resumen-texto">
                  <span className="resumen-nombre">{pendiente.ejercicio.nombre}</span>
                  <span className="resumen-detalle">
                    {pendiente.ejercicio.grupoMuscular} · {pendiente.seriesObjetivo} × {pendiente.repeticionesObjetivo}{' '}
                    reps
                  </span>
                </span>
                <button
                  type="button"
                  className="btn-icono-quitar"
                  aria-label={`Quitar ${pendiente.ejercicio.nombre}`}
                  onClick={() => setPendientes((actuales) => actuales.filter((p) => p.clave !== pendiente.clave))}
                >
                  <IconoBasura tamanio={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
    </Modal>
  )
}
