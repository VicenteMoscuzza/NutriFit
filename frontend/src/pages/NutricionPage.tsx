import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DialogoConfirmar from '../components/DialogoConfirmar'
import { IconoMas, IconoPlato } from '../components/Iconos'
import Modal from '../components/Modal'
import ModalAgregarAlimento from '../components/ModalAgregarAlimento'
import ModalNuevaComida from '../components/ModalNuevaComida'
import Navbar from '../components/Navbar'
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

interface ModalCargarGuardadaProps {
  titulo: string
  comidasGuardadas: ComidaGuardada[]
  onCargar: (comidaGuardadaId: number) => Promise<void>
  onCerrar: () => void
}

function ModalCargarGuardada({ titulo, comidasGuardadas, onCargar, onCerrar }: ModalCargarGuardadaProps) {
  const [cargandoId, setCargandoId] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleCargar(id: number) {
    setError('')
    setCargandoId(id)
    try {
      await onCargar(id)
      onCerrar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la comida')
      setCargandoId(null)
    }
  }

  return (
    <Modal
      titulo="Cargar de Mis comidas"
      subtitulo={titulo}
      icono={<IconoPlato />}
      tamanio="chico"
      onCerrar={onCerrar}
      bloqueado={cargandoId !== null}
    >
      {comidasGuardadas.length === 0 ? (
        <div className="estado-vacio">
          <p>Todavía no creaste ninguna comida en Mis comidas.</p>
          <Link to="/nutricion/mis-comidas" className="btn btn-secundario">
            Ir a Mis comidas
          </Link>
        </div>
      ) : (
        <div className="opciones opciones-altas">
          {comidasGuardadas.map((guardada) => (
            <button
              key={guardada.id}
              type="button"
              className="opcion"
              onClick={() => handleCargar(guardada.id)}
              disabled={cargandoId !== null}
            >
              <span className="opcion-texto">
                <span className="opcion-nombre">{guardada.nombre}</span>
                <span className="opcion-detalle">
                  {guardada.items.length === 0
                    ? 'Sin alimentos'
                    : guardada.items.map((item) => item.nombreAlimento).join(', ')}
                </span>
              </span>
              <span className="opcion-agregar">
                {cargandoId === guardada.id ? <span className="spinner" /> : <IconoMas tamanio={16} />}
              </span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </Modal>
  )
}

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
  const [modalAbierto, setModalAbierto] = useState<'alimento' | 'guardada' | 'eliminar' | null>(null)
  const titulo = `Comida ${numero}`

  async function handleEliminar() {
    await eliminarComida(comida.id)
    onEliminada(comida.id)
  }

  async function handleQuitarItem(itemId: number) {
    await eliminarItemRegistro(itemId)
    onItemEliminado(comida.id, itemId)
  }

  async function handleCargarGuardada(comidaGuardadaId: number) {
    const actualizada = await cargarComidaGuardada(comida.id, comidaGuardadaId)
    onActualizada(actualizada)
  }

  return (
    <div className="dia">
      <div className="dia-header">
        <h2>{titulo}</h2>
        <div className="dia-acciones">
          <button type="button" onClick={() => setModalAbierto('alimento')}>
            + Alimento
          </button>
          <button type="button" onClick={() => setModalAbierto('guardada')}>
            + Mis comidas
          </button>
          <button type="button" className="btn-quitar-dia" onClick={() => setModalAbierto('eliminar')}>
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

      {modalAbierto === 'alimento' && (
        <ModalAgregarAlimento
          titulo={titulo}
          alimentosDisponibles={alimentosDisponibles}
          onAlimentoCreado={onAlimentoCreado}
          onAgregar={async (alimentoId, cantidadGramos) => {
            const creado = await agregarItemComida(comida.id, alimentoId, cantidadGramos)
            onItemAgregado(comida.id, creado)
          }}
          onCerrar={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'guardada' && (
        <ModalCargarGuardada
          titulo={titulo}
          comidasGuardadas={comidasGuardadas}
          onCargar={handleCargarGuardada}
          onCerrar={() => setModalAbierto(null)}
        />
      )}

      {modalAbierto === 'eliminar' && (
        <DialogoConfirmar
          titulo={`¿Eliminar ${titulo.toLowerCase()}?`}
          mensaje="Se van a eliminar la comida y todos sus alimentos del registro de hoy."
          onConfirmar={handleEliminar}
          onCerrar={() => setModalAbierto(null)}
        />
      )}
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
