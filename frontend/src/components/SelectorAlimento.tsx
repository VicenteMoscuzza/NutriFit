import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react'
import { crearAlimento, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import { coincide } from '../utils/texto'
import { IconoBuscar, IconoCheck, IconoMas, IconoVolver } from './Iconos'

const CANTIDADES_RAPIDAS = [50, 100, 150, 200]

interface SelectorAlimentoProps {
  idPrefix: string
  alimentosDisponibles: Alimento[]
  onAlimentoCreado: (alimento: Alimento) => void
  onAgregar: (alimentoId: number, cantidadGramos: number) => Promise<void>
  textoBoton?: string
}

function formatear(valor: number, decimales = 1) {
  return Number.isFinite(valor) ? valor.toFixed(decimales) : '0'
}

export default function SelectorAlimento({
  idPrefix,
  alimentosDisponibles,
  onAlimentoCreado,
  onAgregar,
  textoBoton = 'Agregar',
}: SelectorAlimentoProps) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const [modoCrear, setModoCrear] = useState(alimentosDisponibles.length === 0)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [caloriasNuevo, setCaloriasNuevo] = useState('')
  const [proteinaNuevo, setProteinaNuevo] = useState('')
  const [carbohidratosNuevo, setCarbohidratosNuevo] = useState('')
  const [grasaNuevo, setGrasaNuevo] = useState('')
  const [cantidadGramos, setCantidadGramos] = useState('100')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const busquedaRef = useRef<HTMLInputElement>(null)

  const filtrados = alimentosDisponibles.filter((a) => coincide(a.nombre, busqueda))
  const seleccionado = alimentosDisponibles.find((a) => a.id === seleccionadoId)
  const cantidad = Number(cantidadGramos)

  const base = modoCrear
    ? {
        calorias: Number(caloriasNuevo) || 0,
        proteina: Number(proteinaNuevo) || 0,
        carbohidratos: Number(carbohidratosNuevo) || 0,
        grasa: Number(grasaNuevo) || 0,
      }
    : seleccionado
      ? {
          calorias: seleccionado.caloriasPor100g,
          proteina: seleccionado.proteinaPor100g,
          carbohidratos: seleccionado.carbohidratosPor100g,
          grasa: seleccionado.grasaPor100g,
        }
      : null
  const factor = cantidad > 0 ? cantidad / 100 : 0

  function abrirCrear() {
    setError('')
    setNombreNuevo(busqueda.trim())
    setModoCrear(true)
  }

  function volverALista() {
    setError('')
    setModoCrear(false)
  }

  function elegir(alimento: Alimento) {
    setError('')
    setSeleccionadoId(alimento.id)
  }

  function handleBusquedaKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (filtrados.length > 0) {
        elegir(filtrados[0])
      }
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (modoCrear) {
      if (!nombreNuevo.trim()) {
        setError('Ingresá un nombre para el alimento')
        return
      }
    } else if (!seleccionado) {
      setError('Elegí un alimento de la lista')
      return
    }

    if (cantidadGramos.trim() === '' || Number.isNaN(cantidad) || cantidad <= 0) {
      setError('Ingresá una cantidad en gramos válida')
      return
    }

    setError('')
    setGuardando(true)
    try {
      let alimentoId: number
      if (modoCrear) {
        const valores = [caloriasNuevo, proteinaNuevo, carbohidratosNuevo, grasaNuevo]
        if (valores.some((v) => v.trim() === '' || Number.isNaN(Number(v)) || Number(v) < 0)) {
          setError('Completá los valores nutricionales del alimento')
          setGuardando(false)
          return
        }
        const [calorias, proteina, carbohidratos, grasa] = valores.map(Number)
        const nuevo = await crearAlimento(nombreNuevo.trim(), calorias, proteina, carbohidratos, grasa)
        onAlimentoCreado(nuevo)
        alimentoId = nuevo.id
        setNombreNuevo('')
        setCaloriasNuevo('')
        setProteinaNuevo('')
        setCarbohidratosNuevo('')
        setGrasaNuevo('')
        setModoCrear(false)
      } else {
        alimentoId = seleccionado!.id
      }

      await onAgregar(alimentoId, cantidad)
      setCantidadGramos('100')
      setSeleccionadoId(null)
      setBusqueda('')
      busquedaRef.current?.focus()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el alimento')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="selector" onSubmit={handleSubmit} noValidate>
      {!modoCrear ? (
        <div className="campo">
          <label htmlFor={`${idPrefix}-buscar`}>Alimento</label>
          <div className="buscador">
            <IconoBuscar tamanio={16} />
            <input
              ref={busquedaRef}
              id={`${idPrefix}-buscar`}
              type="search"
              placeholder="Buscar alimento..."
              autoComplete="off"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              onKeyDown={handleBusquedaKeyDown}
              data-autofocus
            />
          </div>

          <div className="opciones">
            {filtrados.map((alimento) => {
              const activo = alimento.id === seleccionadoId
              return (
                <button
                  key={alimento.id}
                  type="button"
                  className={activo ? 'opcion opcion-activa' : 'opcion'}
                  aria-pressed={activo}
                  onClick={() => elegir(alimento)}
                >
                  <span className="opcion-texto">
                    <span className="opcion-nombre">{alimento.nombre}</span>
                    <span className="opcion-detalle">
                      {formatear(alimento.caloriasPor100g, 0)} kcal · P {formatear(alimento.proteinaPor100g)} · C{' '}
                      {formatear(alimento.carbohidratosPor100g)} · G {formatear(alimento.grasaPor100g)}
                      <span className="opcion-unidad"> / 100 g</span>
                    </span>
                  </span>
                  {!alimento.esGlobal && <span className="etiqueta etiqueta-propio">Propio</span>}
                  <span className="opcion-check">
                    <IconoCheck tamanio={14} strokeWidth={3} />
                  </span>
                </button>
              )
            })}
            {filtrados.length === 0 && (
              <p className="opciones-vacio">
                {busqueda.trim() ? `No encontramos "${busqueda.trim()}".` : 'Todavía no hay alimentos.'}
              </p>
            )}
          </div>

          <button type="button" className="btn-crear-nuevo" onClick={abrirCrear}>
            <IconoMas tamanio={16} />
            {busqueda.trim() && filtrados.length === 0 ? `Crear "${busqueda.trim()}"` : 'Crear alimento nuevo'}
          </button>
        </div>
      ) : (
        <div className="panel-crear">
          <div className="panel-crear-header">
            <span className="panel-crear-titulo">Nuevo alimento</span>
            {alimentosDisponibles.length > 0 && (
              <button type="button" className="btn-link" onClick={volverALista}>
                <IconoVolver tamanio={14} /> Volver a la lista
              </button>
            )}
          </div>

          <div className="campo">
            <label htmlFor={`${idPrefix}-nombre-nuevo`}>Nombre</label>
            <input
              id={`${idPrefix}-nombre-nuevo`}
              className="input"
              placeholder="Ej: Pechuga de pollo"
              value={nombreNuevo}
              onChange={(event) => setNombreNuevo(event.target.value)}
              data-autofocus
            />
          </div>

          <p className="panel-crear-ayuda">Valores cada 100 g</p>
          <div className="campos-grilla">
            {[
              { id: 'calorias', etiqueta: 'Calorías', sufijo: 'kcal', valor: caloriasNuevo, set: setCaloriasNuevo },
              { id: 'proteina', etiqueta: 'Proteína', sufijo: 'g', valor: proteinaNuevo, set: setProteinaNuevo },
              {
                id: 'carbohidratos',
                etiqueta: 'Carbohidratos',
                sufijo: 'g',
                valor: carbohidratosNuevo,
                set: setCarbohidratosNuevo,
              },
              { id: 'grasa', etiqueta: 'Grasa', sufijo: 'g', valor: grasaNuevo, set: setGrasaNuevo },
            ].map((campo) => (
              <div className="campo" key={campo.id}>
                <label htmlFor={`${idPrefix}-${campo.id}`}>{campo.etiqueta}</label>
                <div className="input-sufijo">
                  <input
                    id={`${idPrefix}-${campo.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.1"
                    placeholder="0"
                    value={campo.valor}
                    onChange={(event) => campo.set(event.target.value)}
                  />
                  <span>{campo.sufijo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="campo">
        <label htmlFor={`${idPrefix}-cantidad`}>Cantidad</label>
        <div className="cantidad-fila">
          <div className="input-sufijo cantidad-input">
            <input
              id={`${idPrefix}-cantidad`}
              type="number"
              inputMode="decimal"
              min={1}
              value={cantidadGramos}
              onChange={(event) => setCantidadGramos(event.target.value)}
            />
            <span>g</span>
          </div>
          <div className="chips">
            {CANTIDADES_RAPIDAS.map((valor) => (
              <button
                key={valor}
                type="button"
                className={cantidad === valor ? 'chip chip-activo' : 'chip'}
                onClick={() => setCantidadGramos(String(valor))}
              >
                {valor} g
              </button>
            ))}
          </div>
        </div>
      </div>

      {base && (
        <div className="macro-preview">
          <div className="macro-preview-item macro-kcal">
            <strong>{formatear(base.calorias * factor, 0)}</strong>
            <span>kcal</span>
          </div>
          <div className="macro-preview-item macro-proteina">
            <strong>{formatear(base.proteina * factor)}</strong>
            <span>proteína</span>
          </div>
          <div className="macro-preview-item macro-carbos">
            <strong>{formatear(base.carbohidratos * factor)}</strong>
            <span>carbos</span>
          </div>
          <div className="macro-preview-item macro-grasa">
            <strong>{formatear(base.grasa * factor)}</strong>
            <span>grasa</span>
          </div>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      <button type="submit" className="btn btn-primario btn-bloque" disabled={guardando}>
        <IconoMas tamanio={16} />
        {guardando ? 'Agregando...' : textoBoton}
      </button>
    </form>
  )
}
