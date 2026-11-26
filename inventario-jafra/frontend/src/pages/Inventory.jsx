import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../services/productService';
import Navbar from '../components/Navbar';
import {
  IconSearch,
  IconPlusCircle,
  IconEdit,
  IconTrash,
  IconWarning,
  IconCheck,
} from '../components/Icons';

const DEFAULT_CATEGORIES = ['Fragancias', 'Cuidado Facial', 'Maquillaje', 'Cuidado Corporal'];

const Inventory = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Juan Manrique' };
  const settings = JSON.parse(localStorage.getItem('inventorySettings')) || {
    lowStockThreshold: 10,
    currency: 'MXN ($)',
    itemsPerPage: 10,
  };
  const currencySymbol = settings.currency?.startsWith('EUR') ? '€' : '$';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Buscador y Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const filterRef = useRef(null);

  // Categorías dinámicas (sin useEffect extra para evitar renders en cascada)
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('jafraCategories'));
    return saved && saved.length > 0 ? saved : DEFAULT_CATEGORIES;
  });

  const categories = useMemo(() => {
    const fromDb = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...customCategories, ...fromDb]));
  }, [customCategories, products]);

  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [addingNewCat, setAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Modal unificado Registrar / Editar
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState({
    _id: '',
    sku: '',
    name: '',
    category: '',
    stock: '',
    price: '',
    description: '',
  });
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Modales de confirmación y éxito
  const [dialogState, setDialogState] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const reloadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      const list = data.data || data.products || data;
      setProducts(Array.isArray(list) ? list : []);
      setError('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getProducts();
        if (!active) return;
        const list = data.data || data.products || data;
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!active) return;
        setError(typeof err === 'string' ? err : 'Error al cargar el inventario.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const kpis = useMemo(() => {
    const threshold = Number(settings.lowStockThreshold) || 10;
    const totalUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const totalProducts = products.length;
    const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= threshold).length;
    const outOfStock = products.filter((p) => Number(p.stock) === 0).length;
    return { totalUnits, totalProducts, lowStock, outOfStock };
  }, [products, settings.lowStockThreshold]);

  const filteredProducts = useMemo(() => {
    const threshold = Number(settings.lowStockThreshold) || 10;
    const q = searchQuery.trim().toLowerCase();

    let result = products.filter((p) => {
      const matchesText =
        !q ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);

      const st = Number(p.stock) || 0;
      let matchesStock = true;
      if (stockFilter === 'available') matchesStock = st > threshold;
      if (stockFilter === 'low') matchesStock = st > 0 && st <= threshold;
      if (stockFilter === 'out') matchesStock = st === 0;

      return matchesText && matchesStock;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'stock_asc') return Number(a.stock) - Number(b.stock);
      if (sortBy === 'stock_desc') return Number(b.stock) - Number(a.stock);
      if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'updated_desc') {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, stockFilter, sortBy, settings.lowStockThreshold]);

  const openCreateModal = () => {
    const empty = { _id: '', sku: '', name: '', category: '', stock: '', price: '', description: '' };
    setFormMode('create');
    setFormData(empty);
    setInitialSnapshot(JSON.stringify(empty));
    setFormErrors({});
    setCatMenuOpen(false);
    setAddingNewCat(false);
    setNewCatName('');
    setFormModalOpen(true);
  };

  const openEditModal = (product) => {
    const filled = {
      _id: product._id,
      sku: product.sku || '',
      name: product.name || '',
      category: product.category || '',
      stock: product.stock ?? 0,
      price: product.price ?? 0,
      description: product.description || '',
    };
    setFormMode('edit');
    setFormData(filled);
    setInitialSnapshot(JSON.stringify(filled));
    setFormErrors({});
    setCatMenuOpen(false);
    setAddingNewCat(false);
    setNewCatName('');
    setFormModalOpen(true);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleAddCategory = () => {
    const clean = newCatName.trim();
    if (!clean) return;
    const updated = Array.from(new Set([...categories, clean]));
    setCustomCategories(updated);
    localStorage.setItem('jafraCategories', JSON.stringify(updated));
    setFormData({ ...formData, category: clean });
    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
    setNewCatName('');
    setAddingNewCat(false);
    setCatMenuOpen(false);
  };

  const attemptCloseForm = () => {
    const isDirty = JSON.stringify(formData) !== initialSnapshot;
    if (isDirty) {
      setDialogState('confirmExitForm');
    } else {
      setFormModalOpen(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!String(formData.sku).trim()) errs.sku = '¡Rellene este campo!';
    if (!String(formData.name).trim()) errs.name = '¡Escriba el nombre del producto!';
    if (!String(formData.category).trim()) errs.category = '¡Seleccione una categoría!';
    if (formData.stock === '' || Number(formData.stock) < 0) errs.stock = '¡Rellene este campo!';
    if (formData.price === '' || Number(formData.price) < 0) errs.price = '¡Rellene este campo!';
    if (!String(formData.description).trim()) errs.description = '¡Rellene este campo!';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formMode === 'edit') {
      setDialogState('confirmSaveEdit');
      return;
    }

    await executeSaveProduct();
  };

  const executeSaveProduct = async () => {
    setSubmitting(true);
    try {
      const payload = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        stock: Number(formData.stock),
        price: Number(formData.price),
        description: formData.description.trim(),
      };

      if (formMode === 'create') {
        await createProduct(payload);
        setFormModalOpen(false);
        setDialogState('savedCreateSuccess');
      } else {
        await updateProduct(formData._id, payload);
        setFormModalOpen(false);
        setDialogState('savedEditSuccess');
      }
      await reloadProducts();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Error al guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const askDeleteProduct = (product) => {
    setProductToDelete(product);
    setDialogState('confirmDelete');
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    setSubmitting(true);
    try {
      await deleteProduct(productToDelete._id);
      setProductToDelete(null);
      setDialogState('deletedSuccess');
      await reloadProducts();
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Error al eliminar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStyle = (stock) => {
    const st = Number(stock) || 0;
    const threshold = Number(settings.lowStockThreshold) || 10;
    if (st === 0) return { color: 'var(--status-danger)', bg: 'var(--status-danger-bg)', label: '0 Agotado' };
    if (st <= threshold) return { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', label: `${st} en stock` };
    return { color: 'var(--status-success)', bg: 'var(--status-success-bg)', label: `${st} en stock` };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar sectionTitle="Inicio" />

      <main className="lo-container" style={{ width: '100%' }}>
        <p className="lo-welcome-sub">
          Bienvenido/a <span>{userInfo.name}</span>
        </p>
        <h1 className="lo-page-title">Panel de Inventario</h1>

        <section className="lo-kpi-grid">
          <div className="lo-kpi-card">
            <div className="lo-kpi-label">Unidades Totales</div>
            <div className="lo-kpi-value" style={{ color: 'var(--olive-mid)' }}>
              {kpis.totalUnits.toLocaleString('es-MX')}
            </div>
          </div>

          <div className="lo-kpi-card">
            <div className="lo-kpi-label">Productos Registrados</div>
            <div className="lo-kpi-value" style={{ color: 'var(--olive-mid)' }}>
              {kpis.totalProducts.toLocaleString('es-MX')}
            </div>
          </div>

          <div className="lo-kpi-card">
            <div className="lo-kpi-label">Productos a Punto de Agotarse</div>
            <div className="lo-kpi-value" style={{ color: 'var(--status-warning)' }}>
              {kpis.lowStock}
            </div>
          </div>

          <div className="lo-kpi-card">
            <div className="lo-kpi-label">Productos Fuera de Stock</div>
            <div className="lo-kpi-value" style={{ color: 'var(--status-danger)' }}>
              {kpis.outOfStock}
            </div>
          </div>
        </section>

        <section className="lo-toolbar">
          <button className="lo-btn lo-btn-olive" onClick={openCreateModal}>
            <IconPlusCircle /> Registrar Nuevo Producto
          </button>

          <div className="lo-search-box">
            <span className="lo-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              className="lo-search-input"
              placeholder="Buscar por SKU, producto o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="lo-filter-wrapper" ref={filterRef}>
            <button
              type="button"
              className="lo-btn lo-btn-secondary"
              style={{ width: '100%' }}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filtros de Búsqueda <span style={{ fontSize: '10px' }}>{filterOpen ? '▲' : '▼'}</span>
            </button>

            {filterOpen && (
              <div className="lo-filter-popover">
                <div>
                  <span className="lo-label">Estado de Stock</span>
                  <div className="lo-pill-group">
                    {[
                      { id: 'all', label: 'Todas', cls: 'pill-all' },
                      { id: 'available', label: 'Disponible', cls: 'pill-available' },
                      { id: 'low', label: 'Stock Bajo', cls: 'pill-low' },
                      { id: 'out', label: 'Agotado', cls: 'pill-out' },
                    ].map((opt) => (
                    <button
                    key={opt.id}
                    type="button"
                    className={`lo-pill ${opt.cls} ${stockFilter === opt.id ? 'active' : ''}`}
                    onClick={() => setStockFilter(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                  </div>
                </div>

                <div className="lo-field">
                  <label className="lo-label">Ordenar Por</label>
                  <select className="lo-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recent">Fecha de Creación</option>
                    <option value="stock_desc">Mayor stock</option>
                    <option value="stock_asc">Menor stock</option>
                    <option value="price_desc">Precio más alto</option>
                    <option value="price_asc">Precio más bajo</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="updated_desc">Fecha Modificación</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="lo-btn lo-btn-secondary"
                    style={{ flex: 1, height: '38px' }}
                    onClick={() => {
                      setStockFilter('all');
                      setSortBy('recent');
                      setSearchQuery('');
                    }}
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    className="lo-btn lo-btn-olive"
                    style={{ flex: 1, height: '38px' }}
                    onClick={() => setFilterOpen(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {loading && <p style={{ padding: '24px 0', color: 'var(--text-secondary)' }}>Cargando catálogo de Linaje Olivia...</p>}
        {error && <p className="lo-error-text" style={{ padding: '16px 0' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="lo-table-wrapper">
              <table className="lo-table">
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>SKU</th>
                    <th style={{ width: '210px' }}>Producto</th>
                    <th>Descripción</th>
                    <th style={{ width: '130px' }}>Categoría</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Stock</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Precio Unitario</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No se encontraron productos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stInfo = getStockStyle(product.stock);
                      return (
                        <tr key={product._id}>
                          <td style={{ fontWeight: 600 }}>{product.sku}</td>
                          <td style={{ fontWeight: 700 }}>{product.name}</td>
                          <td style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {product.description || 'Sin descripción registrada.'}
                          </td>
                          <td>{product.category}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: stInfo.color }}>
                            {product.stock}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {currencySymbol}
                            {Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <div className="lo-action-btns">
                              <button
                                type="button"
                                className="lo-icon-btn edit"
                                title="Editar Producto"
                                onClick={() => openEditModal(product)}
                              >
                                <IconEdit />
                              </button>
                              <button
                                type="button"
                                className="lo-icon-btn delete"
                                title="Eliminar Producto"
                                onClick={() => askDeleteProduct(product)}
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* VISTA TARJETAS MÓVIL / ANDROID */}
            <div className="lo-mobile-cards">
              {filteredProducts.length === 0 ? (
                <div className="lo-m-empty-card">
                  <div className="lo-m-empty-badge">Sin productos</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {products.length === 0
                      ? 'Aún no hay productos en el inventario'
                      : 'No se encontraron coincidencias'}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {products.length === 0
                      ? 'Usa el botón superior "Registrar Nuevo Producto" para agregar tu primer artículo de Linaje Olivia.'
                      : 'Prueba limpiando los filtros de búsqueda o cambiando el término escrito.'}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const stInfo = getStockStyle(product.stock);
                  const isOut = Number(product.stock) === 0;
                  return (
                    <article key={product._id} className="lo-m-card">
                      {/* Fila superior: SKU a la izquierda y Badge de stock a la derecha */}
                      <div className="lo-m-card-row-top">
                        <span className="lo-m-sku">{product.sku}</span>
                        <span
                          className="lo-m-badge"
                          style={{
                            backgroundColor: isOut ? 'var(--status-danger)' : 'var(--brand-3)',
                            color: isOut ? '#FFFFFF' : 'var(--status-success)',
                          }}
                        >
                          {stInfo.label}
                        </span>
                      </div>

                      {/* Fila media: Nombre del producto a la izquierda y Precio a la derecha */}
                      <div className="lo-m-card-row-mid">
                        <h3 className="lo-m-title">{product.name}</h3>
                        <strong className="lo-m-price">
                          {currencySymbol}
                          {Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      {/* Píldora de categoría en crema #EFE5D0 */}
                      <span className="lo-m-cat-pill">{product.category}</span>

                      {/* Fila inferior: Descripción truncada a la izquierda y botones Editar / Eliminar a la derecha */}
                      <div className="lo-m-card-row-bottom">
                        <p className="lo-m-desc">
                          {product.description || 'Sin descripción registrada.'}
                        </p>
                        <div className="lo-action-btns" style={{ flexShrink: 0 }}>
                          <button
                            type="button"
                            className="lo-icon-btn edit"
                            title="Editar Producto"
                            onClick={() => openEditModal(product)}
                          >
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="lo-icon-btn delete"
                            title="Eliminar Producto"
                            onClick={() => askDeleteProduct(product)}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      <footer className="lo-footer">
        Linaje Olivia, JAFRA COSMETICS S.A. DE C.V. © 2026 - Todos los Derechos Reservados
      </footer>

      {formModalOpen && (
        <div className="lo-modal-overlay" onClick={attemptCloseForm}>
          <div className="lo-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '21px', fontWeight: 800, marginBottom: '18px' }}>
              {formMode === 'create' ? 'Registrar Nuevo Producto' : 'Editar Producto'}
            </h2>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lo-field">
                <label className="lo-label">Sku (Ej. 69656-A)</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="69656-A"
                  className={`lo-input ${formErrors.sku ? 'error' : ''}`}
                  value={formData.sku}
                  onChange={handleFieldChange}
                />
                {formErrors.sku && <span className="lo-error-text">{formErrors.sku}</span>}
              </div>

              <div className="lo-field">
                <label className="lo-label">Nombre del producto</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ej. Double Nature Devil Edición Especial"
                  className={`lo-input ${formErrors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleFieldChange}
                />
                {formErrors.name && <span className="lo-error-text">{formErrors.name}</span>}
              </div>

              <div className="lo-field">
                <label className="lo-label">Categoría</label>
                <div className="lo-cat-dropdown-box">
                  <button
                    type="button"
                    className={`lo-cat-trigger ${formErrors.category ? 'error' : ''}`}
                    onClick={() => setCatMenuOpen(!catMenuOpen)}
                  >
                    <span style={{ color: formData.category ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {formData.category || 'Seleccionar...'}
                    </span>
                    <span style={{ fontSize: '10px' }}>{catMenuOpen ? '▲' : '▼'}</span>
                  </button>

                  {catMenuOpen && (
                    <div className="lo-cat-menu">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className="lo-cat-option"
                          onClick={() => {
                            setFormData({ ...formData, category: cat });
                            if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                            setCatMenuOpen(false);
                          }}
                        >
                          {cat}
                        </button>
                      ))}

                      {!addingNewCat ? (
                        <button
                          type="button"
                          className="lo-cat-add-trigger"
                          onClick={() => setAddingNewCat(true)}
                        >
                          + Agregar nueva categoría
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', padding: '10px', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-cream)' }}>
                          <input
                            type="text"
                            className="lo-input"
                            style={{ height: '36px', padding: '0 10px' }}
                            placeholder="Nueva categoría..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="lo-icon-btn edit"
                            style={{ width: '36px', height: '36px', flexShrink: 0 }}
                            onClick={handleAddCategory}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className="lo-icon-btn delete"
                            style={{ width: '36px', height: '36px', flexShrink: 0 }}
                            onClick={() => {
                              setAddingNewCat(false);
                              setNewCatName('');
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formErrors.category && <span className="lo-error-text">{formErrors.category}</span>}
              </div>

              <div className="lo-form-grid-2">
                <div className="lo-field">
                  <label className="lo-label">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    placeholder="0"
                    className={`lo-input ${formErrors.stock ? 'error' : ''}`}
                    value={formData.stock}
                    onChange={handleFieldChange}
                  />
                  {formErrors.stock && <span className="lo-error-text">{formErrors.stock}</span>}
                </div>

                <div className="lo-field">
                  <label className="lo-label">Precio ({currencySymbol})</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`lo-input ${formErrors.price ? 'error' : ''}`}
                    value={formData.price}
                    onChange={handleFieldChange}
                  />
                  {formErrors.price && <span className="lo-error-text">{formErrors.price}</span>}
                </div>
              </div>

              <div className="lo-field">
                <label className="lo-label">Descripción breve</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe brevemente la presentación, notas o contenido..."
                  className={`lo-textarea ${formErrors.description ? 'error' : ''}`}
                  value={formData.description}
                  onChange={handleFieldChange}
                />
                {formErrors.description && <span className="lo-error-text">{formErrors.description}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="lo-btn lo-btn-secondary" onClick={attemptCloseForm}>
                  Cancelar
                </button>
                <button type="submit" className="lo-btn lo-btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {dialogState === 'confirmExitForm' && (
        <div className="lo-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lo-alert-card">
            <div className="lo-alert-icon warning"><IconWarning /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¿Seguro que Deseas Salir?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Hay información nueva registrada sin guardar todavía
            </p>
            <div className="lo-alert-actions">
              <button className="lo-btn lo-btn-secondary" onClick={() => setDialogState(null)}>
                Cancelar
              </button>
              <button
                className="lo-btn lo-btn-primary"
                onClick={() => {
                  setDialogState(null);
                  setFormModalOpen(false);
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogState === 'confirmSaveEdit' && (
        <div className="lo-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lo-alert-card">
            <div className="lo-alert-icon warning"><IconWarning /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¿Seguro que Deseas Guardar?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Hay información nueva registrada, al guardar se actualizará con los nuevos datos
            </p>
            <div className="lo-alert-actions">
              <button className="lo-btn lo-btn-secondary" onClick={() => setDialogState(null)}>
                Cancelar
              </button>
              <button className="lo-btn lo-btn-primary" onClick={executeSaveProduct}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {(dialogState === 'savedCreateSuccess' || dialogState === 'savedEditSuccess') && (
        <div className="lo-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lo-alert-card">
            <div className="lo-alert-icon success"><IconCheck /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¡Guardado Exitosamente!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {dialogState === 'savedCreateSuccess'
                ? 'La información del producto ha sido registrada exitosamente'
                : 'La información del producto ha sido actualizada exitosamente'}
            </p>
            <button className="lo-btn lo-btn-primary" style={{ width: '100%' }} onClick={() => setDialogState(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {dialogState === 'confirmDelete' && productToDelete && (
        <div className="lo-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lo-alert-card">
            <div className="lo-alert-icon danger"><IconTrash /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¿Seguro que Deseas Eliminar este Producto?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Esta acción es permanente y no se puede deshacer ({productToDelete.sku} — {productToDelete.name})
            </p>
            <div className="lo-alert-actions">
              <button
                className="lo-btn lo-btn-secondary"
                onClick={() => {
                  setDialogState(null);
                  setProductToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button className="lo-btn lo-btn-danger" onClick={executeDeleteProduct}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogState === 'deletedSuccess' && (
        <div className="lo-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="lo-alert-card">
            <div className="lo-alert-icon success"><IconCheck /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¡Eliminado Exitosamente!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              El producto ha sido eliminado exitosamente
            </p>
            <button className="lo-btn lo-btn-primary" style={{ width: '100%' }} onClick={() => setDialogState(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;