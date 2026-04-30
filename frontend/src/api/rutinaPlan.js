import api from "./axiosConfig";

export async function listRutinaPlan() {
  const res = await api.get("/api/rutina-plan");
  return res.data;
}

export async function addRutinaToDia({ diaSemana, rutinaId }) {
  const res = await api.post("/api/rutina-plan", { diaSemana, rutinaId });
  return res.data;
}

export async function removeRutinaPlanItem(id) {
  await api.delete(`/api/rutina-plan/${id}`);
}

