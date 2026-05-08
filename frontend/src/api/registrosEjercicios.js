import api from "./axiosConfig";

export async function listRegistrosEjercicios() {
  const res = await api.get("/api/registros/ejercicios");
  return res.data;
}

export async function upsertRegistroEjercicio(ejercicioId, { ultimoPesoMaxKg }) {
  const res = await api.put(`/api/registros/ejercicios/${ejercicioId}`, { ultimoPesoMaxKg });
  return res.data;
}

