import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 

    try {
      await loginUser(formData);
      navigate('/inventory'); 
    } catch (error) {
      console.error('Error de acceso:', error);
      setErrorMsg(error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <form 
        onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', width: '320px', gap: '15px', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      >
        <h2 style={{ textAlign: 'center', color: '#333' }}>Linaje Olivia Jafra</h2>
        <h4 style={{ textAlign: 'center', color: '#666', marginTop: '-10px' }}>Control de Inventario</h4>
        
        {/* Renderizado condicional: Solo aparece si hay un error */}
        {errorMsg && <div style={{ color: '#d81b60', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{errorMsg}</div>}
        
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#d81b60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;