import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/auth';

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
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
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al actualizar el perfil';
  }
};