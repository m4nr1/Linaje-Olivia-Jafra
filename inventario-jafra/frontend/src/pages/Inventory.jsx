import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../services/productService'; 

const Inventory = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para CREAR producto
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '', name: '', description: '', stock: 0, category: '', price: 0
  });

  // Estados para EDITAR producto (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await getProducts();
        setProducts(data.data || data.products || data); 
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Funciones para CREAR
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      alert('✅ Producto Registrado con Éxito');
      
      setNewProduct({ sku: '', name: '', description: '', stock: 0, category: '', price: 0 });
      setShowForm(false);
      
      const updatedData = await getProducts();
      setProducts(updatedData.data || updatedData.products || updatedData);
    } catch (err) {
      alert(err);
    }
  };

  // Función para ELIMINAR
  const handleDelete = async (id, name) => {
    const confirmar = window.confirm(`¿Estás Seguro de que Deseas Eliminar Permanentemente: ${name}?`);
    if (confirmar) {
      try {
        await deleteProduct(id);
        alert('🗑️ Producto Eliminado Correctamente');
        const updatedData = await getProducts();
        setProducts(updatedData.data || updatedData.products || updatedData);
      } catch (err) {
        alert(err);
      }
    }
  };

  // Funciones para EDITAR
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true); 
  };

  const handleEditChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingProduct._id, editingProduct);
      alert('✏️ Producto Actualizado con Éxito');
      
      setIsModalOpen(false);
      setEditingProduct(null);
      
      const updatedData = await getProducts();
      setProducts(updatedData.data || updatedData.products || updatedData);
    } catch (err) {
      alert(err);
    }
  };

  //INDEX de la Página
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Panel de Inventario</h1>
          <h3>Bienvenido/a, {userInfo?.name || 'Administrador'}</h3>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#d81b60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {showForm ? '❌ Cancelar Registro' : '➕ Registrar Nuevo Producto'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <input type="text" name="sku" placeholder="SKU (Ej. JAF-002)" value={newProduct.sku} onChange={handleInputChange} required style={{ padding: '8px', flex: '1 1 150px' }} />
          <input type="text" name="name" placeholder="Nombre del Producto" value={newProduct.name} onChange={handleInputChange} required style={{ padding: '8px', flex: '2 1 200px' }} />
          <input type="text" name="category" placeholder="Categoría" value={newProduct.category} onChange={handleInputChange} required style={{ padding: '8px', flex: '1 1 150px' }} />
          <input type="number" name="stock" placeholder="Stock Inicial" value={newProduct.stock} onChange={handleInputChange} required min="0" style={{ padding: '8px', flex: '1 1 100px' }} />
          <input type="number" name="price" placeholder="Precio ($)" value={newProduct.price} onChange={handleInputChange} required min="0" style={{ padding: '8px', flex: '1 1 100px' }} />
          <input type="text" name="description" placeholder="Descripción breve" value={newProduct.description} onChange={handleInputChange} style={{ padding: '8px', flex: '1 1 100%' }} />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
            Guardar Producto
          </button>
        </form>
      )}

      {loading && <p>Cargando el Catálogo de Jafra...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '12px' }}>SKU</th>
              <th style={{ padding: '12px' }}>Producto</th>
              <th style={{ padding: '12px' }}>Descripción</th>
              <th style={{ padding: '12px' }}>Categoría</th>
              <th style={{ padding: '12px' }}>Stock</th>
              <th style={{ padding: '12px' }}>Precio</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{product.sku}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{product.name}</td>
                <td style={{ padding: '12px', color: '#555', fontStyle: !product.description ? 'italic' : 'normal' }}>
                  {product.description || 'N/A'}
                </td>
                <td style={{ padding: '12px' }}>{product.category}</td>
                <td style={{ padding: '12px', color: product.stock < 5 ? 'red' : 'green', fontWeight: 'bold' }}>
                  {product.stock}
                </td>
                <td style={{ padding: '12px' }}>${product.price}</td>
                
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    title="Editar Producto"
                    onClick={() => handleEditClick(product)} // <-- Activamos el click de edición
                    style={{ marginRight: '8px', padding: '6px 10px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✏️
                  </button>
                  <button 
                    title="Eliminar Producto"
                    onClick={() => handleDelete(product._id, product.name)}
                    style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL DE EDICIÓN FLOTANTE */}
      {isModalOpen && editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>✏️ Editar Producto</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>SKU</label>
              <input type="text" name="sku" value={editingProduct.sku} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Nombre</label>
              <input type="text" name="name" value={editingProduct.name} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Categoría</label>
              <input type="text" name="category" value={editingProduct.category} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Stock</label>
                  <input type="number" name="stock" value={editingProduct.stock} onChange={handleEditChange} required min="0" style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Precio ($)</label>
                  <input type="number" name="price" value={editingProduct.price} onChange={handleEditChange} required min="0" style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
              </div>

              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Descripción</label>
              <input type="text" name="description" value={editingProduct.description || ''} onChange={handleEditChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;