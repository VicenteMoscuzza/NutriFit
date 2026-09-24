import { type FormEvent, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { crearAlimento, listarAlimentos, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import {
  agregarItemRegistro,
  aplicarComidaGuardada,
  eliminarItemRegistro,
  listarComidasGuardadas,
  obtenerRegistroDeHoy,
  type ComidaGuardada,
  type RegistroDiario,
} from '../api/nutricion'

const ALIMENTO_NUEVO = '__nuevo__'

export default function NutricionPage() {
  const [registro, setRegistro] = useState<RegistroDiario | null>(null)
  const [comidasGuardadas, setComidasGuardadas] = useState<ComidaGuardada[]>([])
  const [alimentosDisponibles, setAlimentosDisponibles] = useState<Alimento[]>([])
  const [cargando, setCargando] = useState(true)
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState('')
  const [nombreNuevoAlimento, setNombreNuevoAlimento] = useState('')
  const [caloriasNuevoAlimento, setCaloriasNuevoAlimento] = useState('')
  const [proteinaNuevoAlimento, setProteinaNuevoAlimento] = useState('')
  const [carbohidratosNuevoAlimento, setCarbohidratosNuevoAlimento] = useState('')
  const [grasaNuevoAlimento, setGrasaNuevoAlimento] = useState('')
  const [cantidadGramos, setCantidadGramos] = useState('100')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [aplicandoId, setAplicandoId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([obtenerRegistroDeHoy(), listarComidasGuardadas(), listarAlimentos()])
      .then(([registroData, comidasData, alimentosData]) => {
        setRegistro(registroData)
        setComidasGuardadas(comidasData)
        setAlimentosDisponibles(alimentosData)
        setAlimentoSeleccionado(alimentosData.length > 0 ? String(alimentosData[0].id) : ALIMENTO_NUEVO)
      })
      .finally(() => setCargando(false))
  }, [])

  async function handleAplicarComida(comidaId: number) {
    setAplicandoId(comidaId)
    try {
      const actualizado = await aplicarComidaGuardada(comidaId)
      setRegistro(actualizado)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aplicar la comida guardada')
    } finally {
      setAplicandoId(null)
    }
  }

  async function handleAgregarItem(event: FormEvent) {
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

      const creado = await agregarItemRegistro(alimentoId, cantidad)
      setRegistro((actual) => {
        const base = actual ?? {
          id: null,
          fecha: new Date().toISOString().slice(0, 10),
          items: [],
          totalCalorias: 0,
          totalProteina: 0,
          totalCarbohidratos: 0,
          totalGrasa: 0,
        }
        return {
          ...base,
          items: [...base.items, creado],
          totalCalorias: base.totalCalorias + creado.caloriasCalculadas,
          totalProteina: base.totalProteina + creado.proteinaCalculada,
          totalCarbohidratos: base.totalCarbohidratos + creado.carbohidratosCalculados,
          totalGrasa: base.totalGrasa + creado.grasaCalculada,
        }
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el alimento')
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminarItem(itemId: number) {
    await eliminarItemRegistro(itemId)
    setRegistro((actual) => {
      if (!actual) {
        return actual
      }
      const item = actual.items.find((i) => i.id === itemId)
      if (!item) {
        return actual
      }
      return {
        ...actual,
        items: actual.items.filter((i) => i.id !== itemId),
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
            <p>Cargando registro de hoy...</p>
          </section>
        </main>
      </>
    )
  }

  const items = registro?.items ?? []

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Nutrición de hoy</h1>
          </div>

          {comidasGuardadas.length > 0 && (
            <div className="dia-selector">
              {comidasGuardadas.map((comida) => (
                <button
                  key={comida.id}
                  type="button"
                  className="dia-tab"
                  disabled={aplicandoId === comida.id}
                  onClick={() => handleAplicarComida(comida.id)}
                >
                  {aplicandoId === comida.id ? 'Aplicando...' : `+ Aplicar "${comida.nombre}"`}
                </button>
              ))}
            </div>
          )}

          <div className="nutricion-totales">
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{registro?.totalCalorias.toFixed(0) ?? 0}</span>
              <span className="nutricion-total-etiqueta">kcal</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{registro?.totalProteina.toFixed(1) ?? 0}</span>
              <span className="nutricion-total-etiqueta">proteína (g)</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{registro?.totalCarbohidratos.toFixed(1) ?? 0}</span>
              <span className="nutricion-total-etiqueta">carbos (g)</span>
            </div>
            <div className="nutricion-total">
              <span className="nutricion-total-valor">{registro?.totalGrasa.toFixed(1) ?? 0}</span>
              <span className="nutricion-total-etiqueta">grasa (g)</span>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="dia-vacio">Todavía no registraste alimentos hoy.</p>
          ) : (
            <ul className="lista-ejercicios">
              {items.map((item) => (
                <li key={item.id}>
                  <span className="nombre">
                    {item.nombreAlimento} <span className="grupo">({item.cantidadGramos} g)</span>
                  </span>
                  <span className="grupo">
                    {item.caloriasCalculadas.toFixed(0)} kcal · {item.proteinaCalculada.toFixed(1)}p ·{' '}
                    {item.carbohidratosCalculados.toFixed(1)}c · {item.grasaCalculada.toFixed(1)}g
                  </span>
                  <button type="button" onClick={() => handleEliminarItem(item.id)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="auth-form" onSubmit={handleAgregarItem} noValidate>
            <label htmlFor="alimento">Alimento</label>
            <select
              id="alimento"
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
                <label htmlFor="nombre-nuevo">Nombre del alimento</label>
                <input
                  id="nombre-nuevo"
                  value={nombreNuevoAlimento}
                  onChange={(event) => setNombreNuevoAlimento(event.target.value)}
                />

                <label htmlFor="calorias">Calorías por 100g</label>
                <input
                  id="calorias"
                  type="number"
                  min={0}
                  step="0.1"
                  value={caloriasNuevoAlimento}
                  onChange={(event) => setCaloriasNuevoAlimento(event.target.value)}
                />

                <label htmlFor="proteina">Proteína por 100g</label>
                <input
                  id="proteina"
                  type="number"
                  min={0}
                  step="0.1"
                  value={proteinaNuevoAlimento}
                  onChange={(event) => setProteinaNuevoAlimento(event.target.value)}
                />

                <label htmlFor="carbohidratos">Carbohidratos por 100g</label>
                <input
                  id="carbohidratos"
                  type="number"
                  min={0}
                  step="0.1"
                  value={carbohidratosNuevoAlimento}
                  onChange={(event) => setCarbohidratosNuevoAlimento(event.target.value)}
                />

                <label htmlFor="grasa">Grasa por 100g</label>
                <input
                  id="grasa"
                  type="number"
                  min={0}
                  step="0.1"
                  value={grasaNuevoAlimento}
                  onChange={(event) => setGrasaNuevoAlimento(event.target.value)}
                />
              </>
            )}

            <label htmlFor="cantidad">Cantidad (g)</label>
            <input
              id="cantidad"
              type="number"
              min={1}
              value={cantidadGramos}
              onChange={(event) => setCantidadGramos(event.target.value)}
            />

            {error && <p className="field-error">{error}</p>}

            <button type="submit" disabled={guardando}>
              {guardando ? 'Agregando...' : 'Agregar alimento'}
            </button>
          </form>
        </section>
      </main>
    </>
  )
}
