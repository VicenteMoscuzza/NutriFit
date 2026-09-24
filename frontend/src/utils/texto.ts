export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function coincide(texto: string, busqueda: string) {
  return normalizar(texto).includes(normalizar(busqueda))
}
