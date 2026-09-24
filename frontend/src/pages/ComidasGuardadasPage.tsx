import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DialogoConfirmar from '../components/DialogoConfirmar'
import { IconoPlato } from '../components/Iconos'
import Modal from '../components/Modal'
import ModalAgregarAlimento from '../components/ModalAgregarAlimento'
import Navbar from '../components/Navbar'
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
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [comidaAgregando, setComidaAgregando] = useState<ComidaGuardada | null>(null)
  const [comidaAEliminar, setComidaAEliminar] = useState<ComidaGuardada | null>(null)

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
      setModalCrearAbierto(false)
      setComidaAgregando(creada)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la comida')
    } finally {
      setCreando(false)
    }
  }

  function cerrarModalCrear() {
    setModalCrearAbierto(false)
    setNombreNueva('')
    setError('')
  }

  async function handleEliminar(id: number) {
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
            <p>Cargando mis comidas...</p>
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
            <h1>Mis comidas</h1>
            <Link to="/nutricion" className="btn-ghost">
              ← Volver a nutrición
            </Link>
          </div>

          <p className="entrenamiento-objetivo">
            Armá combinaciones de alimentos que comés seguido para cargarlas de una vez al registrar una comida.
          </p>

          {comidasGuardadas.length === 0 && <p className="dia-vacio">Todavía no creaste ninguna comida.</p>}

          <div className="semana">
            {comidasGuardadas.map((comida) => (
              <div className="dia" key={comida.id}>
                <div className="dia-header">
                  <h2>{comida.nombre}</h2>
                  <div className="dia-acciones">
                    <button type="button" onClick={() => setComidaAgregando(comida)}>
                      + Agregar alimento
                    </button>
                    <button type="button" className="btn-quitar-dia" onClick={() => setComidaAEliminar(comida)}>
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

              </div>
            ))}
          </div>

          <button type="button" className="btn-agregar-dia" onClick={() => setModalCrearAbierto(true)}>
            + Crear comida
          </button>

          {modalCrearAbierto && (
            <Modal
              titulo="Nueva comida"
              subtitulo="Ponele un nombre y después le agregás los alimentos."
              icono={<IconoPlato />}
              tamanio="chico"
              onCerrar={cerrarModalCrear}
              bloqueado={creando}
              pie={
                <>
                  <button type="button" className="btn btn-secundario" onClick={cerrarModalCrear} disabled={creando}>
                    Cancelar
                  </button>
                  <button type="submit" form="form-nueva-comida" className="btn btn-primario" disabled={creando}>
                    {creando ? 'Creando...' : 'Crear y agregar alimentos'}
                  </button>
                </>
              }
            >
              <form id="form-nueva-comida" className="selector" onSubmit={handleCrear} noValidate>
                <div className="campo">
                  <label htmlFor="nombre-comida-guardada">Nombre</label>
                  <input
                    id="nombre-comida-guardada"
                    className="input"
                    placeholder="Ej: Desayuno clásico"
                    value={nombreNueva}
                    onChange={(event) => setNombreNueva(event.target.value)}
                    data-autofocus
                  />
                </div>
                {error && <p className="field-error">{error}</p>}
              </form>
            </Modal>
          )}

          {comidaAgregando && (
            <ModalAgregarAlimento
              titulo={comidaAgregando.nombre}
              alimentosDisponibles={alimentosDisponibles}
              onAlimentoCreado={handleAlimentoCreado}
              onAgregar={async (alimentoId, cantidadGramos) => {
                const comidaId = comidaAgregando.id
                const creado = await agregarItemComidaGuardada(comidaId, alimentoId, cantidadGramos)
                setComidasGuardadas((actuales) =>
                  actuales.map((c) => (c.id === comidaId ? { ...c, items: [...c.items, creado] } : c)),
                )
              }}
              onCerrar={() => setComidaAgregando(null)}
            />
          )}

          {comidaAEliminar && (
            <DialogoConfirmar
              titulo={`¿Eliminar "${comidaAEliminar.nombre}"?`}
              mensaje="Se va a quitar de Mis comidas junto con sus alimentos."
              onConfirmar={() => handleEliminar(comidaAEliminar.id)}
              onCerrar={() => setComidaAEliminar(null)}
            />
          )}
        </section>
      </main>
    </>
  )
}
