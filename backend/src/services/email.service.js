const transport = require("../config/email");

/**
 * Envía un email de verificación al usuario
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 * @param {string} token - Token de verificación
 */
exports.enviarEmailVerificacion = async (email, nombre, token) => {
	try {
		// URL de verificación (ajustar según tu frontend)
		const urlVerificacion = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verificar-email/${token}`;

		const mailOptions = {
			from: '"Sistema de Inventarios" <noreply@inventario.com>',
			to: email,
			subject: "Verifica tu cuenta",
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
						}
						.container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							background-color: #f9f9f9;
						}
						.header {
							background-color: #4CAF50;
							color: white;
							padding: 20px;
							text-align: center;
							border-radius: 5px 5px 0 0;
						}
						.content {
							background-color: white;
							padding: 30px;
							border-radius: 0 0 5px 5px;
						}
						.button {
							display: inline-block;
							padding: 12px 30px;
							margin: 20px 0;
							background-color: #4CAF50;
							color: white;
							text-decoration: none;
							border-radius: 5px;
							font-weight: bold;
						}
						.footer {
							text-align: center;
							margin-top: 20px;
							font-size: 12px;
							color: #777;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>¡Bienvenido al Sistema de Inventarios!</h1>
						</div>
						<div class="content">
							<h2>Hola ${nombre},</h2>
							<p>Gracias por registrarte en nuestro sistema. Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de correo electrónico.</p>
							<p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
							<center>
								<a href="${urlVerificacion}" class="button">Verificar mi cuenta</a>
							</center>
							<p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
							<p style="word-break: break-all; color: #666;">${urlVerificacion}</p>
							<p><strong>Este enlace expirará en 24 horas.</strong></p>
							<p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
							<p>Saludos,<br>El equipo de Sistema de Inventarios</p>
						</div>
						<div class="footer">
							<p>Este es un correo automático, por favor no respondas a este mensaje.</p>
						</div>
					</div>
				</body>
				</html>
			`,
		};

		const info = await transport.sendMail(mailOptions);
		console.log("Email de verificación enviado:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error al enviar email de verificación:", error);
		throw error;
	}
};

/**
 * Envía un email de bienvenida al usuario
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 */
exports.enviarEmailBienvenida = async (email, nombre) => {
	try {
		const mailOptions = {
			from: '"Sistema de Inventarios" <noreply@inventario.com>',
			to: email,
			subject: "¡Cuenta verificada exitosamente!",
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
						}
						.container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							background-color: #f9f9f9;
						}
						.header {
							background-color: #4CAF50;
							color: white;
							padding: 20px;
							text-align: center;
							border-radius: 5px 5px 0 0;
						}
						.content {
							background-color: white;
							padding: 30px;
							border-radius: 0 0 5px 5px;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>✅ ¡Cuenta verificada!</h1>
						</div>
						<div class="content">
							<h2>Hola ${nombre},</h2>
							<p>Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de nuestro sistema.</p>
							<p>¡Gracias por unirte a nosotros!</p>
							<p>Saludos,<br>El equipo de Sistema de Inventarios</p>
						</div>
					</div>
				</body>
				</html>
			`,
		};

		const info = await transport.sendMail(mailOptions);
		console.log("Email de bienvenida enviado:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error al enviar email de bienvenida:", error);
		throw error;
	}
};

/**
 * Envía un email de recuperación de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 * @param {string} token - Token de recuperación
 */
exports.enviarEmailRecuperacion = async (email, nombre, token) => {
	try {
		// URL de recuperación (ajustar según tu frontend)
		const urlRecuperacion = `${process.env.FRONTEND_URL || "http://localhost:5173"}/resetear-password/${token}`;

		const mailOptions = {
			from: '"Sistema de Inventarios" <noreply@inventario.com>',
			to: email,
			subject: "Recuperación de contraseña",
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
						}
						.container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							background-color: #f9f9f9;
						}
						.header {
							background-color: #FF9800;
							color: white;
							padding: 20px;
							text-align: center;
							border-radius: 5px 5px 0 0;
						}
						.content {
							background-color: white;
							padding: 30px;
							border-radius: 0 0 5px 5px;
						}
						.button {
							display: inline-block;
							padding: 12px 30px;
							margin: 20px 0;
							background-color: #FF9800;
							color: white;
							text-decoration: none;
							border-radius: 5px;
							font-weight: bold;
						}
						.footer {
							text-align: center;
							margin-top: 20px;
							font-size: 12px;
							color: #777;
						}
						.warning {
							background-color: #fff3cd;
							border: 1px solid #ffc107;
							padding: 15px;
							border-radius: 5px;
							margin: 20px 0;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>🔑 Recuperación de Contraseña</h1>
						</div>
						<div class="content">
							<h2>Hola ${nombre},</h2>
							<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
							<p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
							<center>
								<a href="${urlRecuperacion}" class="button">Restablecer Contraseña</a>
							</center>
							<p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
							<p style="word-break: break-all; color: #666;">${urlRecuperacion}</p>
							<div class="warning">
								<p style="margin: 0;"><strong>⚠️ Importante:</strong></p>
								<ul style="margin: 10px 0 0 0;">
									<li>Este enlace expirará en 1 hora por seguridad</li>
									<li>Solo puedes usar este enlace una vez</li>
									<li>Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios</li>
								</ul>
							</div>
							<p>Saludos,<br>El equipo de Sistema de Inventarios</p>
						</div>
						<div class="footer">
							<p>Este es un correo automático, por favor no respondas a este mensaje.</p>
						</div>
					</div>
				</body>
				</html>
			`,
		};

		const info = await transport.sendMail(mailOptions);
		console.log("Email de recuperación enviado:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error al enviar email de recuperación:", error);
		throw error;
	}
};

/**
 * Envía confirmación de cambio de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 */
exports.enviarEmailConfirmacionCambioPassword = async (email, nombre) => {
	try {
		const mailOptions = {
			from: '"Sistema de Inventarios" <noreply@inventario.com>',
			to: email,
			subject: "Contraseña actualizada exitosamente",
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
						}
						.container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							background-color: #f9f9f9;
						}
						.header {
							background-color: #4CAF50;
							color: white;
							padding: 20px;
							text-align: center;
							border-radius: 5px 5px 0 0;
						}
						.content {
							background-color: white;
							padding: 30px;
							border-radius: 0 0 5px 5px;
						}
						.info-box {
							background-color: #e3f2fd;
							border-left: 4px solid #2196F3;
							padding: 15px;
							margin: 20px 0;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>✓ Contraseña Actualizada</h1>
						</div>
						<div class="content">
							<h2>Hola ${nombre},</h2>
							<p>Te confirmamos que tu contraseña ha sido cambiada exitosamente.</p>
							<div class="info-box">
								<p style="margin: 0;"><strong>📅 Fecha y hora:</strong> ${new Date().toLocaleString("es-ES", { timeZone: "America/La_Paz" })}</p>
							</div>
							<p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
							<p><strong>Si no realizaste este cambio,</strong> contacta inmediatamente con el soporte técnico, ya que tu cuenta podría estar comprometida.</p>
							<p>Saludos,<br>El equipo de Sistema de Inventarios</p>
						</div>
					</div>
				</body>
				</html>
			`,
		};

		const info = await transport.sendMail(mailOptions);
		console.log(
			"Email de confirmación de cambio de contraseña enviado:",
			info.messageId,
		);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error al enviar email de confirmación:", error);
		throw error;
	}
};
