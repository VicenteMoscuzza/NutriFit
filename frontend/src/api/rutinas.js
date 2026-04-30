import api from "./axiosConfig";

export async function listRutinas() {
  const res = await api.get("/api/rutinas");
  return res.data;
}

export async function createRutina({ nombre, descripcion }) {
  const res = await api.post("/api/rutinas", { nombre, descripcion });
  return res.data;
}

export async function createRutinaWithEjercicios({ nombre, descripcion, ejercicioIds }) {
  const res = await api.post("/api/rutinas", { nombre, descripcion, ejercicioIds });
  return res.data;
}

export async function updateRutina(id, { nombre, descripcion, ejercicioIds }) {
  const res = await api.put(`/api/rutinas/${id}`, { nombre, descripcion, ejercicioIds });
  return res.data;
}

export async function deleteRutina(id) {
  await api.delete(`/api/rutinas/${id}`);
}

