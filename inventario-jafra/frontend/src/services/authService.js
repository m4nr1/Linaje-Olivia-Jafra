import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/auth';

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error de Conexión con el Servidor.';
  }
};