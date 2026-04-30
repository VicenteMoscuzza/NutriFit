import api from "./axiosConfig";

export async function listEjercicios() {
  const res = await api.get("/api/ejercicios");
  return res.data;
}

export async function createEjercicio({ nombre, descripcion }) {
  const res = await api.post("/api/ejercicios", { nombre, descripcion });
  return res.data;
}

