import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoVerde from '../assets/logo-verde.svg';
import { IconCheck } from '../components/Icons';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
            <input
              className={`lo-input ${fieldErrors.password ? 'error' : ''}`}
              type="password"
              placeholder="Ingrese una contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
              }}
            />
            {fieldErrors.password && <span className="lo-error-text">{fieldErrors.password}</span>}
          </div>

          <div className="lo-field">
            <label className="lo-label">Confirmar contraseña</label>
            <input
              className={`lo-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
              type="password"
              placeholder="Repita la contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
              }}
            />
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