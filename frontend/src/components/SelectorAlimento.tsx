import { type FormEvent, useState } from 'react'
import { crearAlimento, type Alimento } from '../api/alimentos'
import { ApiError } from '../api/client'

const ALIMENTO_NUEVO = '__nuevo__'

interface SelectorAlimentoProps {
  idPrefix: string
  alimentosDisponibles: Alimento[]
  onAlimentoCreado: (alimento: Alimento) => void
  onAgregar: (alimentoId: number, cantidadGramos: number) => Promise<void>
  textoBoton?: string
}

export default function SelectorAlimento({
  idPrefix,
  alimentosDisponibles,
  onAlimentoCreado,
  onAgregar,
  textoBoton = 'Agregar',
}: SelectorAlimentoProps) {
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(
    alimentosDisponibles.length > 0 ? String(alimentosDisponibles[0].id) : ALIMENTO_NUEVO,
  )
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [caloriasNuevo, setCaloriasNuevo] = useState('')
  const [proteinaNuevo, setProteinaNuevo] = useState('')
  const [carbohidratosNuevo, setCarbohidratosNuevo] = useState('')
  const [grasaNuevo, setGrasaNuevo] = useState('')
  const [cantidadGramos, setCantidadGramos] = useState('100')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    let alimentoId: number
    const cantidad = Number(cantidadGramos)

    if (alimentoSeleccionado === ALIMENTO_NUEVO) {
      if (!nombreNuevo.trim()) {
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
        const calorias = Number(caloriasNuevo)
        const proteina = Number(proteinaNuevo)
        const carbohidratos = Number(carbohidratosNuevo)
        const grasa = Number(grasaNuevo)
        if ([calorias, proteina, carbohidratos, grasa].some((v) => Number.isNaN(v) || v < 0)) {
          setError('Completá los valores nutricionales del alimento')
          setGuardando(false)
          return
        }
        const nuevo = await crearAlimento(nombreNuevo.trim(), calorias, proteina, carbohidratos, grasa)
        onAlimentoCreado(nuevo)
        alimentoId = nuevo.id
        setAlimentoSeleccionado(String(nuevo.id))
        setNombreNuevo('')
        setCaloriasNuevo('')
        setProteinaNuevo('')
        setCarbohidratosNuevo('')
        setGrasaNuevo('')
      } else {
        alimentoId = Number(alimentoSeleccionado)
      }

      await onAgregar(alimentoId, cantidad)
      setCantidadGramos('100')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar el alimento')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${idPrefix}-alimento`}>Alimento</label>
      <select
        id={`${idPrefix}-alimento`}
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
          <label htmlFor={`${idPrefix}-nombre-nuevo`}>Nombre del alimento</label>
          <input
            id={`${idPrefix}-nombre-nuevo`}
            value={nombreNuevo}
            onChange={(event) => setNombreNuevo(event.target.value)}
          />

          <label htmlFor={`${idPrefix}-calorias`}>Calorías por 100g</label>
          <input
            id={`${idPrefix}-calorias`}
            type="number"
            min={0}
            step="0.1"
            value={caloriasNuevo}
            onChange={(event) => setCaloriasNuevo(event.target.value)}
          />

          <label htmlFor={`${idPrefix}-proteina`}>Proteína por 100g</label>
          <input
            id={`${idPrefix}-proteina`}
            type="number"
            min={0}
            step="0.1"
            value={proteinaNuevo}
            onChange={(event) => setProteinaNuevo(event.target.value)}
          />

          <label htmlFor={`${idPrefix}-carbohidratos`}>Carbohidratos por 100g</label>
          <input
            id={`${idPrefix}-carbohidratos`}
            type="number"
            min={0}
            step="0.1"
            value={carbohidratosNuevo}
            onChange={(event) => setCarbohidratosNuevo(event.target.value)}
          />

          <label htmlFor={`${idPrefix}-grasa`}>Grasa por 100g</label>
          <input
            id={`${idPrefix}-grasa`}
            type="number"
            min={0}
            step="0.1"
            value={grasaNuevo}
            onChange={(event) => setGrasaNuevo(event.target.value)}
          />
        </>
      )}

      <label htmlFor={`${idPrefix}-cantidad`}>Cantidad (g)</label>
      <input
        id={`${idPrefix}-cantidad`}
        type="number"
        min={1}
        value={cantidadGramos}
        onChange={(event) => setCantidadGramos(event.target.value)}
      />

      {error && <p className="field-error">{error}</p>}

      <button type="submit" disabled={guardando}>
        {guardando ? 'Agregando...' : textoBoton}
      </button>
    </form>
  )
}
