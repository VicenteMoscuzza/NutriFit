import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { obtenerDetalleDia, obtenerMesCalendario, type DetalleDia, type DiaCalendario } from '../api/calendario'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function aFechaIso(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function desdeFechaIso(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function nombreMes(anio: number, mes: number) {
  return capitalizar(new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(anio, mes, 1)))
}

function nombreDia(fechaIso: string) {
  return capitalizar(
    new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(desdeFechaIso(fechaIso)),
  )
}

// Celdas del mes empezando en lunes; null = hueco antes del día 1 o después del último
function celdasDelMes(anio: number, mes: number): (string | null)[] {
  const primerDia = new Date(anio, mes, 1)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const huecosIniciales = (primerDia.getDay() + 6) % 7
  const celdas: (string | null)[] = Array(huecosIniciales).fill(null)
  for (let dia = 1; dia <= diasEnMes; dia++) {
    celdas.push(aFechaIso(new Date(anio, mes, dia)))
  }
  while (celdas.length % 7 !== 0) {
    celdas.push(null)
  }
  return celdas
}

export default function CalendarioPage() {
  const hoy = aFechaIso(new Date())
  const [anio, setAnio] = useState(() => new Date().getFullYear())
  const [mes, setMes] = useState(() => new Date().getMonth())
  const [diasConActividad, setDiasConActividad] = useState<Record<string, DiaCalendario>>({})
  const [cargandoMes, setCargandoMes] = useState(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)
  const [detalle, setDetalle] = useState<DetalleDia | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    setCargandoMes(true)
    obtenerMesCalendario(`${anio}-${String(mes + 1).padStart(2, '0')}`)
      .then((dias) => {
        if (!cancelado) {
          setDiasConActividad(Object.fromEntries(dias.map((dia) => [dia.fecha, dia])))
        }
      })
      .catch(() => !cancelado && setError('No se pudo cargar el calendario'))
      .finally(() => !cancelado && setCargandoMes(false))
    return () => {
      cancelado = true
    }
  }, [anio, mes])

  useEffect(() => {
    let cancelado = false
    setCargandoDetalle(true)
    obtenerDetalleDia(fechaSeleccionada)
      .then((data) => !cancelado && setDetalle(data))
      .catch(() => !cancelado && setError('No se pudo cargar el día'))
      .finally(() => !cancelado && setCargandoDetalle(false))
    return () => {
      cancelado = true
    }
  }, [fechaSeleccionada])

  function cambiarMes(delta: number) {
    const nuevo = new Date(anio, mes + delta, 1)
    setAnio(nuevo.getFullYear())
    setMes(nuevo.getMonth())
  }

  function irAHoy() {
    const ahora = new Date()
    setAnio(ahora.getFullYear())
    setMes(ahora.getMonth())
    setFechaSeleccionada(hoy)
  }

  const diasEntrenados = Object.values(diasConActividad).filter((d) => d.seriesRegistradas > 0).length
  const diasConComidas = Object.values(diasConActividad).filter((d) => d.comidasRegistradas > 0).length

  return (
    <>
      <Navbar />
      <main className="page-content">
        <section className="page">
          <div className="page-header">
            <h1>Calendario</h1>
          </div>

          <div className="calendario">
            <div className="calendario-header">
              <button type="button" className="calendario-nav" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
                ‹
              </button>
              <h2>{nombreMes(anio, mes)}</h2>
              <button type="button" className="calendario-nav" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
                ›
              </button>
              <button type="button" className="calendario-hoy" onClick={irAHoy}>
                Hoy
              </button>
            </div>

            <p className="calendario-resumen">
              {cargandoMes
                ? 'Cargando...'
                : `${diasEntrenados} ${diasEntrenados === 1 ? 'día entrenado' : 'días entrenados'} · ${diasConComidas} ${
                    diasConComidas === 1 ? 'día con comidas' : 'días con comidas'
                  }`}
            </p>

            <div className="calendario-grilla" role="grid">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="calendario-dia-semana" role="columnheader">
                  {dia}
                </div>
              ))}
              {celdasDelMes(anio, mes).map((fecha, indice) => {
                if (!fecha) {
                  return <div key={`vacio-${indice}`} className="calendario-celda vacia" />
                }
                const actividad = diasConActividad[fecha]
                const entreno = (actividad?.seriesRegistradas ?? 0) > 0
                const comio = (actividad?.comidasRegistradas ?? 0) > 0
                const clases = [
                  'calendario-celda',
                  fecha === hoy ? 'hoy' : '',
                  fecha === fechaSeleccionada ? 'seleccionada' : '',
                  fecha > hoy ? 'futura' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={fecha}
                    type="button"
                    role="gridcell"
                    className={clases}
                    onClick={() => setFechaSeleccionada(fecha)}
                    aria-pressed={fecha === fechaSeleccionada}
                    aria-label={`${nombreDia(fecha)}${entreno ? ', entrenaste' : ''}${
                      comio ? `, ${actividad.calorias.toFixed(0)} kcal` : ''
                    }`}
                  >
                    <span className="calendario-numero">{Number(fecha.slice(8))}</span>
                    <span className="calendario-marcas">
                      {entreno && <span className="calendario-marca entreno" title="Entrenaste" />}
                      {comio && <span className="calendario-marca comida" title="Registraste comidas" />}
                    </span>
                    {comio && <span className="calendario-kcal">{actividad.calorias.toFixed(0)} kcal</span>}
                  </button>
                )
              })}
            </div>

            <div className="calendario-leyenda">
              <span>
                <span className="calendario-marca entreno" /> Entrenamiento
              </span>
              <span>
                <span className="calendario-marca comida" /> Comidas
              </span>
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}

          <div className="calendario-detalle">
            <h2>{nombreDia(fechaSeleccionada)}</h2>

            {cargandoDetalle || !detalle ? (
              <p className="dia-vacio">Cargando...</p>
            ) : (
              <div className="calendario-detalle-columnas">
                <div className="dia">
                  <div className="dia-header">
                    <h2>💪 Entrenamiento</h2>
                  </div>
                  {detalle.ejercicios.length === 0 ? (
                    <p className="dia-vacio">No registraste entrenamiento este día.</p>
                  ) : (
                    <ul className="lista-ejercicios">
                      {detalle.ejercicios.map((ejercicio, indice) => (
                        <li key={`${ejercicio.nombreEjercicio}-${indice}`} className="calendario-ejercicio">
                          <div>
                            <span className="nombre">{ejercicio.nombreEjercicio}</span>
                            <span className="grupo">
                              {' '}
                              · {ejercicio.grupoMuscular} · Día {ejercicio.diaRutina}
                            </span>
                          </div>
                          <div className="calendario-series">
                            {ejercicio.series.map((serie) => (
                              <span key={serie.id} className="calendario-serie">
                                {serie.pesoKg} kg × {serie.repeticiones}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="dia">
                  <div className="dia-header">
                    <h2>🍽️ Nutrición</h2>
                  </div>
                  {detalle.nutricion.comidas.length === 0 ? (
                    <p className="dia-vacio">No registraste comidas este día.</p>
                  ) : (
                    <>
                      <p className="entrenamiento-objetivo">
                        {detalle.nutricion.totalCalorias.toFixed(0)} kcal · {detalle.nutricion.totalProteina.toFixed(1)}p
                        · {detalle.nutricion.totalCarbohidratos.toFixed(1)}c · {detalle.nutricion.totalGrasa.toFixed(1)}g
                      </p>
                      {detalle.nutricion.comidas.map((comida, indice) => (
                        <div key={comida.id} className="calendario-comida">
                          <h3>
                            Comida {indice + 1}
                            <span className="grupo"> · {comida.subtotalCalorias.toFixed(0)} kcal</span>
                          </h3>
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
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
