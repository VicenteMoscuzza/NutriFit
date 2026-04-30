import api from '../api/axiosConfig';

export const login = async (username, password) => {
  // La cookie se guarda automáticamente, no necesitas hacer nada más
  const response = await api.post('/api/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  // El backend limpia la cookie
  await api.post('/api/auth/logout');
};

export const getProfile = async () => {
  // La cookie se envía automáticamente en cada request
  const response = await api.get('/api/user/profile');
  return response.data;
};