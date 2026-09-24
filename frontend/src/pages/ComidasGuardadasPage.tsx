import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SelectorAlimento from '../components/SelectorAlimento'
import { listarAlimentos, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'
import {
  agregarItemComidaGuardada,
  crearComidaGuardada,
  eliminarComidaGuardada,
  eliminarItemComidaGuardada,
  listarComidasGuardadas,
  type ComidaGuardada,
} from '../api/nutricion'

export default function ComidasGuardadasPage() {
  const [comidasGuardadas, setComidasGuardadas] = useState<ComidaGuardada[]>([])
  const [alimentosDisponibles, setAlimentosDisponibles] = useState<Alimento[]>([])
  const [cargando, setCargando] = useState(true)
  const [nombreNueva, setNombreNueva] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')
  const [comidaFormularioAbierta, setComidaFormularioAbierta] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([listarComidasGuardadas(), listarAlimentos()])
      .then(([comidasGuardadasData, alimentosData]) => {
        setComidasGuardadas(comidasGuardadasData)
        setAlimentosDisponibles(alimentosData)
      })
      .finally(() => setCargando(false))
  }, [])

  function handleAlimentoCreado(alimento: Alimento) {
    setAlimentosDisponibles((actuales) => [...actuales, alimento])
  }

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
      setComidasGuardadas((actuales) => [...actuales, creada])
      setNombreNueva('')
      setComidaFormularioAbierta(creada.id)
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
    setComidasGuardadas((actuales) => actuales.filter((c) => c.id !== id))
  }

  async function handleQuitarItem(comidaId: number, itemId: number) {
    await eliminarItemComidaGuardada(itemId)
    setComidasGuardadas((actuales) =>
      actuales.map((c) => (c.id === comidaId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)),
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
            <Link to="/nutricion" className="btn-ghost">
              ← Volver a nutrición
            </Link>
          </div>

          <p className="entrenamiento-objetivo">
            Armá combinaciones de alimentos que comés seguido para cargarlas de una vez al registrar una comida.
          </p>

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
                    onAlimentoCreado={handleAlimentoCreado}
                    onAgregar={async (alimentoId, cantidadGramos) => {
                      const creado = await agregarItemComidaGuardada(comida.id, alimentoId, cantidadGramos)
                      setComidasGuardadas((actuales) =>
                        actuales.map((c) => (c.id === comida.id ? { ...c, items: [...c.items, creado] } : c)),
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
        </section>
      </main>
    </>
  )
}
