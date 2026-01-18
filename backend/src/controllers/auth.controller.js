const jwt = require("jsonwebtoken");
const Empresa = require("../models/Empresa");
const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const jwtConfig = require("../config/jwt");

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
		});

		return res.status(201).json({
			success: true,
			mensaje: "Empresa y usuario administrador creados exitosamente",
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
