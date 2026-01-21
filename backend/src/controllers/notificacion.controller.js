const Notificacion = require("../models/Notificacion");
const Usuario = require("../models/Usuario");

// Obtener todas las notificaciones (multitenant)
exports.obtenerNotificaciones = async (req, res) => {
	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { limite = 50, solo_no_leidas = false } = req.query;

		const where = { id_empresa };

		// Si no es admin, solo ver sus propias notificaciones
		if (req.usuario.id_rol !== 1) {
			where.id_usuario = id_usuario;
		}

		// Filtrar solo no leídas si se solicita
		if (solo_no_leidas === "true") {
			where.leida = false;
		}

		const notificaciones = await Notificacion.findAll({
			where,
			include: [
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "email"],
				},
			],
			order: [["fecha_creacion", "DESC"]],
			limit: parseInt(limite),
		});

		// Contar no leídas
		const noLeidas = await Notificacion.count({
			where: { ...where, leida: false },
		});

		return res.status(200).json({
			success: true,
			data: notificaciones,
			no_leidas: noLeidas,
		});
	} catch (error) {
		console.error("Error al obtener notificaciones:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener notificaciones",
			error: error.message,
		});
	}
};

// Marcar notificación como leída
exports.marcarComoLeida = async (req, res) => {
	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { id } = req.params;

		const where = {
			id_notificacion: id,
			id_empresa,
		};

		// Si no es admin, solo puede marcar sus propias notificaciones
		if (req.usuario.id_rol !== 1) {
			where.id_usuario = id_usuario;
		}

		const notificacion = await Notificacion.findOne({ where });

		if (!notificacion) {
			return res.status(404).json({
				success: false,
				mensaje: "Notificación no encontrada",
			});
		}

		notificacion.leida = true;
		await notificacion.save();

		return res.status(200).json({
			success: true,
			mensaje: "Notificación marcada como leída",
			data: notificacion,
		});
	} catch (error) {
		console.error("Error al marcar notificación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al marcar notificación",
			error: error.message,
		});
	}
};

// Marcar todas como leídas
exports.marcarTodasComoLeidas = async (req, res) => {
	try {
		const { id_empresa, id_usuario } = req.usuario;

		const where = { id_empresa, leida: false };

		// Si no es admin, solo marcar sus propias notificaciones
		if (req.usuario.id_rol !== 1) {
			where.id_usuario = id_usuario;
		}

		const [cantidad] = await Notificacion.update({ leida: true }, { where });

		return res.status(200).json({
			success: true,
			mensaje: `${cantidad} notificación(es) marcada(s) como leída(s)`,
			cantidad,
		});
	} catch (error) {
		console.error("Error al marcar notificaciones:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al marcar notificaciones",
			error: error.message,
		});
	}
};

// Eliminar notificación
exports.eliminarNotificacion = async (req, res) => {
	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { id } = req.params;

		const where = {
			id_notificacion: id,
			id_empresa,
		};

		// Si no es admin, solo puede eliminar sus propias notificaciones
		if (req.usuario.id_rol !== 1) {
			where.id_usuario = id_usuario;
		}

		const notificacion = await Notificacion.findOne({ where });

		if (!notificacion) {
			return res.status(404).json({
				success: false,
				mensaje: "Notificación no encontrada",
			});
		}

		await notificacion.destroy();

		return res.status(200).json({
			success: true,
			mensaje: "Notificación eliminada exitosamente",
		});
	} catch (error) {
		console.error("Error al eliminar notificación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al eliminar notificación",
			error: error.message,
		});
	}
};

// Eliminar notificaciones leídas antiguas
exports.limpiarNotificaciones = async (req, res) => {
	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { dias = 30 } = req.query;

		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));

		const where = {
			id_empresa,
			leida: true,
			fecha_creacion: {
				[require("sequelize").Op.lt]: fechaLimite,
			},
		};

		// Si no es admin, solo eliminar sus propias notificaciones
		if (req.usuario.id_rol !== 1) {
			where.id_usuario = id_usuario;
		}

		const cantidad = await Notificacion.destroy({ where });

		return res.status(200).json({
			success: true,
			mensaje: `${cantidad} notificación(es) eliminada(s)`,
			cantidad,
		});
	} catch (error) {
		console.error("Error al limpiar notificaciones:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al limpiar notificaciones",
			error: error.message,
		});
	}
};

// Crear notificación (para sistema)
exports.crearNotificacion = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { tipo, titulo, mensaje, id_usuario } = req.body;

		// Validaciones
		if (!tipo || !titulo || !mensaje) {
			return res.status(400).json({
				success: false,
				mensaje: "Faltan campos obligatorios",
			});
		}

		const nuevaNotificacion = await Notificacion.create({
			id_empresa,
			id_usuario: id_usuario || null,
			tipo,
			titulo,
			mensaje,
			leida: false,
		});

		return res.status(201).json({
			success: true,
			mensaje: "Notificación creada exitosamente",
			data: nuevaNotificacion,
		});
	} catch (error) {
		console.error("Error al crear notificación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear notificación",
			error: error.message,
		});
	}
};
