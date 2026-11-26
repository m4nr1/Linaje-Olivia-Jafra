const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '1234567890',
  company: user.company || 'Empresa',
  position: user.position || 'Puesto',
  role: user.role || 'Administrador',
  avatar: user.avatar || '',
  token: generateToken(user._id),
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(formatUserResponse(user));
    } else {
      res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.phone = req.body.phone ?? user.phone;
    user.company = req.body.company ?? user.company;
    user.position = req.body.position ?? user.position;
    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }
    if (req.body.password && req.body.password.trim().length >= 6) {
      user.password = req.body.password.trim();
    }

    const updatedUser = await user.save();
    res.json(formatUserResponse(updatedUser));
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta registrada con ese correo electrónico' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Expira en 15 minutos
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; background-color: #FAF9F6; padding: 32px 16px; color: #111A10;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EBE8E2; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #1E2A1B; padding: 24px; text-align: center; color: #FAF9F6;">
            <h2 style="margin: 0; letter-spacing: 2px; font-size: 20px;">LINAJE OLIVIA</h2>
            <p style="margin: 6px 0 0; font-size: 12px; color: #E6C687;">Sistema de Gestión de Inventarios</p>
          </div>
          <div style="padding: 28px 24px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 20px; color: #111A10;">Recuperación de Contraseña</h3>
            <p style="font-size: 14px; color: #5D5954; line-height: 1.6;">
              Hola <strong>${user.name}</strong>, recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:
            </p>
            <a href="${resetUrl}" style="display: inline-block; margin: 18px 0; padding: 13px 26px; background-color: #1E2A1B; color: #FAF9F6; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Restablecer Contraseña
            </a>
            <p style="font-size: 12px; color: #858079; line-height: 1.5; margin-top: 16px;">
              Este enlace es válido durante <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo con seguridad.
            </p>
          </div>
          <div style="background-color: #EFE5D0; padding: 14px; text-align: center; font-size: 11px; color: #3A2E2B;">
            Linaje Olivia, JAFRA COSMETICS S.A. DE C.V. © 2026
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Linaje Olivia - Inventarios" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperación de Contraseña - Linaje Olivia',
      html: htmlMessage,
    });

    res.json({ message: 'Correo de recuperación enviado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el correo de recuperación', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'El enlace de recuperación es inválido o ya expiró' });
    }

    const { password } = req.body;
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
  }
};