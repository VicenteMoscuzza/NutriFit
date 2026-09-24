import { useState } from 'react'
import Modal from './Modal'
import SelectorAlimento from './SelectorAlimento'
import { IconoCheck, IconoPlato } from './Iconos'
import { type Alimento } from '../api/alimentos'

interface ModalAgregarAlimentoProps {
  titulo: string
  alimentosDisponibles: Alimento[]
  onAlimentoCreado: (alimento: Alimento) => void
  onAgregar: (alimentoId: number, cantidadGramos: number) => Promise<void>
  onCerrar: () => void
}

export default function ModalAgregarAlimento({
  titulo,
  alimentosDisponibles,
  onAlimentoCreado,
  onAgregar,
  onCerrar,
}: ModalAgregarAlimentoProps) {
  const [agregados, setAgregados] = useState<string[]>([])
  const [creados, setCreados] = useState<Alimento[]>([])

  function handleAlimentoCreado(alimento: Alimento) {
    setCreados((actuales) => [...actuales, alimento])
    onAlimentoCreado(alimento)
  }

  async function handleAgregar(alimentoId: number, cantidadGramos: number) {
    await onAgregar(alimentoId, cantidadGramos)
    const alimento = alimentosDisponibles.find((a) => a.id === alimentoId) ?? creados.find((a) => a.id === alimentoId)
    setAgregados((actuales) => [...actuales, `${alimento?.nombre ?? 'Alimento'} · ${cantidadGramos} g`])
  }

  return (
    <Modal
      titulo="Agregar alimento"
      subtitulo={titulo}
      icono={<IconoPlato />}
      onCerrar={onCerrar}
      pie={
        <button type="button" className="btn btn-primario" onClick={onCerrar}>
          {agregados.length > 0 ? 'Listo' : 'Cerrar'}
        </button>
      }
    >
      <SelectorAlimento
        idPrefix="agregar-alimento"
        alimentosDisponibles={alimentosDisponibles}
        onAlimentoCreado={handleAlimentoCreado}
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
