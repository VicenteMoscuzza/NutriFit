import api from "./axiosConfig";

export async function listAlimentos() {
  const res = await api.get("/api/alimentos");
  return res.data;
}

export async function createAlimento(payload) {
  const res = await api.post("/api/alimentos", payload);
  return res.data;
}

