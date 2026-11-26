import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/auth';

export const saveAuthSession = (data, remember = true) => {
  if (!data?.token) return;

  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data));

  if (remember) {
    localStorage.setItem('rememberSession', 'true');
    if (data.email) localStorage.setItem('rememberedEmail', data.email);
    sessionStorage.removeItem('tempSessionActive');
  } else {
    localStorage.removeItem('rememberSession');
    localStorage.removeItem('rememberedEmail');
    sessionStorage.setItem('tempSessionActive', 'true');
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('rememberSession');
  sessionStorage.removeItem('tempSessionActive');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('userToken');
  if (!token) return false;

  const isPersistent = localStorage.getItem('rememberSession') === 'true';
  const isTempTabActive = sessionStorage.getItem('tempSessionActive') === 'true';

  // Si la sesión no era persistente y se cerró la pestaña/navegador, limpia la sesión
  if (!isPersistent && !isTempTabActive) {
    clearAuthSession();
    return false;
  }

  return true;
};

export const loginUser = async (credentials, remember = true) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      saveAuthSession(response.data, remember);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al iniciar sesión';
  }
};

export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await axios.put(`${API_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.token) {
      const keepRemember = localStorage.getItem('rememberSession') === 'true';
      saveAuthSession(response.data, keepRemember);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar el perfil';
  }
};