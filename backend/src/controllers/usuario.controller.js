const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const Empresa = require("../models/Empresa");

// Obtener todos los usuarios de la empresa (multitenant)
// SUPERUSER puede ver usuarios de todas las empresas
exports.obtenerUsuarios = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { empresa_id } = req.query; // Parámetro opcional para SUPERUSER

		let whereClause = {};

		// Si es SUPERUSER y especifica una empresa, filtrar por esa empresa
		// Si es SUPERUSER sin especificar empresa, traer todos
		// Si no es SUPERUSER, solo ver su empresa
		if (nombre_rol === "SUPERUSER") {
			if (empresa_id) {
				whereClause = { id_empresa: empresa_id };
			}
			// Si no especifica empresa, whereClause queda vacío (trae todos)
		} else {
			whereClause = { id_empresa };
		}

		const usuarios = await Usuario.findAll({
			where: whereClause,
			attributes: { exclude: ["password"] },
			include: [
				{ model: Rol, as: "rol" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
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
// SUPERUSER puede crear usuarios para cualquier empresa
exports.crearUsuario = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { nombre, apellido, email, password, telefono, id_rol, empresa_id } =
			req.body;

		// Validaciones
		if (!nombre || !email || !password || !id_rol) {
			return res.status(400).json({
				success: false,
				mensaje: "Faltan campos obligatorios",
			});
		}

		// Determinar a qué empresa pertenece el nuevo usuario
		let empresaDestino = id_empresa;
		if (nombre_rol === "SUPERUSER" && empresa_id) {
			empresaDestino = empresa_id;

			// Verificar que la empresa existe
			const empresa = await Empresa.findByPk(empresaDestino);
			if (!empresa) {
				return res.status(400).json({
					success: false,
					mensaje: "Empresa no válida",
				});
			}
		}

		// Verificar que el rol existe
		const rol = await Rol.findByPk(id_rol);
		if (!rol) {
			return res.status(400).json({
				success: false,
				mensaje: "Rol no válido",
			});
		}

		// Solo SUPERUSER puede crear otros SUPERUSER
		if (rol.nombre === "SUPERUSER" && nombre_rol !== "SUPERUSER") {
			return res.status(403).json({
				success: false,
				mensaje: "No tienes permisos para crear usuarios SUPERUSER",
			});
		}

		// Verificar si el email ya existe en la empresa
		const usuarioExistente = await Usuario.findOne({
			where: { email, id_empresa: empresaDestino },
		});

		if (usuarioExistente) {
			return res.status(400).json({
				success: false,
				mensaje: "El email ya está registrado en esta empresa",
			});
		}

		// Crear usuario
		const nuevoUsuario = await Usuario.create({
			id_empresa: empresaDestino,
			id_rol,
			nombre,
			apellido,
			email,
			password,
			telefono,
			activo: true,
		});

		// Obtener usuario con rol y empresa
		const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id_usuario, {
			attributes: { exclude: ["password"] },
			include: [
				{ model: Rol, as: "rol" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
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
// SUPERUSER puede ver usuarios de cualquier empresa
exports.obtenerUsuarioPorId = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { id } = req.params;

		let whereClause = { id_usuario: id };

		// Si no es SUPERUSER, verificar que el usuario pertenece a su empresa
		if (nombre_rol !== "SUPERUSER") {
			whereClause.id_empresa = id_empresa;
		}

		const usuario = await Usuario.findOne({
			where: whereClause,
			attributes: { exclude: ["password"] },
			include: [
				{ model: Rol, as: "rol" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
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
// SUPERUSER puede actualizar usuarios de cualquier empresa
exports.actualizarUsuario = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { id } = req.params;
		const { nombre, apellido, email, telefono, id_rol } = req.body;

		let whereClause = { id_usuario: id };

		// Si no es SUPERUSER, verificar que el usuario pertenece a su empresa
		if (nombre_rol !== "SUPERUSER") {
			whereClause.id_empresa = id_empresa;
		}

		const usuario = await Usuario.findOne({
			where: whereClause,
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
				where: { email, id_empresa: usuario.id_empresa },
			});
			if (
				usuarioConEmail &&
				usuarioConEmail.id_usuario !== usuario.id_usuario
			) {
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

			// Solo SUPERUSER puede asignar el rol SUPERUSER
			if (rol.nombre === "SUPERUSER" && nombre_rol !== "SUPERUSER") {
				return res.status(403).json({
					success: false,
					mensaje: "No tienes permisos para asignar el rol SUPERUSER",
				});
			}

			usuario.id_rol = id_rol;
		}

		await usuario.save();

		const usuarioActualizado = await Usuario.findByPk(usuario.id_usuario, {
			attributes: { exclude: ["password"] },
			include: [
				{ model: Rol, as: "rol" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
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
// SUPERUSER puede activar/desactivar usuarios de cualquier empresa
exports.toggleUsuario = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { id } = req.params;

		let whereClause = { id_usuario: id };

		// Si no es SUPERUSER, verificar que el usuario pertenece a su empresa
		if (nombre_rol !== "SUPERUSER") {
			whereClause.id_empresa = id_empresa;
		}

		const usuario = await Usuario.findOne({
			where: whereClause,
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
// SUPERUSER puede eliminar usuarios de cualquier empresa
exports.eliminarUsuario = async (req, res) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const { id } = req.params;

		let whereClause = { id_usuario: id };

		// Si no es SUPERUSER, verificar que el usuario pertenece a su empresa
		if (nombre_rol !== "SUPERUSER") {
			whereClause.id_empresa = id_empresa;
		}

		const usuario = await Usuario.findOne({
			where: whereClause,
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
