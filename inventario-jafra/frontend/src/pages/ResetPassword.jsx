import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoVerde from '../assets/logo-verde.svg';
import { IconCheck } from '../components/Icons';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errs = {};
    if (!password.trim()) {
      errs.password = '¡Ingrese una contraseña!';
    } else if (password.trim().length < 6) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!confirmPassword.trim()) {
      errs.confirmPassword = '¡Repita la contraseña!';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = '¡Las contraseñas no coinciden!';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL + '/auth';
      await axios.post(`${baseUrl}/reset-password/${token}`, { password: password.trim() });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'El enlace es inválido o ya expiró.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lo-auth-page">
      <div className="lo-auth-brand">
        <img
          src={logoVerde}
          alt="Linaje Olivia"
          style={{ height: '66px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {!success ? (
        <form className="lo-auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="lo-auth-title" style={{ fontSize: '25px' }}>Nueva Contraseña</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          {errorMsg && <div className="lo-error-text" style={{ justifyContent: 'center' }}>{errorMsg}</div>}

          <div className="lo-field">
            <label className="lo-label">Nueva contraseña</label>
            <div className="lo-password-wrapper">
              <input
                className={`lo-input ${fieldErrors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese una contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
              />
              <button
                type="button"
                className="lo-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && <span className="lo-error-text">{fieldErrors.password}</span>}
          </div>

          <div className="lo-field">
            <label className="lo-label">Confirmar contraseña</label>
            <div className="lo-password-wrapper">
              <input
                className={`lo-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                }}
              />
              <button
                type="button"
                className="lo-eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className="lo-error-text">{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="lo-btn lo-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
          </button>

          <div className="lo-auth-links">
            <button type="button" className="lo-link-btn" onClick={() => navigate('/login')}>
              ← Volver a Iniciar Sesión
            </button>
          </div>
        </form>
      ) : (
        <div className="lo-auth-card" style={{ textAlign: 'center' }}>
          <h1 className="lo-auth-title" style={{ fontSize: '25px' }}>Nueva Contraseña</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          <div className="lo-alert-icon success" style={{ margin: '6px auto 2px' }}>
            <IconCheck />
          </div>

          <h2 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ¡Contraseña Actualizada!
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva clave.
          </p>

          <button
            type="button"
            className="lo-btn lo-btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
            onClick={() => navigate('/login')}
          >
            ← Ir a Iniciar Sesión
          </button>
        </div>
      )}

      <footer className="lo-footer">
        Linaje Olivia, JAFRA COSMETICS S.A. DE C.V. © 2026 - Todos los Derechos Reservados
      </footer>
    </div>
  );
};

export default ResetPassword;