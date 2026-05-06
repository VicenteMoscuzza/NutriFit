import api from "./axiosConfig";

export async function listEjercicios() {
  const res = await api.get("/api/ejercicios");
  return res.data;
}

export async function createEjercicio({ nombre, descripcion }) {
  const res = await api.post("/api/ejercicios", { nombre, descripcion });
  return res.data;
}

export async function updateEjercicio(id, { nombre, descripcion }) {
  const res = await api.put(`/api/ejercicios/${id}`, { nombre, descripcion });
  return res.data;
}

export async function deleteEjercicio(id) {
  await api.delete(`/api/ejercicios/${id}`);
}

