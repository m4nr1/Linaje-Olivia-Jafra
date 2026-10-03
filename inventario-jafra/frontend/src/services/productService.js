import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/products';

export const getProducts = async () => {
  const token = localStorage.getItem('userToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.get(API_URL, config);
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || '🔴 Error al Conectar con el Inventario.';
  }
};

export const createProduct = async (productData) => {
  const token = localStorage.getItem('userToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.post(API_URL, productData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || '🔴 Error al Registrar el Producto.';
  }
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem('userToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || '🔴 Error al Eliminar el Producto.';
  }
};

export const updateProduct = async (id, productData) => {
  const token = localStorage.getItem('userToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await axios.put(`${API_URL}/${id}`, productData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || '🔴 Error al Actualizar el Producto.';
  }
};