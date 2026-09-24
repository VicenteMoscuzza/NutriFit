import type { ReactNode, SVGProps } from 'react'

type IconoProps = SVGProps<SVGSVGElement> & { tamanio?: number }

function Icono({ tamanio = 18, children, ...props }: IconoProps & { children: ReactNode }) {
  return (
    <svg
      width={tamanio}
      height={tamanio}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconoCerrar(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icono>
  )
}

export function IconoMas(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icono>
  )
}

export function IconoMenos(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M5 12h14" />
    </Icono>
  )
}

export function IconoBuscar(props: IconoProps) {
  return (
    <Icono {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icono>
  )
}

export function IconoCheck(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icono>
  )
}

export function IconoBasura(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Icono>
  )
}

export function IconoAlerta(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Icono>
  )
}

export function IconoPesa(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
    </Icono>
  )
}

export function IconoPlato(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M6 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </Icono>
  )
}

export function IconoVolver(props: IconoProps) {
  return (
    <Icono {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icono>
  )
}
