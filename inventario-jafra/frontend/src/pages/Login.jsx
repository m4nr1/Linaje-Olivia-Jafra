import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, saveAuthSession } from '../services/authService';
import logoVerde from '../assets/logo-verde.svg';
import { IconCheck } from '../components/Icons';
import axios from 'axios';

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

const Login = () => {
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: localStorage.getItem('rememberedEmail') || '',
    password: '',
    confirmPassword: '',
    remember: true,
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchView = (nextView) => {
    setErrorMsg('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setView(nextView);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errs = {};
    if (!formData.email.trim()) errs.email = '¡Ingrese un correo electrónico!';
    if (!formData.password.trim()) errs.password = '¡Ingrese una contraseña!';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await loginUser(
        { email: formData.email.trim(), password: formData.password },
        formData.remember
      );
      navigate('/inventory', { replace: true });
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const errs = {};
    if (!formData.name.trim()) errs.name = '¡Ingrese un nombre!';
    if (!formData.email.trim()) errs.email = '¡Ingrese un correo electrónico!';
    if (!formData.password.trim()) errs.password = '¡Ingrese una contraseña!';
    if (!formData.confirmPassword.trim()) {
      errs.confirmPassword = '¡Repita la contraseña!';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = '¡Las contraseñas no coinciden!';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL + '/auth';
      const res = await axios.post(`${baseUrl}/register`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      if (res.data?.token) {
        saveAuthSession(res.data, true);
        navigate('/inventory', { replace: true });
      } else {
        switchView('login');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryEmail = async (nextSuccessView) => {
    setErrorMsg('');
    if (!formData.email.trim()) {
      setFieldErrors({ email: '¡Ingrese un correo electrónico!' });
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL + '/auth';
      await axios.post(`${baseUrl}/forgot-password`, {
        email: formData.email.trim(),
      });
      switchView(nextSuccessView);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'No se pudo enviar el correo de recuperación.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    sendRecoveryEmail('forgotSent');
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

      {view === 'login' && (
        <form className="lo-auth-card" onSubmit={handleLoginSubmit} noValidate>
          <h1 className="lo-auth-title">Iniciar Sesión</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          {errorMsg && (
            <div className="lo-error-text" style={{ justifyContent: 'center' }}>
              {errorMsg}
            </div>
          )}

          <div className="lo-field">
            <label className="lo-label">Correo Electrónico</label>
            <input
              className={`lo-input ${fieldErrors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <span className="lo-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="lo-field">
            <label className="lo-label">Contraseña</label>
            <div className="lo-password-wrapper">
              <input
                className={`lo-input ${fieldErrors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Ingrese una contraseña"
                value={formData.password}
                onChange={handleChange}
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

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              style={{ accentColor: '#1E2A1B', width: '16px', height: '16px' }}
            />
            Recordarme
          </label>

          <button type="submit" className="lo-btn lo-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div className="lo-auth-links">
            <button type="button" className="lo-link-btn" onClick={() => switchView('forgot')}>
              ¿Olvidaste tu contraseña?
            </button>
            <span>
              ¿No tienes cuenta?{' '}
              <button type="button" className="lo-link-btn" onClick={() => switchView('register')}>
                Regístrate
              </button>
            </span>
          </div>
        </form>
      )}

      {view === 'register' && (
        <form className="lo-auth-card" onSubmit={handleRegisterSubmit} noValidate>
          <h1 className="lo-auth-title">Registrarse</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          {errorMsg && (
            <div className="lo-error-text" style={{ justifyContent: 'center' }}>
              {errorMsg}
            </div>
          )}

          <div className="lo-field">
            <label className="lo-label">Nombre completo</label>
            <input
              className={`lo-input ${fieldErrors.name ? 'error' : ''}`}
              type="text"
              name="name"
              placeholder="Ingrese un nombre"
              value={formData.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <span className="lo-error-text">{fieldErrors.name}</span>}
          </div>

          <div className="lo-field">
            <label className="lo-label">Correo electrónico</label>
            <input
              className={`lo-input ${fieldErrors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <span className="lo-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="lo-field">
            <label className="lo-label">Contraseña</label>
            <div className="lo-password-wrapper">
              <input
                className={`lo-input ${fieldErrors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Ingrese una contraseña"
                value={formData.password}
                onChange={handleChange}
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
                name="confirmPassword"
                placeholder="Repita la contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>

          <div className="lo-auth-links">
            <span>
              ¿Ya tienes una cuenta?{' '}
              <button type="button" className="lo-link-btn" onClick={() => switchView('login')}>
                Inicia Sesión
              </button>
            </span>
          </div>
        </form>
      )}

      {view === 'forgot' && (
        <form className="lo-auth-card" onSubmit={handleForgotSubmit} noValidate>
          <h1 className="lo-auth-title" style={{ fontSize: '24px' }}>Recuperar Contraseña</h1>
          <p className="lo-auth-subtitle">
            Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu acceso.
          </p>

          {errorMsg && (
            <div className="lo-error-text" style={{ justifyContent: 'center' }}>
              {errorMsg}
            </div>
          )}

          <div className="lo-field">
            <label className="lo-label">Correo electrónico</label>
            <input
              className={`lo-input ${fieldErrors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <span className="lo-error-text">{fieldErrors.email}</span>}
          </div>

          <button type="submit" className="lo-btn lo-btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>

          <div className="lo-auth-links">
            <button type="button" className="lo-link-btn" onClick={() => switchView('login')}>
              ← Volver a Iniciar Sesión
            </button>
          </div>
        </form>
      )}

      {view === 'forgotSent' && (
        <div className="lo-auth-card" style={{ textAlign: 'center' }}>
          <h1 className="lo-auth-title" style={{ fontSize: '26px' }}>Recuperar Contraseña</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          {errorMsg && (
            <div className="lo-error-text" style={{ justifyContent: 'center' }}>
              {errorMsg}
            </div>
          )}

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0' }}>
            Revisa tu correo electrónico, incluida la carpeta de spam, para recuperar tu cuenta mediante el enlace de recuperación de contraseña
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              ¿No te aparece?
            </span>
            <button
              type="button"
              className="lo-btn lo-btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
              onClick={() => sendRecoveryEmail('forgotResent')}
            >
              {loading ? 'Reenviando...' : 'Reenviar Enlace de Recuperación'}
            </button>
          </div>

          <div className="lo-auth-links">
            <button type="button" className="lo-link-btn" onClick={() => switchView('login')}>
              ← Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      )}

      {view === 'forgotResent' && (
        <div className="lo-auth-card" style={{ textAlign: 'center' }}>
          <h1 className="lo-auth-title" style={{ fontSize: '26px' }}>Recuperar Contraseña</h1>
          <p className="lo-auth-subtitle">Sistema de Gestión de Inventarios</p>

          <div className="lo-alert-icon success" style={{ margin: '6px auto 2px' }}>
            <IconCheck />
          </div>

          <h2 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ¡Reenviado Exitosamente!
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Revisa tu correo electrónico, incluida la carpeta de spam, para recuperar tu cuenta mediante el enlace de recuperación de contraseña
          </p>

          <button
            type="button"
            className="lo-btn lo-btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
            onClick={() => switchView('login')}
          >
            ← Volver a Iniciar Sesión
          </button>
        </div>
      )}

      <footer className="lo-footer">
        Linaje Olivia, JAFRA COSMETICS S.A. DE C.V. © 2026 - Todos los Derechos Reservados
      </footer>
    </div>
  );
};

export default Login;