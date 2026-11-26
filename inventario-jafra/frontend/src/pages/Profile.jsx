import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { updateProfile } from '../services/authService';
import { IconWarning, IconCheck, IconCamera } from '../components/Icons';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem('userInfo')) || {};

  const [avatarPhoto, setAvatarPhoto] = useState(storedUser.avatar || '');
  const [profile, setProfile] = useState({
  name: storedUser.name || '',
  email: storedUser.email || '',
  phone: storedUser.phone || '1234567890',
  company: storedUser.company || 'Empresa',
  position: storedUser.position || 'Puesto',
  role: storedUser.role || 'Rol',
  newPassword: '',
  confirmPassword: '',
});

  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 220;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarPhoto(compressed);
        setDirty(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setDirty(true);
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateAndAskSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = '¡Rellene este campo!';
    if (!profile.email.trim()) newErrors.email = '¡Escriba un correo electrónico!';
    if (!profile.phone.trim()) newErrors.phone = '¡Escriba un número de teléfono!';
    if (!profile.company.trim()) newErrors.company = '¡Ingrese una empresa!';
    if (!profile.position.trim()) newErrors.position = '¡Ingrese un puesto!';
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      newErrors.confirmPassword = '¡Las contraseñas no coinciden!';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setModalState('confirmSave');
  };

  const executeSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        company: profile.company.trim(),
        position: profile.position.trim(),
        avatar: avatarPhoto,
        ...(profile.newPassword ? { password: profile.newPassword } : {}),
      });
      setDirty(false);
      setProfile({ ...profile, newPassword: '', confirmPassword: '' });
      setModalState('savedSuccess');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'No se pudo actualizar el perfil.');
      setModalState('saveError');
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.name || 'JM')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

    const displayRole =
  !profile.role || profile.role.toLowerCase() === 'admin'
    ? 'Administrador'
    : profile.role;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar sectionTitle="Mi Perfil" />

      <main className="lo-container" style={{ width: '100%' }}>
        <button className="lo-back-btn" onClick={() => (dirty ? setModalState('confirmExit') : navigate('/inventory'))}>
          ← Volver a Inicio
        </button>

        <div className="lo-profile-grid">
          <div className="lo-card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '104px', height: '104px', margin: '0 auto 14px' }}>
              {avatarPhoto ? (
                <img
                  src={avatarPhoto}
                  alt="Foto de perfil"
                  style={{ width: '104px', height: '104px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--olive-mid)' }}
                />
              ) : (
                <div
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--olive-dark)',
                    color: '#fff',
                    fontSize: '32px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initials}
                </div>
              )}

              <button
                type="button"
                className="lo-avatar-cam-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Subir foto de perfil"
              >
                <IconCamera />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{profile.name}</h2>
            <span
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success)',
                fontSize: '12px',
                fontWeight: 700,
                }}
            >
                {displayRole}
            </span>

            <div style={{ textAlign: 'left', marginTop: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Empresa:</span>
                <strong>{profile.company}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Miembro desde:</span>
                <strong>01 - Septiembre - 2026</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Estado:</span>
                <strong style={{ color: 'var(--status-success)' }}>● Activo</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Puesto:</span>
                <strong>{profile.position}</strong>
              </div>
            </div>
          </div>

          <form className="lo-card" onSubmit={validateAndAskSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Información General</h3>

            <div className="lo-field">
              <label className="lo-label">Nombre completo</label>
              <input
                className={`lo-input ${errors.name ? 'error' : ''}`}
                name="name"
                placeholder="Ingrese un nombre"
                value={profile.name}
                onChange={handleChange}
              />
              {errors.name && <span className="lo-error-text">{errors.name}</span>}
            </div>

            <div className="lo-form-grid-2">
              <div className="lo-field">
                <label className="lo-label">Correo electrónico</label>
                <input
                  className={`lo-input ${errors.email ? 'error' : ''}`}
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={profile.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="lo-error-text">{errors.email}</span>}
              </div>
              <div className="lo-field">
                <label className="lo-label">Número de teléfono</label>
                <input
                  className={`lo-input ${errors.phone ? 'error' : ''}`}
                  name="phone"
                  placeholder="1234567890"
                  value={profile.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="lo-error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="lo-form-grid-2">
              <div className="lo-field">
                <label className="lo-label">Empresa</label>
                <input
                  className={`lo-input ${errors.company ? 'error' : ''}`}
                  name="company"
                  placeholder="Ingrese una empresa"
                  value={profile.company}
                  onChange={handleChange}
                />
                {errors.company && <span className="lo-error-text">{errors.company}</span>}
              </div>
              <div className="lo-field">
                <label className="lo-label">Puesto</label>
                <input
                  className={`lo-input ${errors.position ? 'error' : ''}`}
                  name="position"
                  placeholder="Ingrese un puesto"
                  value={profile.position}
                  onChange={handleChange}
                />
                {errors.position && <span className="lo-error-text">{errors.position}</span>}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '6px 0' }} />

            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Actualizar Contraseña</h3>

            <div className="lo-form-grid-2">
              <div className="lo-field">
                <label className="lo-label">Nueva contraseña</label>
                <input
                  className="lo-input"
                  type="password"
                  name="newPassword"
                  placeholder="Ingrese una nueva contraseña"
                  value={profile.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="lo-field">
                <label className="lo-label">Confirmar contraseña</label>
                <input
                  className={`lo-input ${errors.confirmPassword ? 'error' : ''}`}
                  type="password"
                  name="confirmPassword"
                  placeholder="Repita la contraseña"
                  value={profile.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <span className="lo-error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="lo-btn lo-btn-primary">Guardar</button>
            </div>
          </form>
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
              <button className="lo-btn lo-btn-primary" onClick={executeSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
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
      {modalState === 'saveError' && (
        <div className="lo-modal-overlay">
          <div className="lo-alert-card">
            <div className="lo-alert-icon danger"><IconWarning /></div>
            <h3 style={{ fontSize: '19px', fontWeight: 700 }}>Error al Guardar</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{errorMsg}</p>
            <button className="lo-btn lo-btn-primary" style={{ width: '100%' }} onClick={() => setModalState(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;