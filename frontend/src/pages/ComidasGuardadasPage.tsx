import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { crearAlimento, listarAlimentos, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import {
  agregarItemComidaGuardada,
  crearComidaGuardada,
  eliminarComidaGuardada,
  eliminarItemComidaGuardada,
  listarComidasGuardadas,
  type ComidaGuardada,
} from '../api/nutricion'

const ALIMENTO_NUEVO = '__nuevo__'

export default function ComidasGuardadasPage() {
  const [comidas, setComidas] = useState<ComidaGuardada[]>([])
  const [alimentosDisponibles, setAlimentosDisponibles] = useState<Alimento[]>([])
  const [cargando, setCargando] = useState(true)
  const [comidaFormularioAbierta, setComidaFormularioAbierta] = useState<number | null>(null)
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState('')
  const [nombreNuevoAlimento, setNombreNuevoAlimento] = useState('')
  const [caloriasNuevoAlimento, setCaloriasNuevoAlimento] = useState('')
  const [proteinaNuevoAlimento, setProteinaNuevoAlimento] = useState('')
  const [carbohidratosNuevoAlimento, setCarbohidratosNuevoAlimento] = useState('')
  const [grasaNuevoAlimento, setGrasaNuevoAlimento] = useState('')
  const [cantidadGramos, setCantidadGramos] = useState('100')
  const [nombreComida, setNombreComida] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [creandoComida, setCreandoComida] = useState(false)

  useEffect(() => {
    Promise.all([listarComidasGuardadas(), listarAlimentos()])
      .then(([comidasData, alimentosData]) => {
        setComidas(comidasData)
        setAlimentosDisponibles(alimentosData)
        setAlimentoSeleccionado(alimentosData.length > 0 ? String(alimentosData[0].id) : ALIMENTO_NUEVO)
      })
      .finally(() => setCargando(false))
  }, [])

  function alternarFormulario(comidaId: number) {
    setError('')
    setComidaFormularioAbierta((actual) => (actual === comidaId ? null : comidaId))
  }

  async function handleCrearComida(event: FormEvent) {
    event.preventDefault()
    if (!nombreComida.trim()) {
      setError('Ingresá un nombre para la comida')
      return
    }

    setError('')
    setCreandoComida(true)
    try {
      const creada = await crearComidaGuardada(nombreComida.trim())
      setComidas((actual) => [...actual, creada])
      setNombreComida('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la comida guardada')
    } finally {
      setCreandoComida(false)
    }
  }

  async function handleEliminarComida(comidaId: number) {
    if (!window.confirm('¿Eliminar esta comida guardada?')) {
      return
    }
    await eliminarComidaGuardada(comidaId)
    setComidas((actual) => actual.filter((c) => c.id !== comidaId))
  }

  async function handleAgregarAlimento(event: FormEvent, comidaId: number) {
    event.preventDefault()

    let alimentoId: number
    const cantidad = Number(cantidadGramos)

    if (alimentoSeleccionado === ALIMENTO_NUEVO) {
      if (!nombreNuevoAlimento.trim()) {
        setError('Ingresá un nombre para el alimento')
        return
      }
    } else if (!alimentoSeleccionado) {
      setError('Elegí un alimento')
      return
    }

    if (cantidadGramos.trim() === '' || Number.isNaN(cantidad) || cantidad <= 0) {
      setError('Ingresá una cantidad en gramos válida')
      return
    }

    setError('')
    setGuardando(true)
    try {
      if (alimentoSeleccionado === ALIMENTO_NUEVO) {
        const calorias = Number(caloriasNuevoAlimento)
        const proteina = Number(proteinaNuevoAlimento)
        const carbohidratos = Number(carbohidratosNuevoAlimento)
        const grasa = Number(grasaNuevoAlimento)
        if ([calorias, proteina, carbohidratos, grasa].some((v) => Number.isNaN(v) || v < 0)) {
          setError('Completá los valores nutricionales del alimento')
          setGuardando(false)
          return
        }
        const nuevo = await crearAlimento(nombreNuevoAlimento.trim(), calorias, proteina, carbohidratos, grasa)
        setAlimentosDisponibles((actuales) => [...actuales, nuevo])
        alimentoId = nuevo.id
        setAlimentoSeleccionado(String(nuevo.id))
        setNombreNuevoAlimento('')
        setCaloriasNuevoAlimento('')
        setProteinaNuevoAlimento('')
        setCarbohidratosNuevoAlimento('')
        setGrasaNuevoAlimento('')
      } else {
        alimentoId = Number(alimentoSeleccionado)
      }

      const creado = await agregarItemComidaGuardada(comidaId, alimentoId, cantidad)
      setComidas((actual) =>
        actual.map((c) => (c.id === comidaId ? { ...c, items: [...c.items, creado] } : c)),
      )
      setComidaFormularioAbierta(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el alimento')
    } finally {
      setGuardando(false)
    }
  }

  async function handleQuitarItem(comidaId: number, itemId: number) {
    await eliminarItemComidaGuardada(itemId)
    setComidas((actual) =>
      actual.map((c) => (c.id === comidaId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)),
    )
  }

  if (cargando) {
    return (
      <>
        <Navbar />
        <main className="page-content">
          <section className="page">
            <p>Cargando comidas guardadas...</p>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Comidas guardadas</h1>
          </div>

          {comidas.length === 0 && (
            <p className="dia-vacio">Todavía no creaste comidas guardadas. Agrupá alimentos frecuentes para aplicarlos rápido a tu registro diario.</p>
          )}

          <div className="semana">
            {comidas.map((comida) => (
              <div className="dia" key={comida.id}>
                <div className="dia-header">
                  <h2>{comida.nombre}</h2>
                  <div className="dia-acciones">
                    <button type="button" onClick={() => alternarFormulario(comida.id)}>
                      {comidaFormularioAbierta === comida.id ? 'Cancelar' : '+ Agregar alimento'}
                    </button>
                    <button type="button" className="btn-quitar-dia" onClick={() => handleEliminarComida(comida.id)}>
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
                  <form className="auth-form" onSubmit={(event) => handleAgregarAlimento(event, comida.id)} noValidate>
                    <label htmlFor={`alimento-${comida.id}`}>Alimento</label>
                    <select
                      id={`alimento-${comida.id}`}
                      value={alimentoSeleccionado}
                      onChange={(event) => setAlimentoSeleccionado(event.target.value)}
                    >
                      {alimentosDisponibles.map((alimento) => (
                        <option key={alimento.id} value={alimento.id}>
                          {alimento.nombre} ({alimento.caloriasPor100g} kcal/100g)
                        </option>
                      ))}
                      <option value={ALIMENTO_NUEVO}>+ Crear alimento nuevo...</option>
                    </select>

                    {alimentoSeleccionado === ALIMENTO_NUEVO && (
                      <>
                        <label htmlFor={`nombre-nuevo-${comida.id}`}>Nombre del alimento</label>
                        <input
                          id={`nombre-nuevo-${comida.id}`}
                          value={nombreNuevoAlimento}
                          onChange={(event) => setNombreNuevoAlimento(event.target.value)}
                        />

                        <label htmlFor={`calorias-${comida.id}`}>Calorías por 100g</label>
                        <input
                          id={`calorias-${comida.id}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={caloriasNuevoAlimento}
                          onChange={(event) => setCaloriasNuevoAlimento(event.target.value)}
                        />

                        <label htmlFor={`proteina-${comida.id}`}>Proteína por 100g</label>
                        <input
                          id={`proteina-${comida.id}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={proteinaNuevoAlimento}
                          onChange={(event) => setProteinaNuevoAlimento(event.target.value)}
                        />

                        <label htmlFor={`carbohidratos-${comida.id}`}>Carbohidratos por 100g</label>
                        <input
                          id={`carbohidratos-${comida.id}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={carbohidratosNuevoAlimento}
                          onChange={(event) => setCarbohidratosNuevoAlimento(event.target.value)}
                        />

                        <label htmlFor={`grasa-${comida.id}`}>Grasa por 100g</label>
                        <input
                          id={`grasa-${comida.id}`}
                          type="number"
                          min={0}
                          step="0.1"
                          value={grasaNuevoAlimento}
                          onChange={(event) => setGrasaNuevoAlimento(event.target.value)}
                        />
                      </>
                    )}

                    <label htmlFor={`cantidad-${comida.id}`}>Cantidad (g)</label>
                    <input
                      id={`cantidad-${comida.id}`}
                      type="number"
                      min={1}
                      value={cantidadGramos}
                      onChange={(event) => setCantidadGramos(event.target.value)}
                    />

                    {error && <p className="field-error">{error}</p>}

                    <button type="submit" disabled={guardando}>
                      {guardando ? 'Agregando...' : 'Agregar'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleCrearComida} noValidate>
            <label htmlFor="nombre-comida">Nueva comida guardada</label>
            <input
              id="nombre-comida"
              placeholder="Ej: Desayuno clásico"
              value={nombreComida}
              onChange={(event) => setNombreComida(event.target.value)}
            />
            {error && comidaFormularioAbierta === null && <p className="field-error">{error}</p>}
            <button type="submit" disabled={creandoComida}>
              {creandoComida ? 'Creando...' : '+ Crear comida guardada'}
            </button>
          </form>
        </section>
      </main>
    </>
  )
}
