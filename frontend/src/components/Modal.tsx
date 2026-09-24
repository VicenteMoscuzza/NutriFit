import { type ReactNode, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar } from './Iconos'

const FOCUSABLES = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, [href], [tabindex]:not([tabindex="-1"])'

interface ModalProps {
  titulo: string
  subtitulo?: string
  icono?: ReactNode
  onCerrar: () => void
  bloqueado?: boolean
  pie?: ReactNode
  tamanio?: 'chico' | 'normal'
  children: ReactNode
}

export default function Modal({
  titulo,
  subtitulo,
  icono,
  onCerrar,
  bloqueado = false,
  pie,
  tamanio = 'normal',
  children,
}: ModalProps) {
  const tituloId = useId()
  const dialogoRef = useRef<HTMLDivElement>(null)
  const onCerrarRef = useRef(onCerrar)
  const bloqueadoRef = useRef(bloqueado)

  useLayoutEffect(() => {
    onCerrarRef.current = onCerrar
    bloqueadoRef.current = bloqueado
  })

  useEffect(() => {
    const focoAnterior = document.activeElement as HTMLElement | null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialogo = dialogoRef.current
    const primero = dialogo?.querySelector<HTMLElement>('[data-autofocus]') ?? dialogo
    primero?.focus({ preventScroll: true })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !bloqueadoRef.current) {
        onCerrarRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogo) {
        return
      }
      const focusables = Array.from(dialogo.querySelectorAll<HTMLElement>(FOCUSABLES))
      if (focusables.length === 0) {
        return
      }
      const primerElemento = focusables[0]
      const ultimoElemento = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === primerElemento) {
        event.preventDefault()
        ultimoElemento.focus()
      } else if (!event.shiftKey && document.activeElement === ultimoElemento) {
        event.preventDefault()
        primerElemento.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflowAnterior
      focoAnterior?.focus?.({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <div
      className="modal-fondo"
      onMouseDown={(event) => event.target === event.currentTarget && !bloqueado && onCerrar()}
    >
      <div
        ref={dialogoRef}
        className={`modal modal-${tamanio}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
      >
        <div className="modal-header">
          {icono && <span className="modal-icono">{icono}</span>}
          <div className="modal-titulos">
            <h2 id={tituloId}>{titulo}</h2>
            {subtitulo && <p className="modal-subtitulo">{subtitulo}</p>}
          </div>
          <button type="button" className="modal-cerrar" onClick={onCerrar} disabled={bloqueado} aria-label="Cerrar">
            <IconoCerrar />
          </button>
        </div>

        <div className="modal-cuerpo">{children}</div>

        {pie && <div className="modal-acciones">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}
