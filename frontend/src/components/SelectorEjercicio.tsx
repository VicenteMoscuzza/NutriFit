import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react'
import { crearEjercicio, type Ejercicio } from '../api/ejercicios'
import { ApiError } from '../api/client'
import { coincide } from '../utils/texto'
import { IconoBuscar, IconoCheck, IconoMas, IconoMenos, IconoVolver } from './Iconos'

const GRUPOS_MUSCULARES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']

interface SelectorEjercicioProps {
  idPrefix: string
  ejerciciosDisponibles: Ejercicio[]
  onEjercicioCreado: (ejercicio: Ejercicio) => void
  onAgregar: (ejercicio: Ejercicio, seriesObjetivo: number, repeticionesObjetivo: number) => Promise<void>
  textoBoton?: string
}

interface ContadorProps {
  id: string
  etiqueta: string
  valor: number
  onCambiar: (valor: number) => void
}

function Contador({ id, etiqueta, valor, onCambiar }: ContadorProps) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="contador">
        <button
          type="button"
          onClick={() => onCambiar(Math.max(1, valor - 1))}
          disabled={valor <= 1}
          aria-label={`Restar ${etiqueta.toLowerCase()}`}
        >
          <IconoMenos tamanio={16} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          value={valor}
          onChange={(event) => onCambiar(Math.max(1, Math.floor(Number(event.target.value)) || 1))}
        />
        <button type="button" onClick={() => onCambiar(valor + 1)} aria-label={`Sumar ${etiqueta.toLowerCase()}`}>
          <IconoMas tamanio={16} />
        </button>
      </div>
    </div>
  )
}

