import api from "./axiosConfig";

export async function getEntrenamientoActivo() {
  const res = await api.get("/api/entrenamientos/activo");
  return res.data ?? null;
}

export async function getEntrenamiento(id) {
  const res = await api.get(`/api/entrenamientos/${id}`);
  return res.data;
}

export async function iniciarEntrenamiento(rutinaId) {
  const res = await api.post("/api/entrenamientos", { rutinaId });
  return res.data;
}

export async function actualizarSerie(serieId, payload) {
  const res = await api.patch(`/api/entrenamientos/series/${serieId}`, payload);
  return res.data;
}

export async function agregarSerie(ejercicioEntrenamientoId) {
  const res = await api.post(`/api/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/series`);
  return res.data;
}

export async function eliminarSerie(serieId) {
  const res = await api.delete(`/api/entrenamientos/series/${serieId}`);
  return res.data;
}

export async function finalizarEntrenamiento(id) {
  const res = await api.post(`/api/entrenamientos/${id}/finalizar`);
  return res.data;
}
