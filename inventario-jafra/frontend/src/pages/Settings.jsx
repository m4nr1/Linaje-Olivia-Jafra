import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { IconWarning, IconCheck } from '../components/Icons';

const DEFAULT_SETTINGS = {
  lowStockThreshold: 10,
  blockOutOfStock: true,
  currency: 'MXN ($)',
  itemsPerPage: 10,
};

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('inventorySettings')) || DEFAULT_SETTINGS;
  });
  const [dirty, setDirty] = useState(false);
  const [modalState, setModalState] = useState(null);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setDirty(true);
  };

  const executeSave = () => {
    localStorage.setItem('inventorySettings', JSON.stringify(settings));
    setDirty(false);
    setModalState('savedSuccess');
  };

  const executeReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('inventorySettings', JSON.stringify(DEFAULT_SETTINGS));
    setDirty(false);
    setModalState('savedSuccess');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar sectionTitle="Configuración" />

      <main className="lo-container" style={{ maxWidth: '820px', width: '100%' }}>
        <button className="lo-back-btn" onClick={() => (dirty ? setModalState('confirmExit') : navigate('/inventory'))}>
          ← Volver a Inicio
        </button>

        <div className="lo-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, textAlign: 'center' }}>
            Configuración del Sistema
          </h1>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Reglas de Stock</h3>

            <div className="lo-field" style={{ marginBottom: '12px' }}>
              <label className="lo-label">Umbral de stock bajo (Punto de reorden)</label>
              <input
                type="number"
                min="1"
                className="lo-input"
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
              />
            </div>

            <div className="lo-switch-row">
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Bloquear ventas sin stock</span>
              <label className="lo-switch">
                <input
                  type="checkbox"
                  checked={settings.blockOutOfStock}
                  onChange={(e) => handleChange('blockOutOfStock', e.target.checked)}
                />
                <span className="lo-slider" />
              </label>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Preferencias Regionales</h3>

            <div className="lo-field" style={{ marginBottom: '14px' }}>
              <label className="lo-label">Moneda</label>
              <select
                className="lo-select"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="MXN ($)">MXN ($)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>

            <div className="lo-field">
              <label className="lo-label">Elementos en página</label>
              <select
                className="lo-select"
                value={settings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
              >
                <option value={5}>5 Máximo</option>
                <option value={10}>10 Máximo</option>
                <option value={25}>25 Máximo</option>
                <option value={50}>50 Máximo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="lo-btn lo-btn-secondary" onClick={executeReset}>
              Restablecer
            </button>
            <button type="button" className="lo-btn lo-btn-primary" onClick={() => setModalState('confirmSave')}>
              Guardar
            </button>
          </div>
        </div>
      </main>

      <footer className="lo-footer">
        Linaje Olivia, JAFRA COSMETICS S.A. DE C.V. © 2026 - Todos los Derechos Reservados
      </footer>

      {modalState === 'confirmExit' && (
        <div className="lo-modal-overlay">
          <div className="lo-alert-card">
            <div className="lo-alert-icon warning"><IconWarning /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¿Seguro que Deseas Salir?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Hay información nueva registrada sin guardar todavía</p>
            <div className="lo-alert-actions">
              <button className="lo-btn lo-btn-secondary" onClick={() => setModalState(null)}>Cancelar</button>
              <button className="lo-btn lo-btn-primary" onClick={() => navigate('/inventory')}>Salir</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'confirmSave' && (
        <div className="lo-modal-overlay">
          <div className="lo-alert-card">
            <div className="lo-alert-icon warning"><IconWarning /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¿Seguro que Deseas Guardar?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Hay información nueva registrada, al guardar se actualizará con los nuevos datos</p>
            <div className="lo-alert-actions">
              <button className="lo-btn lo-btn-secondary" onClick={() => setModalState(null)}>Cancelar</button>
              <button className="lo-btn lo-btn-primary" onClick={executeSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'savedSuccess' && (
        <div className="lo-modal-overlay">
          <div className="lo-alert-card">
            <div className="lo-alert-icon success"><IconCheck /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>¡Guardado Exitosamente!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>La información ha sido guardada exitosamente</p>
            <button className="lo-btn lo-btn-primary" style={{ width: '100%' }} onClick={() => setModalState(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;