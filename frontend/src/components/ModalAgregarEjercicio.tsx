import { useState } from 'react'
import Modal from './Modal'
import SelectorEjercicio from './SelectorEjercicio'
import { IconoCheck, IconoPesa } from './Iconos'
import { type Ejercicio } from '../api/ejercicios'

interface ModalAgregarEjercicioProps {
  titulo: string
  ejerciciosDisponibles: Ejercicio[]
  onEjercicioCreado: (ejercicio: Ejercicio) => void
  onAgregar: (ejercicio: Ejercicio, seriesObjetivo: number, repeticionesObjetivo: number) => Promise<void>
  onCerrar: () => void
}

export default function ModalAgregarEjercicio({
  titulo,
  ejerciciosDisponibles,
  onEjercicioCreado,
  onAgregar,
  onCerrar,
}: ModalAgregarEjercicioProps) {
  const [agregados, setAgregados] = useState<string[]>([])

  async function handleAgregar(ejercicio: Ejercicio, seriesObjetivo: number, repeticionesObjetivo: number) {
    await onAgregar(ejercicio, seriesObjetivo, repeticionesObjetivo)
    setAgregados((actuales) => [...actuales, `${ejercicio.nombre} · ${seriesObjetivo} × ${repeticionesObjetivo}`])
  }

  return (
    <Modal
      titulo="Agregar ejercicio"
      subtitulo={titulo}
      icono={<IconoPesa />}
      onCerrar={onCerrar}
      pie={
        <button type="button" className="btn btn-primario" onClick={onCerrar}>
          {agregados.length > 0 ? 'Listo' : 'Cerrar'}
        </button>
      }
    >
      <SelectorEjercicio
        idPrefix="agregar-ejercicio"
        ejerciciosDisponibles={ejerciciosDisponibles}
        onEjercicioCreado={onEjercicioCreado}
        onAgregar={handleAgregar}
      />

      {agregados.length > 0 && (
        <div className="agregados">
          {agregados.map((texto, indice) => (
            <span key={indice} className="agregado">
              <IconoCheck tamanio={13} strokeWidth={3} />
              {texto}
            </span>
          ))}
        </div>
      )}
    </Modal>
  )
}
