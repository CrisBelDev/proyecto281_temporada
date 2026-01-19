const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Empresa = require("../models/Empresa");
const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const jwtConfig = require("../config/jwt");
const emailService = require("../services/email.service");

// Registro de nueva empresa (multitenant)
exports.registrarEmpresa = async (req, res) => {
	try {
		const {
			nombre_empresa,
			nit,
			telefono_empresa,
			direccion_empresa,
			email_empresa,
			nombre_admin,
			apellido_admin,
			email_admin,
			password_admin,
			telefono_admin,
		} = req.body;

		// Validaciones básicas
		if (!nombre_empresa || !email_admin || !password_admin || !nombre_admin) {
			return res.status(400).json({
				success: false,
				mensaje: "Faltan campos obligatorios",
			});
		}

		// Verificar si el email de empresa ya existe
		const empresaExistente = await Empresa.findOne({
			where: { email: email_empresa },
		});
		if (empresaExistente) {
			return res.status(400).json({
				success: false,
				mensaje: "El email de la empresa ya está registrado",
			});
		}

		// Crear empresa
		const nuevaEmpresa = await Empresa.create({
			nombre: nombre_empresa,
			nit,
			telefono: telefono_empresa,
			direccion: direccion_empresa,
			email: email_empresa,
			activo: true,
		});

		// Buscar rol de administrador
		let rolAdmin = await Rol.findOne({ where: { nombre: "ADMIN" } });
		if (!rolAdmin) {
			rolAdmin = await Rol.create({
				nombre: "ADMIN",
				descripcion: "Administrador del sistema",
			});
		}

		// Generar token de verificación
		const tokenVerificacion = crypto.randomBytes(32).toString("hex");
		const tokenExpira = new Date();
		tokenExpira.setHours(tokenExpira.getHours() + 24); // Expira en 24 horas

		// Crear usuario administrador
		const nuevoUsuario = await Usuario.create({
			id_empresa: nuevaEmpresa.id_empresa,
			id_rol: rolAdmin.id_rol,
			nombre: nombre_admin,
			apellido: apellido_admin,
			email: email_admin,
			password: password_admin,
			telefono: telefono_admin,
			activo: true,
			email_verificado: false,
			token_verificacion: tokenVerificacion,
			token_verificacion_expira: tokenExpira,
		});

		// Enviar email de verificación
		try {
			await emailService.enviarEmailVerificacion(
				email_admin,
				nombre_admin,
				tokenVerificacion,
			);
		} catch (emailError) {
			console.error("Error al enviar email de verificación:", emailError);
			// No fallar el registro si el email falla
		}

		return res.status(201).json({
			success: true,
			mensaje:
				"Empresa y usuario administrador creados exitosamente. Por favor verifica tu email.",
			data: {
				empresa: {
					id_empresa: nuevaEmpresa.id_empresa,
					nombre: nuevaEmpresa.nombre,
					email: nuevaEmpresa.email,
				},
				usuario: {
					id_usuario: nuevoUsuario.id_usuario,
					nombre: nuevoUsuario.nombre,
					email: nuevoUsuario.email,
					email_verificado: nuevoUsuario.email_verificado,
				},
			},
		});
	} catch (error) {
		console.error("Error al registrar empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al registrar empresa",
			error: error.message,
		});
	}
};

