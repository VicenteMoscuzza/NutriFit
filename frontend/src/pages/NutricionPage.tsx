import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import SelectorAlimento from '../components/SelectorAlimento'
import { listarAlimentos, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import {
  agregarItemComida,
  agregarItemComidaGuardada,
  crearComida,
  crearComidaDesdeGuardada,
  crearComidaGuardada,
  eliminarComida,
  eliminarComidaGuardada,
  eliminarItemComidaGuardada,
  eliminarItemRegistro,
  listarComidasGuardadas,
  obtenerRegistroDeHoy,
  renombrarComida,
  type ComidaGuardada,
  type ComidaRegistrada,
  type ItemRegistro,
  type RegistroDiario,
} from '../api/nutricion'

interface ComidaCardProps {
  comida: ComidaRegistrada
  alimentosDisponibles: Alimento[]
  onAlimentoCreado: (alimento: Alimento) => void
  onRenombrada: (comida: ComidaRegistrada) => void
  onEliminada: (comidaId: number) => void
  onItemAgregado: (comidaId: number, item: ItemRegistro) => void
  onItemEliminado: (comidaId: number, itemId: number) => void
}

function ComidaCard({
  comida,
  alimentosDisponibles,
  onAlimentoCreado,
  onRenombrada,
  onEliminada,
  onItemAgregado,
  onItemEliminado,
}: ComidaCardProps) {
  const [editando, setEditando] = useState(false)
  const [nombreEditado, setNombreEditado] = useState(comida.nombre)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [guardandoNombre, setGuardandoNombre] = useState(false)

  async function handleGuardarNombre() {
    if (!nombreEditado.trim() || nombreEditado.trim() === comida.nombre) {
      setEditando(false)
      setNombreEditado(comida.nombre)
      return
    }
    setGuardandoNombre(true)
    try {
      const actualizada = await renombrarComida(comida.id, nombreEditado.trim())
      onRenombrada(actualizada)
      setEditando(false)
    } finally {
      setGuardandoNombre(false)
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${comida.nombre}" y todos sus alimentos?`)) {
      return
    }
    await eliminarComida(comida.id)
    onEliminada(comida.id)
  }

  async function handleQuitarItem(itemId: number) {
    await eliminarItemRegistro(itemId)
    onItemEliminado(comida.id, itemId)
  }

  return (
    <div className="dia">
      <div className="dia-header">
        {editando ? (
          <div className="comida-nombre-editar">
            <input value={nombreEditado} onChange={(event) => setNombreEditado(event.target.value)} autoFocus />
            <button type="button" onClick={handleGuardarNombre} disabled={guardandoNombre}>
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false)
                setNombreEditado(comida.nombre)
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <h2>{comida.nombre}</h2>
        )}
        <div className="dia-acciones">
          {!editando && (
            <button type="button" onClick={() => setEditando(true)}>
              Renombrar
            </button>
          )}
          <button type="button" onClick={() => setFormularioAbierto((actual) => !actual)}>
            {formularioAbierto ? 'Cancelar' : '+ Agregar alimento'}
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
        <p className="dia-vacio">Sin alimentos</p>
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

      {formularioAbierto && (
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
    </div>
  )
}

interface GestionComidasGuardadasProps {
  comidasGuardadas: ComidaGuardada[]
  alimentosDisponibles: Alimento[]
  onAlimentoCreado: (alimento: Alimento) => void
  onComidasGuardadasChange: (comidas: ComidaGuardada[]) => void
}

function GestionComidasGuardadas({
  comidasGuardadas,
  alimentosDisponibles,
  onAlimentoCreado,
  onComidasGuardadasChange,
}: GestionComidasGuardadasProps) {
  const [nombreNueva, setNombreNueva] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')
  const [comidaFormularioAbierta, setComidaFormularioAbierta] = useState<number | null>(null)

  async function handleCrear(event: FormEvent) {
    event.preventDefault()
    if (!nombreNueva.trim()) {
      setError('Ingresá un nombre para la comida')
      return
    }
    setError('')
    setCreando(true)
    try {
      const creada = await crearComidaGuardada(nombreNueva.trim())
      onComidasGuardadasChange([...comidasGuardadas, creada])
      setNombreNueva('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la comida guardada')
    } finally {
      setCreando(false)
    }
  }

  async function handleEliminar(id: number) {
    if (!window.confirm('¿Eliminar esta comida guardada?')) {
      return
    }
    await eliminarComidaGuardada(id)
    onComidasGuardadasChange(comidasGuardadas.filter((c) => c.id !== id))
  }

  async function handleQuitarItem(comidaId: number, itemId: number) {
    await eliminarItemComidaGuardada(itemId)
    onComidasGuardadasChange(
      comidasGuardadas.map((c) => (c.id === comidaId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)),
    )
  }

  return (
    <div className="nutricion-guardadas">
      {comidasGuardadas.length === 0 && <p className="dia-vacio">Todavía no creaste comidas guardadas.</p>}

      <div className="semana">
        {comidasGuardadas.map((comida) => (
          <div className="dia" key={comida.id}>
            <div className="dia-header">
              <h2>{comida.nombre}</h2>
              <div className="dia-acciones">
                <button
                  type="button"
                  onClick={() => setComidaFormularioAbierta((actual) => (actual === comida.id ? null : comida.id))}
                >
                  {comidaFormularioAbierta === comida.id ? 'Cancelar' : '+ Agregar alimento'}
                </button>
                <button type="button" className="btn-quitar-dia" onClick={() => handleEliminar(comida.id)}>
                  Eliminar
                </button>
              </div>
            </div>

            {comida.items.length === 0 ? (
              <p className="dia-vacio">Sin alimentos</p>
            ) : (
              <ul className="lista-ejercicios">
                {comida.items.map((item) => (
                  <li key={item.id}>
                    <span className="nombre">{item.nombreAlimento}</span>
                    <span className="grupo">{item.cantidadGramos} g</span>
                    <button type="button" onClick={() => handleQuitarItem(comida.id, item.id)}>
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {comidaFormularioAbierta === comida.id && (
              <SelectorAlimento
                idPrefix={`guardada-${comida.id}`}
                alimentosDisponibles={alimentosDisponibles}
                onAlimentoCreado={onAlimentoCreado}
                onAgregar={async (alimentoId, cantidadGramos) => {
                  const creado = await agregarItemComidaGuardada(comida.id, alimentoId, cantidadGramos)
                  onComidasGuardadasChange(
                    comidasGuardadas.map((c) => (c.id === comida.id ? { ...c, items: [...c.items, creado] } : c)),
                  )
                }}
              />
            )}
          </div>
        ))}
      </div>

      <form className="auth-form" onSubmit={handleCrear} noValidate>
        <label htmlFor="nombre-comida-guardada">Nueva comida guardada</label>
        <input
          id="nombre-comida-guardada"
          placeholder="Ej: Desayuno clásico"
          value={nombreNueva}
          onChange={(event) => setNombreNueva(event.target.value)}
        />
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={creando}>
          {creando ? 'Creando...' : '+ Crear comida guardada'}
        </button>
      </form>
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
  const [mostrarGuardadas, setMostrarGuardadas] = useState(false)
  const [error, setError] = useState('')
  const [formularioComidaAbierto, setFormularioComidaAbierto] = useState(false)
  const [modoCreacionComida, setModoCreacionComida] = useState<'blanco' | 'guardada'>('blanco')
  const [nombreComidaNueva, setNombreComidaNueva] = useState('')
  const [comidaGuardadaSeleccionada, setComidaGuardadaSeleccionada] = useState('')
  const [creandoComida, setCreandoComida] = useState(false)

  useEffect(() => {
    Promise.all([obtenerRegistroDeHoy(), listarComidasGuardadas(), listarAlimentos()])
      .then(([registroData, comidasGuardadasData, alimentosData]) => {
        setRegistro(registroData)
        setComidasGuardadas(comidasGuardadasData)
        setAlimentosDisponibles(alimentosData)
        if (comidasGuardadasData.length > 0) {
          setComidaGuardadaSeleccionada(String(comidasGuardadasData[0].id))
        }
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

  async function handleCrearComida(event: FormEvent) {
    event.preventDefault()

    if (modoCreacionComida === 'guardada' && !comidaGuardadaSeleccionada) {
      setError('Elegí una comida guardada')
      return
    }

    setError('')
    setCreandoComida(true)
    try {
      const creada =
        modoCreacionComida === 'blanco'
          ? await crearComida(nombreComidaNueva.trim() || undefined)
          : await crearComidaDesdeGuardada(Number(comidaGuardadaSeleccionada))

      setRegistro((actual) => agregarComidaARegistro(actual, creada))
      setNombreComidaNueva('')
      setFormularioComidaAbierto(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar la comida')
    } finally {
      setCreandoComida(false)
    }
  }

  function handleComidaRenombrada(actualizada: ComidaRegistrada) {
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      return { ...actual, comidas: actual.comidas.map((c) => (c.id === actualizada.id ? actualizada : c)) }
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
            {comidas.map((comida) => (
              <ComidaCard
                key={comida.id}
                comida={comida}
                alimentosDisponibles={alimentosDisponibles}
                onAlimentoCreado={handleAlimentoCreado}
                onRenombrada={handleComidaRenombrada}
                onEliminada={handleComidaEliminada}
                onItemAgregado={handleItemAgregado}
                onItemEliminado={handleItemEliminado}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-agregar-dia"
            onClick={() => {
              setError('')
              setFormularioComidaAbierto((actual) => !actual)
            }}
          >
            {formularioComidaAbierto ? 'Cancelar' : '+ Agregar comida'}
          </button>

          {formularioComidaAbierto && (
            <form className="auth-form" onSubmit={handleCrearComida} noValidate>
              <label htmlFor="modo-creacion-comida">Cómo querés crearla</label>
              <div className="opciones-radio" id="modo-creacion-comida">
                <label>
                  <input
                    type="radio"
                    name="modo-creacion-comida"
                    checked={modoCreacionComida === 'blanco'}
                    onChange={() => setModoCreacionComida('blanco')}
                  />
                  Comida en blanco
                </label>
                <label>
                  <input
                    type="radio"
                    name="modo-creacion-comida"
                    checked={modoCreacionComida === 'guardada'}
                    onChange={() => setModoCreacionComida('guardada')}
                    disabled={comidasGuardadas.length === 0}
                  />
                  Desde una comida guardada
                </label>
              </div>

              {modoCreacionComida === 'blanco' && (
                <>
                  <label htmlFor="nombre-comida-nueva">Nombre (opcional)</label>
                  <input
                    id="nombre-comida-nueva"
                    placeholder="Comida 1"
                    value={nombreComidaNueva}
                    onChange={(event) => setNombreComidaNueva(event.target.value)}
                  />
                </>
              )}

              {modoCreacionComida === 'guardada' && (
                comidasGuardadas.length === 0 ? (
                  <p className="dia-vacio">Todavía no tenés comidas guardadas.</p>
                ) : (
                  <>
                    <label htmlFor="comida-guardada-seleccionada">Comida guardada</label>
                    <select
                      id="comida-guardada-seleccionada"
                      value={comidaGuardadaSeleccionada}
                      onChange={(event) => setComidaGuardadaSeleccionada(event.target.value)}
                    >
                      {comidasGuardadas.map((comida) => (
                        <option key={comida.id} value={comida.id}>
                          {comida.nombre}
                        </option>
                      ))}
                    </select>
                  </>
                )
              )}

              {error && <p className="field-error">{error}</p>}

              <button type="submit" disabled={creandoComida}>
                {creandoComida ? 'Agregando...' : 'Agregar comida'}
              </button>
            </form>
          )}

          <div className="nutricion-guardadas-toggle">
            <button type="button" className="btn-ghost" onClick={() => setMostrarGuardadas((actual) => !actual)}>
              {mostrarGuardadas ? 'Ocultar comidas guardadas' : 'Gestionar comidas guardadas'}
            </button>
          </div>

          {mostrarGuardadas && (
            <GestionComidasGuardadas
              comidasGuardadas={comidasGuardadas}
              alimentosDisponibles={alimentosDisponibles}
              onAlimentoCreado={handleAlimentoCreado}
              onComidasGuardadasChange={setComidasGuardadas}
            />
          )}
        </section>
      </main>
    </>
  )
}