export default function SelectorEjercicio({
  idPrefix,
  ejerciciosDisponibles,
  onEjercicioCreado,
  onAgregar,
  textoBoton = 'Agregar',
}: SelectorEjercicioProps) {
  const [busqueda, setBusqueda] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState<string | null>(null)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const [modoCrear, setModoCrear] = useState(ejerciciosDisponibles.length === 0)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [grupoNuevo, setGrupoNuevo] = useState(GRUPOS_MUSCULARES[0])
  const [series, setSeries] = useState(4)
  const [repeticiones, setRepeticiones] = useState(10)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const busquedaRef = useRef<HTMLInputElement>(null)

  const filtrados = ejerciciosDisponibles.filter(
    (e) => (grupoFiltro === null || e.grupoMuscular === grupoFiltro) && coincide(e.nombre, busqueda),
  )
  const seleccionado = ejerciciosDisponibles.find((e) => e.id === seleccionadoId)

  function abrirCrear() {
    setError('')
    setNombreNuevo(busqueda.trim())
    if (grupoFiltro) {
      setGrupoNuevo(grupoFiltro)
    }
    setModoCrear(true)
  }

  function elegir(ejercicio: Ejercicio) {
    setError('')
    setSeleccionadoId(ejercicio.id)
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
        setError('Ingresá un nombre para el ejercicio')
        return
      }
    } else if (!seleccionado) {
      setError('Elegí un ejercicio de la lista')
      return
    }

    setError('')
    setGuardando(true)
    try {
      let ejercicio: Ejercicio
      if (modoCrear) {
        ejercicio = await crearEjercicio(nombreNuevo.trim(), grupoNuevo)
        onEjercicioCreado(ejercicio)
        setNombreNuevo('')
        setModoCrear(false)
      } else {
        ejercicio = seleccionado!
      }

      await onAgregar(ejercicio, series, repeticiones)
      setSeleccionadoId(null)
      setBusqueda('')
      busquedaRef.current?.focus()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el ejercicio')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="selector" onSubmit={handleSubmit} noValidate>
      {!modoCrear ? (
        <div className="campo">
          <label htmlFor={`${idPrefix}-buscar`}>Ejercicio</label>
          <div className="buscador">
            <IconoBuscar tamanio={16} />
            <input
              ref={busquedaRef}
              id={`${idPrefix}-buscar`}
              type="search"
              placeholder="Buscar ejercicio..."
              autoComplete="off"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              onKeyDown={handleBusquedaKeyDown}
              data-autofocus
            />
          </div>

          <div className="chips chips-scroll">
            <button
              type="button"
              className={grupoFiltro === null ? 'chip chip-activo' : 'chip'}
              onClick={() => setGrupoFiltro(null)}
            >
              Todos
            </button>
            {GRUPOS_MUSCULARES.map((grupo) => (
              <button
                key={grupo}
                type="button"
                className={grupoFiltro === grupo ? 'chip chip-activo' : 'chip'}
                onClick={() => setGrupoFiltro((actual) => (actual === grupo ? null : grupo))}
              >
                {grupo}
              </button>
            ))}
          </div>

          <div className="opciones">
            {filtrados.map((ejercicio) => {
              const activo = ejercicio.id === seleccionadoId
              return (
                <button
                  key={ejercicio.id}
                  type="button"
                  className={activo ? 'opcion opcion-activa' : 'opcion'}
                  aria-pressed={activo}
                  onClick={() => elegir(ejercicio)}
                >
                  <span className="opcion-texto">
                    <span className="opcion-nombre">{ejercicio.nombre}</span>
                    <span className="opcion-detalle">{ejercicio.grupoMuscular}</span>
                  </span>
                  {!ejercicio.esGlobal && <span className="etiqueta etiqueta-propio">Propio</span>}
                  <span className="opcion-check">
                    <IconoCheck tamanio={14} strokeWidth={3} />
                  </span>
                </button>
              )
            })}
            {filtrados.length === 0 && (
              <p className="opciones-vacio">
                {busqueda.trim() ? `No encontramos "${busqueda.trim()}".` : 'No hay ejercicios en este grupo.'}
              </p>
            )}
          </div>

          <button type="button" className="btn-crear-nuevo" onClick={abrirCrear}>
            <IconoMas tamanio={16} />
            {busqueda.trim() && filtrados.length === 0 ? `Crear "${busqueda.trim()}"` : 'Crear ejercicio nuevo'}
          </button>
        </div>
      ) : (
        <div className="panel-crear">
          <div className="panel-crear-header">
            <span className="panel-crear-titulo">Nuevo ejercicio</span>
            {ejerciciosDisponibles.length > 0 && (
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setError('')
                  setModoCrear(false)
                }}
              >
                <IconoVolver tamanio={14} /> Volver a la lista
              </button>
            )}
          </div>

          <div className="campo">
            <label htmlFor={`${idPrefix}-nombre-nuevo`}>Nombre</label>
            <input
              id={`${idPrefix}-nombre-nuevo`}
              className="input"
              placeholder="Ej: Press inclinado con mancuernas"
              value={nombreNuevo}
              onChange={(event) => setNombreNuevo(event.target.value)}
              data-autofocus
            />
          </div>

          <div className="campo">
            <span className="campo-etiqueta">Grupo muscular</span>
            <div className="chips">
              {GRUPOS_MUSCULARES.map((grupo) => (
                <button
                  key={grupo}
                  type="button"
                  className={grupoNuevo === grupo ? 'chip chip-activo' : 'chip'}
                  aria-pressed={grupoNuevo === grupo}
                  onClick={() => setGrupoNuevo(grupo)}
                >
                  {grupo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="campos-grilla">
        <Contador id={`${idPrefix}-series`} etiqueta="Series" valor={series} onCambiar={setSeries} />
        <Contador id={`${idPrefix}-reps`} etiqueta="Repeticiones" valor={repeticiones} onCambiar={setRepeticiones} />
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" className="btn btn-primario btn-bloque" disabled={guardando}>
        <IconoMas tamanio={16} />
        {guardando ? 'Agregando...' : textoBoton}
      </button>
    </form>
  )
}
