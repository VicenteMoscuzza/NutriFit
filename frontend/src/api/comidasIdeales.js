import api from "./axiosConfig";

export async function listComidasIdeales() {
  const res = await api.get("/api/comidas-ideales");
  return res.data;
}

export async function createComidaIdeal({ tipoComida, nombre, descripcion, alimentos }) {
  const res = await api.post("/api/comidas-ideales", { tipoComida, nombre, descripcion, alimentos });
  return res.data;
}

export async function updateComidaIdeal(id, { tipoComida, nombre, descripcion, alimentos }) {
  const res = await api.put(`/api/comidas-ideales/${id}`, { tipoComida, nombre, descripcion, alimentos });
  return res.data;
}

export async function deleteComidaIdeal(id) {
  await api.delete(`/api/comidas-ideales/${id}`);
}