// Login de usuario
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				mensaje: "Email y contraseña son obligatorios",
			});
		}

		// Buscar usuario por email
		const usuario = await Usuario.findOne({
			where: { email, activo: true },
			include: [
				{ model: Empresa, as: "empresa" },
				{ model: Rol, as: "rol" },
			],
		});

		if (!usuario) {
			return res.status(401).json({
				success: false,
				mensaje: "Credenciales inválidas",
			});
		}

		// Verificar que la empresa esté activa
		if (!usuario.empresa.activo) {
			return res.status(401).json({
				success: false,
				mensaje: "Empresa inactiva. Contacte al soporte",
			});
		}

		// Comparar contraseña
		const passwordValido = await usuario.compararPassword(password);
		if (!passwordValido) {
			return res.status(401).json({
				success: false,
				mensaje: "Credenciales inválidas",
			});
		}

		// Verificar que el email esté verificado
		if (!usuario.email_verificado) {
			return res.status(403).json({
				success: false,
				mensaje:
					"Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
			});
		}

		// Generar token JWT
		const token = jwt.sign(
			{
				id_usuario: usuario.id_usuario,
				id_empresa: usuario.id_empresa,
				id_rol: usuario.id_rol,
				nombre_rol: usuario.rol.nombre,
				email: usuario.email,
			},
			jwtConfig.secret,
			{ expiresIn: jwtConfig.expiresIn },
		);

		return res.status(200).json({
			success: true,
			mensaje: "Login exitoso",
			data: {
				token,
				usuario: {
					id_usuario: usuario.id_usuario,
					nombre: usuario.nombre,
					apellido: usuario.apellido,
					email: usuario.email,
					rol: usuario.rol.nombre,
					empresa: {
						id_empresa: usuario.empresa.id_empresa,
						nombre: usuario.empresa.nombre,
					},
				},
			},
		});
	} catch (error) {
		console.error("Error en login:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al iniciar sesión",
			error: error.message,
		});
	}
};

// Verificar token
exports.verificarToken = async (req, res) => {
	try {
		const usuario = await Usuario.findByPk(req.usuario.id_usuario, {
			attributes: { exclude: ["password"] },
			include: [
				{ model: Empresa, as: "empresa" },
				{ model: Rol, as: "rol" },
			],
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				usuario: {
					id_usuario: usuario.id_usuario,
					nombre: usuario.nombre,
					apellido: usuario.apellido,
					email: usuario.email,
					rol: usuario.rol.nombre,
					empresa: {
						id_empresa: usuario.empresa.id_empresa,
						nombre: usuario.empresa.nombre,
					},
				},
			},
		});
	} catch (error) {
		console.error("Error al verificar token:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al verificar token",
			error: error.message,
		});
	}
};

// Verificar email con token
exports.verificarEmail = async (req, res) => {
	try {
		const { token } = req.params;

		if (!token) {
			return res.status(400).json({
				success: false,
				mensaje: "Token de verificación requerido",
			});
		}

		// Buscar usuario por token de verificación
		const usuario = await Usuario.findOne({
			where: { token_verificacion: token },
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Token de verificación inválido",
			});
		}

		// Verificar que el email no esté ya verificado
		if (usuario.email_verificado) {
			return res.status(400).json({
				success: false,
				mensaje: "Este email ya ha sido verificado",
			});
		}

		// Verificar que el token no haya expirado
		if (new Date() > usuario.token_verificacion_expira) {
			return res.status(400).json({
				success: false,
				mensaje: "El token de verificación ha expirado. Solicita uno nuevo.",
			});
		}

		// Actualizar usuario
		usuario.email_verificado = true;
		usuario.token_verificacion = null;
		usuario.token_verificacion_expira = null;
		await usuario.save();

		// Enviar email de bienvenida
		try {
			await emailService.enviarEmailBienvenida(usuario.email, usuario.nombre);
		} catch (emailError) {
			console.error("Error al enviar email de bienvenida:", emailError);
		}

		return res.status(200).json({
			success: true,
			mensaje: "Email verificado exitosamente. Ya puedes iniciar sesión.",
		});
	} catch (error) {
		console.error("Error al verificar email:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al verificar email",
			error: error.message,
		});
	}
};

// Reenviar email de verificación
exports.reenviarVerificacion = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				mensaje: "Email requerido",
			});
		}

		// Buscar usuario por email
		const usuario = await Usuario.findOne({
			where: { email },
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		// Verificar que el email no esté ya verificado
		if (usuario.email_verificado) {
			return res.status(400).json({
				success: false,
				mensaje: "Este email ya ha sido verificado",
			});
		}

		// Generar nuevo token de verificación
		const tokenVerificacion = crypto.randomBytes(32).toString("hex");
		const tokenExpira = new Date();
		tokenExpira.setHours(tokenExpira.getHours() + 24); // Expira en 24 horas

		// Actualizar usuario
		usuario.token_verificacion = tokenVerificacion;
		usuario.token_verificacion_expira = tokenExpira;
		await usuario.save();

		// Enviar email de verificación
		await emailService.enviarEmailVerificacion(
			usuario.email,
			usuario.nombre,
			tokenVerificacion,
		);

		return res.status(200).json({
			success: true,
			mensaje:
				"Email de verificación reenviado. Por favor revisa tu bandeja de entrada.",
		});
	} catch (error) {
		console.error("Error al reenviar verificación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al reenviar email de verificación",
			error: error.message,
		});
	}
};

// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				mensaje: "Email requerido",
			});
		}

		// Buscar usuario por email
		const usuario = await Usuario.findOne({
			where: { email, activo: true },
		});

		// Por seguridad, siempre responder exitosamente aunque el usuario no exista
		// Esto previene que atacantes descubran qué emails están registrados
		if (!usuario) {
			return res.status(200).json({
				success: true,
				mensaje:
					"Si el email existe en nuestro sistema, recibirás un enlace de recuperación.",
			});
		}

		// Generar token de recuperación
		const tokenRecuperacion = crypto.randomBytes(32).toString("hex");
		const tokenExpira = new Date();
		tokenExpira.setHours(tokenExpira.getHours() + 1); // Expira en 1 hora

		// Actualizar usuario
		usuario.token_recuperacion = tokenRecuperacion;
		usuario.token_recuperacion_expira = tokenExpira;
		await usuario.save();

		// Enviar email de recuperación
		await emailService.enviarEmailRecuperacion(
			usuario.email,
			usuario.nombre,
			tokenRecuperacion,
		);

		return res.status(200).json({
			success: true,
			mensaje:
				"Si el email existe en nuestro sistema, recibirás un enlace de recuperación.",
		});
	} catch (error) {
		console.error("Error al solicitar recuperación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al procesar la solicitud",
			error: error.message,
		});
	}
};

// Verificar token de recuperación
exports.verificarTokenRecuperacion = async (req, res) => {
	try {
		const { token } = req.params;

		if (!token) {
			return res.status(400).json({
				success: false,
				mensaje: "Token requerido",
			});
		}

		// Buscar usuario por token de recuperación
		const usuario = await Usuario.findOne({
			where: { token_recuperacion: token },
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Token de recuperación inválido",
			});
		}

		// Verificar que el token no haya expirado
		if (new Date() > usuario.token_recuperacion_expira) {
			return res.status(400).json({
				success: false,
				mensaje: "El token de recuperación ha expirado. Solicita uno nuevo.",
			});
		}

		return res.status(200).json({
			success: true,
			mensaje: "Token válido",
		});
	} catch (error) {
		console.error("Error al verificar token:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al verificar token",
			error: error.message,
		});
	}
};

// Resetear contraseña
exports.resetearPassword = async (req, res) => {
	try {
		const { token, nuevaPassword } = req.body;

		if (!token || !nuevaPassword) {
			return res.status(400).json({
				success: false,
				mensaje: "Token y nueva contraseña son requeridos",
			});
		}

		// Validar longitud de contraseña
		if (nuevaPassword.length < 6) {
			return res.status(400).json({
				success: false,
				mensaje: "La contraseña debe tener al menos 6 caracteres",
			});
		}

		// Buscar usuario por token de recuperación
		const usuario = await Usuario.findOne({
			where: { token_recuperacion: token },
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Token de recuperación inválido",
			});
		}

		// Verificar que el token no haya expirado
		if (new Date() > usuario.token_recuperacion_expira) {
			return res.status(400).json({
				success: false,
				mensaje: "El token de recuperación ha expirado. Solicita uno nuevo.",
			});
		}

		// Actualizar contraseña (el hook beforeUpdate se encargará del hash)
		// Usar setDataValue para forzar que Sequelize detecte el cambio
		usuario.setDataValue("password", nuevaPassword);
		usuario.changed("password", true);
		usuario.token_recuperacion = null;
		usuario.token_recuperacion_expira = null;
		await usuario.save();

		// Enviar email de confirmación
		try {
			await emailService.enviarEmailConfirmacionCambioPassword(
				usuario.email,
				usuario.nombre,
			);
		} catch (emailError) {
			console.error("Error al enviar email de confirmación:", emailError);
		}

		return res.status(200).json({
			success: true,
			mensaje: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión.",
		});
	} catch (error) {
		console.error("Error al resetear contraseña:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al resetear contraseña",
			error: error.message,
		});
	}
};
