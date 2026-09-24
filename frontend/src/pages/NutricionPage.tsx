import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ModalNuevaComida from '../components/ModalNuevaComida'
import Navbar from '../components/Navbar'
import SelectorAlimento from '../components/SelectorAlimento'
import { listarAlimentos, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import {
  agregarItemComida,
  cargarComidaGuardada,
  eliminarComida,
  eliminarItemRegistro,
  listarComidasGuardadas,
  obtenerRegistroDeHoy,
  type ComidaGuardada,
  type ComidaRegistrada,
  type ItemRegistro,
  type RegistroDiario,
} from '../api/nutricion'

interface ComidaCardProps {
  comida: ComidaRegistrada
  numero: number
  alimentosDisponibles: Alimento[]
  comidasGuardadas: ComidaGuardada[]
  onAlimentoCreado: (alimento: Alimento) => void
  onActualizada: (comida: ComidaRegistrada) => void
  onEliminada: (comidaId: number) => void
  onItemAgregado: (comidaId: number, item: ItemRegistro) => void
  onItemEliminado: (comidaId: number, itemId: number) => void
}

function ComidaCard({
  comida,
  numero,
  alimentosDisponibles,
  comidasGuardadas,
  onAlimentoCreado,
  onActualizada,
  onEliminada,
  onItemAgregado,
  onItemEliminado,
}: ComidaCardProps) {
  const [panelAbierto, setPanelAbierto] = useState<'alimento' | 'guardada' | null>(null)
  const [comidaGuardadaSeleccionada, setComidaGuardadaSeleccionada] = useState('')
  const [cargandoGuardada, setCargandoGuardada] = useState(false)
  const [error, setError] = useState('')
  const titulo = `Comida ${numero}`

  function alternarPanel(panel: 'alimento' | 'guardada') {
    setError('')
    const seleccionVigente = comidasGuardadas.some((c) => String(c.id) === comidaGuardadaSeleccionada)
    if (panel === 'guardada' && !seleccionVigente && comidasGuardadas.length > 0) {
      setComidaGuardadaSeleccionada(String(comidasGuardadas[0].id))
    }
    setPanelAbierto((actual) => (actual === panel ? null : panel))
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${titulo}" y todos sus alimentos?`)) {
      return
    }
    await eliminarComida(comida.id)
    onEliminada(comida.id)
  }

  async function handleQuitarItem(itemId: number) {
    await eliminarItemRegistro(itemId)
    onItemEliminado(comida.id, itemId)
  }

  async function handleCargarGuardada(event: FormEvent) {
    event.preventDefault()
    if (!comidaGuardadaSeleccionada) {
      setError('Elegí una de tus comidas')
      return
    }
    setError('')
    setCargandoGuardada(true)
    try {
      const actualizada = await cargarComidaGuardada(comida.id, Number(comidaGuardadaSeleccionada))
      onActualizada(actualizada)
      setPanelAbierto(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la comida')
    } finally {
      setCargandoGuardada(false)
    }
  }

  return (
    <div className="dia">
      <div className="dia-header">
        <h2>{titulo}</h2>
        <div className="dia-acciones">
          <button type="button" onClick={() => alternarPanel('alimento')}>
            {panelAbierto === 'alimento' ? 'Cancelar' : '+ Alimento'}
          </button>
          <button type="button" onClick={() => alternarPanel('guardada')}>
            {panelAbierto === 'guardada' ? 'Cancelar' : '+ Mis comidas'}
          </button>
          <button type="button" className="btn-quitar-dia" onClick={handleEliminar}>
            Eliminar
          </button>
        </div>
      </div>

      <p className="entrenamiento-objetivo">
        {comida.subtotalCalorias.toFixed(0)} kcal · {comida.subtotalProteina.toFixed(1)}p ·{' '}
        {comida.subtotalCarbohidratos.toFixed(1)}c · {comida.subtotalGrasa.toFixed(1)}g
      </p>

      {comida.items.length === 0 ? (
        <p className="dia-vacio">Sin alimentos. Agregá alimentos o cargá una de Mis comidas.</p>
      ) : (
        <ul className="lista-ejercicios">
          {comida.items.map((item) => (
            <li key={item.id}>
              <span className="nombre">{item.nombreAlimento}</span>
              <span className="grupo">
                {item.cantidadGramos} g · {item.caloriasCalculadas.toFixed(0)} kcal
              </span>
              <button type="button" onClick={() => handleQuitarItem(item.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {panelAbierto === 'alimento' && (
        <SelectorAlimento
          idPrefix={`comida-${comida.id}`}
          alimentosDisponibles={alimentosDisponibles}
          onAlimentoCreado={onAlimentoCreado}
          onAgregar={async (alimentoId, cantidadGramos) => {
            const creado = await agregarItemComida(comida.id, alimentoId, cantidadGramos)
            onItemAgregado(comida.id, creado)
          }}
        />
      )}

      {panelAbierto === 'guardada' &&
        (comidasGuardadas.length === 0 ? (
          <p className="dia-vacio">Todavía no creaste ninguna comida en Mis comidas.</p>
        ) : (
          <form className="auth-form" onSubmit={handleCargarGuardada} noValidate>
            <label htmlFor={`comida-${comida.id}-guardada`}>Mis comidas</label>
            <select
              id={`comida-${comida.id}-guardada`}
              value={comidaGuardadaSeleccionada}
              onChange={(event) => setComidaGuardadaSeleccionada(event.target.value)}
            >
              {comidasGuardadas.map((guardada) => (
                <option key={guardada.id} value={guardada.id}>
                  {guardada.nombre} ({guardada.items.length} alimentos)
                </option>
              ))}
            </select>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" disabled={cargandoGuardada}>
              {cargandoGuardada ? 'Cargando...' : 'Cargar alimentos'}
            </button>
          </form>
        ))}
    </div>
  )
}

function registroVacio(): RegistroDiario {
  return {
    id: null,
    fecha: new Date().toISOString().slice(0, 10),
    comidas: [],
    totalCalorias: 0,
    totalProteina: 0,
    totalCarbohidratos: 0,
    totalGrasa: 0,
  }
}

export default function NutricionPage() {
  const [registro, setRegistro] = useState<RegistroDiario | null>(null)
  const [comidasGuardadas, setComidasGuardadas] = useState<ComidaGuardada[]>([])
  const [alimentosDisponibles, setAlimentosDisponibles] = useState<Alimento[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    Promise.all([obtenerRegistroDeHoy(), listarComidasGuardadas(), listarAlimentos()])
      .then(([registroData, comidasGuardadasData, alimentosData]) => {
        setRegistro(registroData)
        setComidasGuardadas(comidasGuardadasData)
        setAlimentosDisponibles(alimentosData)
      })
      .finally(() => setCargando(false))
  }, [])

  function handleAlimentoCreado(alimento: Alimento) {
    setAlimentosDisponibles((actuales) => [...actuales, alimento])
  }

  function agregarComidaARegistro(actual: RegistroDiario | null, nueva: ComidaRegistrada): RegistroDiario {
    const base = actual ?? registroVacio()
    return {
      ...base,
      comidas: [...base.comidas, nueva],
      totalCalorias: base.totalCalorias + nueva.subtotalCalorias,
      totalProteina: base.totalProteina + nueva.subtotalProteina,
      totalCarbohidratos: base.totalCarbohidratos + nueva.subtotalCarbohidratos,
      totalGrasa: base.totalGrasa + nueva.subtotalGrasa,
    }
  }

  const cerrarModal = useCallback(() => setModalAbierto(false), [])

  function handleComidaCreada(creada: ComidaRegistrada) {
    setRegistro((actual) => agregarComidaARegistro(actual, creada))
    setModalAbierto(false)
  }

  function handleComidaActualizada(actualizada: ComidaRegistrada) {
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      const anterior = actual.comidas.find((c) => c.id === actualizada.id)
      if (!anterior) {
        return actual
      }
      return {
        ...actual,
        comidas: actual.comidas.map((c) => (c.id === actualizada.id ? actualizada : c)),
        totalCalorias: actual.totalCalorias - anterior.subtotalCalorias + actualizada.subtotalCalorias,
        totalProteina: actual.totalProteina - anterior.subtotalProteina + actualizada.subtotalProteina,
        totalCarbohidratos:
          actual.totalCarbohidratos - anterior.subtotalCarbohidratos + actualizada.subtotalCarbohidratos,
        totalGrasa: actual.totalGrasa - anterior.subtotalGrasa + actualizada.subtotalGrasa,
      }
    })
  }

  function handleComidaEliminada(comidaId: number) {
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      const comida = actual.comidas.find((c) => c.id === comidaId)
      if (!comida) {
        return actual
      }
      return {
        ...actual,
        comidas: actual.comidas.filter((c) => c.id !== comidaId),
        totalCalorias: actual.totalCalorias - comida.subtotalCalorias,
        totalProteina: actual.totalProteina - comida.subtotalProteina,
        totalCarbohidratos: actual.totalCarbohidratos - comida.subtotalCarbohidratos,
        totalGrasa: actual.totalGrasa - comida.subtotalGrasa,
      }
    })
  }

  function handleItemAgregado(comidaId: number, item: ItemRegistro) {
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      return {
        ...actual,
        comidas: actual.comidas.map((c) =>
          c.id === comidaId
            ? {
                ...c,
                items: [...c.items, item],
                subtotalCalorias: c.subtotalCalorias + item.caloriasCalculadas,
                subtotalProteina: c.subtotalProteina + item.proteinaCalculada,
                subtotalCarbohidratos: c.subtotalCarbohidratos + item.carbohidratosCalculados,
                subtotalGrasa: c.subtotalGrasa + item.grasaCalculada,
              }
            : c,
        ),
        totalCalorias: actual.totalCalorias + item.caloriasCalculadas,
        totalProteina: actual.totalProteina + item.proteinaCalculada,
        totalCarbohidratos: actual.totalCarbohidratos + item.carbohidratosCalculados,
        totalGrasa: actual.totalGrasa + item.grasaCalculada,
      }
    })
  }

  function handleItemEliminado(comidaId: number, itemId: number) {
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      const comida = actual.comidas.find((c) => c.id === comidaId)
      const item = comida?.items.find((i) => i.id === itemId)
      if (!comida || !item) {
        return actual
      }
      return {
        ...actual,
        comidas: actual.comidas.map((c) =>
          c.id === comidaId
            ? {
                ...c,
                items: c.items.filter((i) => i.id !== itemId),
                subtotalCalorias: c.subtotalCalorias - item.caloriasCalculadas,
                subtotalProteina: c.subtotalProteina - item.proteinaCalculada,
                subtotalCarbohidratos: c.subtotalCarbohidratos - item.carbohidratosCalculados,
                subtotalGrasa: c.subtotalGrasa - item.grasaCalculada,
              }
            : c,
        ),
        totalCalorias: actual.totalCalorias - item.caloriasCalculadas,
        totalProteina: actual.totalProteina - item.proteinaCalculada,
        totalCarbohidratos: actual.totalCarbohidratos - item.carbohidratosCalculados,
        totalGrasa: actual.totalGrasa - item.grasaCalculada,
      }
    })
  }

  if (cargando) {
    return (
      <>
        <Navbar />
        <main className="page-content">
          <section className="page">
            <p>Cargando nutrición...</p>
          </section>
        </main>
      </>
    )
  }

  const comidas = registro?.comidas ?? []

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Nutrición de hoy</h1>
            <Link to="/nutricion/mis-comidas" className="btn-ghost">
              Mis comidas
            </Link>
          </div>

          <div className="nutricion-totales">
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{(registro?.totalCalorias ?? 0).toFixed(0)}</span>
              <span className="nutricion-total-etiqueta">kcal</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{(registro?.totalProteina ?? 0).toFixed(1)}</span>
              <span className="nutricion-total-etiqueta">proteína (g)</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{(registro?.totalCarbohidratos ?? 0).toFixed(1)}</span>
              <span className="nutricion-total-etiqueta">carbos (g)</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{(registro?.totalGrasa ?? 0).toFixed(1)}</span>
              <span className="nutricion-total-etiqueta">grasa (g)</span>
            </div>
          </div>

          {comidas.length === 0 && (
            <p className="dia-vacio">Todavía no registraste comidas hoy. Agregá una comida para empezar.</p>
          )}

          <div className="semana">
            {comidas.map((comida, indice) => (
              <ComidaCard
                key={comida.id}
                comida={comida}
                numero={indice + 1}
                alimentosDisponibles={alimentosDisponibles}
                comidasGuardadas={comidasGuardadas}
                onAlimentoCreado={handleAlimentoCreado}
                onActualizada={handleComidaActualizada}
                onEliminada={handleComidaEliminada}
                onItemAgregado={handleItemAgregado}
                onItemEliminado={handleItemEliminado}
              />
            ))}
          </div>

          <button type="button" className="btn-agregar-dia" onClick={() => setModalAbierto(true)}>
            + Agregar comida {comidas.length + 1}
          </button>

          {modalAbierto && (
            <ModalNuevaComida
              numero={comidas.length + 1}
              alimentosDisponibles={alimentosDisponibles}
              comidasGuardadas={comidasGuardadas}
              onAlimentoCreado={handleAlimentoCreado}
              onCreada={handleComidaCreada}
              onCerrar={cerrarModal}
            />
          )}
        </section>
      </main>
    </>
  )
}
