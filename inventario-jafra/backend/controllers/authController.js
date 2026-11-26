exports.forgotPassword = async (req, res) => {
  let user;
  try {
    const { email } = req.body;
    user = await User.findOne({ email: email?.trim().toLowerCase() });

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
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
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
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false }).catch(() => {});
    }
    res.status(500).json({ message: 'Error al enviar el correo de recuperación', error: error.message });
  }
};