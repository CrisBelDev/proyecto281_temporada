const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const Empresa = require("../models/Empresa");

// Obtener todos los usuarios de la empresa (multitenant)
exports.obtenerUsuarios = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const usuarios = await Usuario.findAll({
			where: { id_empresa },
			attributes: { exclude: ["password"] },
			include: [{ model: Rol, as: "rol" }],
			order: [["fecha_creacion", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: usuarios,
		});
	} catch (error) {
		console.error("Error al obtener usuarios:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener usuarios",
			error: error.message,
		});
	}
};

// Crear nuevo usuario
exports.crearUsuario = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { nombre, apellido, email, password, telefono, id_rol } = req.body;

		// Validaciones
		if (!nombre || !email || !password || !id_rol) {
			return res.status(400).json({
				success: false,
				mensaje: "Faltan campos obligatorios",
			});
		}

		// Verificar que el rol existe
		const rol = await Rol.findByPk(id_rol);
		if (!rol) {
			return res.status(400).json({
				success: false,
				mensaje: "Rol no válido",
			});
		}

		// Verificar si el email ya existe en la empresa
		const usuarioExistente = await Usuario.findOne({
			where: { email, id_empresa },
		});

		if (usuarioExistente) {
			return res.status(400).json({
				success: false,
				mensaje: "El email ya está registrado en esta empresa",
			});
		}

		// Crear usuario
		const nuevoUsuario = await Usuario.create({
			id_empresa,
			id_rol,
			nombre,
			apellido,
			email,
			password,
			telefono,
			activo: true,
		});

		// Obtener usuario con rol
		const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id_usuario, {
			attributes: { exclude: ["password"] },
			include: [{ model: Rol, as: "rol" }],
		});

		return res.status(201).json({
			success: true,
			mensaje: "Usuario creado exitosamente",
			data: usuarioCreado,
		});
	} catch (error) {
		console.error("Error al crear usuario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear usuario",
			error: error.message,
		});
	}
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const usuario = await Usuario.findOne({
			where: {
				id_usuario: id,
				id_empresa,
			},
			attributes: { exclude: ["password"] },
			include: [{ model: Rol, as: "rol" }],
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		return res.status(200).json({
			success: true,
			data: usuario,
		});
	} catch (error) {
		console.error("Error al obtener usuario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener usuario",
			error: error.message,
		});
	}
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;
		const { nombre, apellido, email, telefono, id_rol } = req.body;

		const usuario = await Usuario.findOne({
			where: {
				id_usuario: id,
				id_empresa,
			},
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		// Actualizar campos
		if (nombre) usuario.nombre = nombre;
		if (apellido) usuario.apellido = apellido;
		if (email) {
			// Verificar si el email ya existe en la empresa (excluyendo el usuario actual)
			const usuarioConEmail = await Usuario.findOne({
				where: { email, id_empresa },
			});
			if (usuarioConEmail && usuarioConEmail.id_usuario !== usuario.id_usuario) {
				return res.status(400).json({
					success: false,
					mensaje: "El email ya está registrado en esta empresa",
				});
			}
			usuario.email = email;
		}
		if (telefono) usuario.telefono = telefono;
		if (id_rol) {
			// Verificar que el rol existe
			const rol = await Rol.findByPk(id_rol);
			if (!rol) {
				return res.status(400).json({
					success: false,
					mensaje: "Rol no válido",
				});
			}
			usuario.id_rol = id_rol;
		}

		await usuario.save();

		const usuarioActualizado = await Usuario.findByPk(usuario.id_usuario, {
			attributes: { exclude: ["password"] },
			include: [{ model: Rol, as: "rol" }],
		});

		return res.status(200).json({
			success: true,
			mensaje: "Usuario actualizado exitosamente",
			data: usuarioActualizado,
		});
	} catch (error) {
		console.error("Error al actualizar usuario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar usuario",
			error: error.message,
		});
	}
};

// Activar/desactivar usuario
exports.toggleUsuario = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const usuario = await Usuario.findOne({
			where: {
				id_usuario: id,
				id_empresa,
			},
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		usuario.activo = !usuario.activo;
		await usuario.save();

		return res.status(200).json({
			success: true,
			mensaje: `Usuario ${usuario.activo ? "activado" : "desactivado"} exitosamente`,
			data: { activo: usuario.activo },
		});
	} catch (error) {
		console.error("Error al cambiar estado del usuario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar estado del usuario",
			error: error.message,
		});
	}
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const usuario = await Usuario.findOne({
			where: {
				id_usuario: id,
				id_empresa,
			},
		});

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		// No permitir eliminar al propio usuario
		if (usuario.id_usuario === req.usuario.id_usuario) {
			return res.status(400).json({
				success: false,
				mensaje: "No puedes eliminar tu propia cuenta",
			});
		}

		// Eliminar usuario
		await usuario.destroy();

		return res.status(200).json({
			success: true,
			mensaje: "Usuario eliminado exitosamente",
		});
	} catch (error) {
		console.error("Error al eliminar usuario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al eliminar usuario",
			error: error.message,
		});
	}
};

// Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
	try {
		const { id_usuario } = req.usuario;
		const { password_actual, password_nuevo } = req.body;

		if (!password_actual || !password_nuevo) {
			return res.status(400).json({
				success: false,
				mensaje: "Contraseña actual y nueva son obligatorias",
			});
		}

		const usuario = await Usuario.findByPk(id_usuario);

		if (!usuario) {
			return res.status(404).json({
				success: false,
				mensaje: "Usuario no encontrado",
			});
		}

		// Verificar contraseña actual
		const passwordValido = await usuario.compararPassword(password_actual);
		if (!passwordValido) {
			return res.status(401).json({
				success: false,
				mensaje: "Contraseña actual incorrecta",
			});
		}

		// Actualizar contraseña
		usuario.password = password_nuevo;
		await usuario.save();

		return res.status(200).json({
			success: true,
			mensaje: "Contraseña actualizada exitosamente",
		});
	} catch (error) {
		console.error("Error al cambiar contraseña:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar contraseña",
			error: error.message,
		});
	}
};
