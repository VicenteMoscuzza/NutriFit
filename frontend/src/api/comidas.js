import api from "./axiosConfig";

export async function listComidas() {
  const res = await api.get("/api/comidas");
  return res.data;
}

export async function createComida({ nombre, descripcion, fecha }) {
  const res = await api.post("/api/comidas", { nombre, descripcion, fecha });
  return res.data;
}

export async function createComidaWithAlimentos({ nombre, descripcion, fecha, alimentoIds }) {
  const res = await api.post("/api/comidas", { nombre, descripcion, fecha, alimentoIds });
  return res.data;
}

export async function updateComida(id, { nombre, descripcion, fecha, alimentoIds }) {
  const res = await api.put(`/api/comidas/${id}`, { nombre, descripcion, fecha, alimentoIds });
  return res.data;
}

export async function deleteComida(id) {
  await api.delete(`/api/comidas/${id}`);
}

