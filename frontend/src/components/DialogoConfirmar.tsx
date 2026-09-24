import { useState } from 'react'
import Modal from './Modal'
import { IconoAlerta } from './Iconos'
import { ApiError } from '../api/client'

interface DialogoConfirmarProps {
  titulo: string
  mensaje: string
  textoConfirmar?: string
  onConfirmar: () => Promise<void>
  onCerrar: () => void
}

export default function DialogoConfirmar({
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  onConfirmar,
  onCerrar,
}: DialogoConfirmarProps) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmar() {
    setError('')
    setProcesando(true)
    try {
      await onConfirmar()
      onCerrar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar la acción')
      setProcesando(false)
    }
  }

  return (
    <Modal
      titulo={titulo}
      icono={<IconoAlerta />}
      tamanio="chico"
      onCerrar={onCerrar}
      bloqueado={procesando}
      pie={
        <>
          <button type="button" className="btn btn-secundario" onClick={onCerrar} disabled={procesando} data-autofocus>
            Cancelar
          </button>
          <button type="button" className="btn btn-peligro" onClick={handleConfirmar} disabled={procesando}>
            {procesando ? 'Eliminando...' : textoConfirmar}
          </button>
        </>
      }
    >
      <p className="modal-mensaje">{mensaje}</p>
      {error && <p className="field-error">{error}</p>}
    </Modal>
  )
}
