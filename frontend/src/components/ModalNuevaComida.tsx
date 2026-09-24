import { useRef, useState } from 'react'
import Modal from './Modal'
import SelectorAlimento from './SelectorAlimento'
import { IconoBasura, IconoMas, IconoPlato } from './Iconos'
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

function BarraMacros({ macros }: { macros: Macros }) {
  const kcalProteina = macros.proteina * 4
  const kcalCarbos = macros.carbohidratos * 4
  const kcalGrasa = macros.grasa * 9
  const total = kcalProteina + kcalCarbos + kcalGrasa

  return (
    <div className="barra-macros-bloque">
      <div className="barra-macros-totales">
        <span className="barra-macros-kcal">
          <strong>{macros.calorias.toFixed(0)}</strong> kcal
        </span>
        <span className="barra-macros-leyenda">
          <span className="macro-punto macro-proteina">P {macros.proteina.toFixed(1)}</span>
          <span className="macro-punto macro-carbos">C {macros.carbohidratos.toFixed(1)}</span>
          <span className="macro-punto macro-grasa">G {macros.grasa.toFixed(1)}</span>
        </span>
      </div>
      <div className="barra-macros" aria-hidden="true">
        {total > 0 && (
          <>
            <span className="macro-proteina" style={{ width: `${(kcalProteina / total) * 100}%` }} />
            <span className="macro-carbos" style={{ width: `${(kcalCarbos / total) * 100}%` }} />
            <span className="macro-grasa" style={{ width: `${(kcalGrasa / total) * 100}%` }} />
          </>
        )}
      </div>
    </div>
  )
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
  const siguienteClave = useRef(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function buscarAlimento(id: number) {
    return alimentosDisponibles.find((a) => a.id === id) ?? alimentosCreados.find((a) => a.id === id)
  }

  function macrosDeGuardada(comidaGuardada: ComidaGuardada): Macros {
    return comidaGuardada.items
      .map((item) => macrosDe(buscarAlimento(item.alimentoId), item.cantidadGramos))
      .reduce(sumarMacros, MACROS_VACIOS)
  }

  function macrosDePendiente(pendiente: Pendiente): Macros {
    if (pendiente.tipo === 'alimento') {
      return macrosDe(pendiente.alimento, pendiente.cantidadGramos)
    }
    return macrosDeGuardada(pendiente.comidaGuardada)
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

  function handleAgregarGuardada(comidaGuardada: ComidaGuardada) {
    const clave = siguienteClave.current++
    setError('')
    setPendientes((actuales) => [...actuales, { tipo: 'guardada', clave, comidaGuardada }])
  }

  async function handleGuardar() {
    if (pendientes.length === 0) {
      setError('Agregá al menos un alimento o una de tus comidas')
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
    <Modal
      titulo={`Comida ${numero}`}
      subtitulo="Sumá alimentos sueltos o cargá una de tus comidas guardadas."
      icono={<IconoPlato />}
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
            {guardando ? 'Guardando...' : `Guardar comida ${numero}`}
          </button>
        </>
      }
    >
      <div className="segmentado" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={pestania === 'alimentos'}
          className={pestania === 'alimentos' ? 'segmento segmento-activo' : 'segmento'}
          onClick={() => setPestania('alimentos')}
        >
          Alimentos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestania === 'guardadas'}
          className={pestania === 'guardadas' ? 'segmento segmento-activo' : 'segmento'}
          onClick={() => setPestania('guardadas')}
        >
          Mis comidas
          {comidasGuardadas.length > 0 && <span className="segmento-contador">{comidasGuardadas.length}</span>}
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
          <p className="resumen-vacio">Todavía no creaste ninguna comida en Mis comidas.</p>
        ) : (
          <div className="opciones opciones-altas">
            {comidasGuardadas.map((guardada) => (
              <button
                key={guardada.id}
                type="button"
                className="opcion"
                onClick={() => handleAgregarGuardada(guardada)}
              >
                <span className="opcion-texto">
                  <span className="opcion-nombre">{guardada.nombre}</span>
                  <span className="opcion-detalle">
                    {guardada.items.length} {guardada.items.length === 1 ? 'alimento' : 'alimentos'} ·{' '}
                    {macrosDeGuardada(guardada).calorias.toFixed(0)} kcal
                  </span>
                </span>
                <span className="opcion-agregar">
                  <IconoMas tamanio={16} />
                </span>
              </button>
            ))}
          </div>
        ))}

      <div className="resumen">
        <div className="resumen-header">
          <h3>En esta comida</h3>
          {pendientes.length > 0 && <span className="resumen-contador">{pendientes.length}</span>}
        </div>
        {pendientes.length === 0 ? (
          <p className="resumen-vacio">Lo que agregues va a aparecer acá.</p>
        ) : (
          <ul className="resumen-lista">
            {pendientes.map((pendiente) => (
              <li key={pendiente.clave} className="resumen-item">
                <span className="resumen-texto">
                  <span className="resumen-nombre">
                    {pendiente.tipo === 'alimento' ? pendiente.alimento.nombre : pendiente.comidaGuardada.nombre}
                  </span>
                  <span className="resumen-detalle">
                    {pendiente.tipo === 'alimento'
                      ? `${pendiente.cantidadGramos} g`
                      : `Mis comidas · ${pendiente.comidaGuardada.items.length} alimentos`}
                  </span>
                </span>
                <span className="resumen-kcal">{macrosDePendiente(pendiente).calorias.toFixed(0)} kcal</span>
                <button
                  type="button"
                  className="btn-icono-quitar"
                  aria-label="Quitar"
                  onClick={() => setPendientes((actuales) => actuales.filter((p) => p.clave !== pendiente.clave))}
                >
                  <IconoBasura tamanio={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <BarraMacros macros={total} />
      </div>

      {error && <p className="field-error">{error}</p>}
    </Modal>
  )
}
