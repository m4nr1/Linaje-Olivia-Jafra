import { useState } from 'react';

const Login = () => {
  // 1. Inicializamos la "memoria" de Nuestro Formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 2. Esta Función Intercepta cada Tecla Presionada y Actualiza el Estado
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Esta Función se Ejecuta al Darle Clic al Botón "Entrar"
  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log('🟢 Datos Listos para Enviar al Backend:', formData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <form 
        onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', width: '320px', gap: '15px', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      >
        <h2 style={{ textAlign: 'center', color: '#333' }}>Linaje Olivia Jafra</h2>
        <h4 style={{ textAlign: 'center', color: '#666', marginTop: '-10px' }}>Control de Inventario</h4>
        
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