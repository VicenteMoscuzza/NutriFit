import { type FormEvent, useEffect, useRef, useState } from 'react'
import SelectorAlimento from './SelectorAlimento'
import { type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import { crearComida, type ComidaGuardada, type ComidaRegistrada } from '../api/nutricion'

type Pendiente =
  | { tipo: 'alimento'; clave: number; alimento: Alimento; cantidadGramos: number }
  | { tipo: 'guardada'; clave: number; comidaGuardada: ComidaGuardada }

interface Macros {
  calorias: number
  proteina: number
  carbohidratos: number
  grasa: number
}

const MACROS_VACIOS: Macros = { calorias: 0, proteina: 0, carbohidratos: 0, grasa: 0 }

function macrosDe(alimento: Alimento | undefined, cantidadGramos: number): Macros {
  if (!alimento) {
    return MACROS_VACIOS
  }
  const factor = cantidadGramos / 100
  return {
    calorias: alimento.caloriasPor100g * factor,
    proteina: alimento.proteinaPor100g * factor,
    carbohidratos: alimento.carbohidratosPor100g * factor,
    grasa: alimento.grasaPor100g * factor,
  }
}

function sumarMacros(a: Macros, b: Macros): Macros {
  return {
    calorias: a.calorias + b.calorias,
    proteina: a.proteina + b.proteina,
    carbohidratos: a.carbohidratos + b.carbohidratos,
    grasa: a.grasa + b.grasa,
  }
}

interface ModalNuevaComidaProps {
  numero: number
  alimentosDisponibles: Alimento[]
  comidasGuardadas: ComidaGuardada[]
  onAlimentoCreado: (alimento: Alimento) => void
  onCreada: (comida: ComidaRegistrada) => void
  onCerrar: () => void
}

export default function ModalNuevaComida({
  numero,
  alimentosDisponibles,
  comidasGuardadas,
  onAlimentoCreado,
  onCreada,
  onCerrar,
}: ModalNuevaComidaProps) {
  const [pestania, setPestania] = useState<'alimentos' | 'guardadas'>('alimentos')
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [alimentosCreados, setAlimentosCreados] = useState<Alimento[]>([])
  const [comidaGuardadaSeleccionada, setComidaGuardadaSeleccionada] = useState(
    comidasGuardadas.length > 0 ? String(comidasGuardadas[0].id) : '',
  )
  const siguienteClave = useRef(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !guardando) {
        onCerrar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [guardando, onCerrar])

  function buscarAlimento(id: number) {
    return alimentosDisponibles.find((a) => a.id === id) ?? alimentosCreados.find((a) => a.id === id)
  }

  function macrosDePendiente(pendiente: Pendiente): Macros {
    if (pendiente.tipo === 'alimento') {
      return macrosDe(pendiente.alimento, pendiente.cantidadGramos)
    }
    return pendiente.comidaGuardada.items
      .map((item) => macrosDe(buscarAlimento(item.alimentoId), item.cantidadGramos))
      .reduce(sumarMacros, MACROS_VACIOS)
  }

  function handleAlimentoCreado(alimento: Alimento) {
    setAlimentosCreados((actuales) => [...actuales, alimento])
    onAlimentoCreado(alimento)
  }

  async function handleAgregarAlimento(alimentoId: number, cantidadGramos: number) {
    const alimento = buscarAlimento(alimentoId)
    if (!alimento) {
      throw new Error('Alimento no encontrado')
    }
    const clave = siguienteClave.current++
    setError('')
    setPendientes((actuales) => [...actuales, { tipo: 'alimento', clave, alimento, cantidadGramos }])
  }

  function handleAgregarGuardada(event: FormEvent) {
    event.preventDefault()
    const comidaGuardada = comidasGuardadas.find((c) => String(c.id) === comidaGuardadaSeleccionada)
    if (!comidaGuardada) {
      setError('Elegí una comida guardada')
      return
    }
    const clave = siguienteClave.current++
    setError('')
    setPendientes((actuales) => [...actuales, { tipo: 'guardada', clave, comidaGuardada }])
  }

  async function handleGuardar() {
    if (pendientes.length === 0) {
      setError('Agregá al menos un alimento o una comida guardada')
      return
    }
    setError('')
    setGuardando(true)
    try {
      const items = pendientes.flatMap((p) =>
        p.tipo === 'alimento' ? [{ alimentoId: p.alimento.id, cantidadGramos: p.cantidadGramos }] : [],
      )
      const comidasGuardadasIds = pendientes.flatMap((p) => (p.tipo === 'guardada' ? [p.comidaGuardada.id] : []))
      const creada = await crearComida(items, comidasGuardadasIds)
      onCreada(creada)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la comida')
      setGuardando(false)
    }
  }

  const total = pendientes.map(macrosDePendiente).reduce(sumarMacros, MACROS_VACIOS)

  return (
    <div className="modal-fondo" onMouseDown={(event) => event.target === event.currentTarget && !guardando && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-nueva-comida-titulo">
        <div className="modal-header">
          <h2 id="modal-nueva-comida-titulo">Comida {numero}</h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar} disabled={guardando} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="modal-cuerpo">
          <div className="modal-pestanias" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={pestania === 'alimentos'}
              className={pestania === 'alimentos' ? 'dia-tab dia-tab-activo' : 'dia-tab'}
              onClick={() => setPestania('alimentos')}
            >
              Alimentos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pestania === 'guardadas'}
              className={pestania === 'guardadas' ? 'dia-tab dia-tab-activo' : 'dia-tab'}
              onClick={() => setPestania('guardadas')}
            >
              Comida guardada
            </button>
          </div>

          {pestania === 'alimentos' && (
            <SelectorAlimento
              idPrefix="nueva-comida"
              alimentosDisponibles={alimentosDisponibles}
              onAlimentoCreado={handleAlimentoCreado}
              onAgregar={handleAgregarAlimento}
              textoBoton="Agregar a la comida"
            />
          )}

          {pestania === 'guardadas' &&
            (comidasGuardadas.length === 0 ? (
              <p className="dia-vacio">Todavía no tenés comidas guardadas.</p>
            ) : (
              <form className="auth-form" onSubmit={handleAgregarGuardada} noValidate>
                <label htmlFor="nueva-comida-guardada">Comida guardada</label>
                <select
                  id="nueva-comida-guardada"
                  value={comidaGuardadaSeleccionada}
                  onChange={(event) => setComidaGuardadaSeleccionada(event.target.value)}
                >
                  {comidasGuardadas.map((guardada) => (
                    <option key={guardada.id} value={guardada.id}>
                      {guardada.nombre} ({guardada.items.length} alimentos)
                    </option>
                  ))}
                </select>
                <button type="submit">Agregar a la comida</button>
              </form>
            ))}

          <div className="modal-resumen">
            <h3>En esta comida</h3>
            {pendientes.length === 0 ? (
              <p className="dia-vacio">Todavía no agregaste nada.</p>
            ) : (
              <ul className="lista-ejercicios">
                {pendientes.map((pendiente) => (
                  <li key={pendiente.clave}>
                    <span className="nombre">
                      {pendiente.tipo === 'alimento' ? pendiente.alimento.nombre : pendiente.comidaGuardada.nombre}
                    </span>
                    <span className="grupo">
                      {pendiente.tipo === 'alimento'
                        ? `${pendiente.cantidadGramos} g`
                        : `Comida guardada · ${pendiente.comidaGuardada.items.length} alimentos`}{' '}
                      · {macrosDePendiente(pendiente).calorias.toFixed(0)} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendientes((actuales) => actuales.filter((p) => p.clave !== pendiente.clave))}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="entrenamiento-objetivo">
              Total: {total.calorias.toFixed(0)} kcal · {total.proteina.toFixed(1)}p · {total.carbohidratos.toFixed(1)}c
              · {total.grasa.toFixed(1)}g
            </p>
          </div>

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="modal-acciones">
          <button type="button" className="btn-ghost" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="button" onClick={handleGuardar} disabled={guardando || pendientes.length === 0}>
            {guardando ? 'Guardando...' : `Guardar comida ${numero}`}
          </button>
        </div>
      </div>
    </div>
  )
}
