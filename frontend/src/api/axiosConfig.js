import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // ⚠️ Obligatorio para enviar/recibir cookies
});

api.interceptors.response.use(
  response => response,
  error => {
    const is401 = error.response?.status === 401;
    const isAuthCheck = error.config?.url?.includes("/api/auth/me");

    // Solo redirigir si es 401 en rutas protegidas, no en el chequeo inicial
    if (is401 && !isAuthCheck) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;