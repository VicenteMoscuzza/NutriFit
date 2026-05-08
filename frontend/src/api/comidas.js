import api from "./axiosConfig";

export async function listComidas() {
  const res = await api.get("/api/comidas");
  return res.data;
}

export async function createComida({ tipoComida = 1, nombre, descripcion, fecha }) {
  const res = await api.post("/api/comidas", { tipoComida, nombre, descripcion, fecha });
  return res.data;
}

export async function createComidaWithAlimentos({ tipoComida, nombre, descripcion, fecha, alimentos, alimentoIds }) {
  const res = await api.post("/api/comidas", { tipoComida, nombre, descripcion, fecha, alimentos, alimentoIds });
  return res.data;
}

export async function updateComida(id, { tipoComida, nombre, descripcion, fecha, alimentos, alimentoIds }) {
  const res = await api.put(`/api/comidas/${id}`, { tipoComida, nombre, descripcion, fecha, alimentos, alimentoIds });
  return res.data;
}

export async function deleteComida(id) {
  await api.delete(`/api/comidas/${id}`);
}

export async function calcularMacrosComida({ alimentos }) {
  const res = await api.post("/api/comidas/calcular", { alimentos });
  return res.data;
}

