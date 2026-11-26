import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoBlanco from '../assets/logo-blanco.svg';
import { IconUser, IconSettings, IconLogout } from './Icons';
import { clearAuthSession } from '../services/authService';

const Navbar = ({ sectionTitle = 'Inicio' }) => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Usuario' };
  const avatarPhoto = userInfo.avatar || '';
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const confirmLogout = () => {
  clearAuthSession();
  navigate('/login', { replace: true });
};

  const initials = (userInfo.name || 'JM')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <header className="lo-navbar">
        <div className="lo-nav-left" onClick={() => navigate('/inventory')}>
          <img
            src={logoBlanco}
            alt="Linaje Olivia"
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
          />
          <div className="lo-nav-divider" />
          <span className="lo-nav-section">{sectionTitle}</span>
        </div>

        <div className="lo-user-menu-wrapper" ref={menuRef}>
          <button className="lo-user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
            {avatarPhoto ? (
                <img
                src={avatarPhoto}
                alt="Perfil"
                className="lo-avatar-sm"
                style={{ objectFit: 'cover' }}
                />
            ) : (
              <div className="lo-avatar-sm">{initials}</div>
            )}
            <span className="lo-user-name-desktop">{userInfo.name}</span>
            <span className={`lo-chevron ${menuOpen ? 'open' : ''}`}>▼</span>
          </button>

          {menuOpen && (
            <div className="lo-user-dropdown">
              <button
                className="lo-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <IconUser /> Mi Perfil
              </button>
              <button
                className="lo-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <IconSettings /> Configuración
              </button>
              <button
                className="lo-dropdown-item danger"
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutModal(true);
                }}
              >
                <IconLogout /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="lo-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="lo-alert-card" onClick={(e) => e.stopPropagation()}>
            <div className="lo-alert-icon danger">
              <IconLogout />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>¿Cerrar Sesión?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              ¿Estás seguro/a que deseas salir del sistema de inventarios?
            </p>
            <div className="lo-alert-actions">
              <button className="lo-btn lo-btn-secondary" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
              <button className="lo-btn lo-btn-danger" onClick={confirmLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;