const Empresa = require("../models/Empresa");
const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Venta = require("../models/Venta");

// Obtener todas las empresas (solo SUPERUSER)
exports.obtenerEmpresas = async (req, res) => {
	try {
		const empresas = await Empresa.findAll({
			include: [
				{
					model: Usuario,
					as: "usuarios",
					attributes: ["id_usuario", "nombre", "apellido", "email"],
					include: [
						{
							model: Rol,
							as: "rol",
							attributes: ["nombre"],
						},
					],
				},
			],
			order: [["fecha_creacion", "DESC"]],
		});

		// Agregar estadísticas a cada empresa
		const empresasConStats = await Promise.all(
			empresas.map(async (empresa) => {
				const totalUsuarios = await Usuario.count({
					where: { id_empresa: empresa.id_empresa },
				});
				const totalProductos = await Producto.count({
					where: { id_empresa: empresa.id_empresa },
				});
				const totalClientes = await Cliente.count({
					where: { id_empresa: empresa.id_empresa },
				});
				const totalVentas = await Venta.count({
					where: { id_empresa: empresa.id_empresa },
				});

				return {
					...empresa.toJSON(),
					estadisticas: {
						totalUsuarios,
						totalProductos,
						totalClientes,
						totalVentas,
					},
				};
			}),
		);

		return res.status(200).json({
			success: true,
			data: empresasConStats,
		});
	} catch (error) {
		console.error("Error al obtener empresas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener empresas",
			error: error.message,
		});
	}
};

// Obtener una empresa por ID (solo SUPERUSER)
exports.obtenerEmpresaPorId = async (req, res) => {
	try {
		const { id } = req.params;

		const empresa = await Empresa.findByPk(id, {
			include: [
				{
					model: Usuario,
					as: "usuarios",
					attributes: { exclude: ["password"] },
					include: [
						{
							model: Rol,
							as: "rol",
						},
					],
				},
			],
		});

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Agregar estadísticas
		const totalUsuarios = await Usuario.count({
			where: { id_empresa: empresa.id_empresa },
		});
		const totalProductos = await Producto.count({
			where: { id_empresa: empresa.id_empresa },
		});
		const totalClientes = await Cliente.count({
			where: { id_empresa: empresa.id_empresa },
		});
		const totalVentas = await Venta.count({
			where: { id_empresa: empresa.id_empresa },
		});

		return res.status(200).json({
			success: true,
			data: {
				...empresa.toJSON(),
				estadisticas: {
					totalUsuarios,
					totalProductos,
					totalClientes,
					totalVentas,
				},
			},
		});
	} catch (error) {
		console.error("Error al obtener empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener empresa",
			error: error.message,
		});
	}
};

// Crear nueva empresa (solo SUPERUSER)
exports.crearEmpresa = async (req, res) => {
	try {
		const { nombre, nit, telefono, direccion, email, logo } = req.body;

		// Validaciones
		if (!nombre) {
			return res.status(400).json({
				success: false,
				mensaje: "El nombre de la empresa es obligatorio",
			});
		}

		// Verificar si el NIT ya existe
		if (nit) {
			const empresaExistente = await Empresa.findOne({ where: { nit } });
			if (empresaExistente) {
				return res.status(400).json({
					success: false,
					mensaje: "El NIT ya está registrado",
				});
			}
		}

		// Verificar si el email ya existe
		if (email) {
			const empresaExistente = await Empresa.findOne({ where: { email } });
			if (empresaExistente) {
				return res.status(400).json({
					success: false,
					mensaje: "El email ya está registrado",
				});
			}
		}

		// Crear empresa
		const nuevaEmpresa = await Empresa.create({
			nombre,
			nit,
			telefono,
			direccion,
			email,
			logo,
			activo: true,
		});

		return res.status(201).json({
			success: true,
			mensaje: "Empresa creada exitosamente",
			data: nuevaEmpresa,
		});
	} catch (error) {
		console.error("Error al crear empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear empresa",
			error: error.message,
		});
	}
};

// Actualizar empresa (solo SUPERUSER)
exports.actualizarEmpresa = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre, nit, telefono, direccion, email, logo } = req.body;

		const empresa = await Empresa.findByPk(id);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Verificar si el NIT ya existe en otra empresa
		if (nit && nit !== empresa.nit) {
			const empresaExistente = await Empresa.findOne({
				where: { nit },
			});
			if (
				empresaExistente &&
				empresaExistente.id_empresa !== empresa.id_empresa
			) {
				return res.status(400).json({
					success: false,
					mensaje: "El NIT ya está registrado en otra empresa",
				});
			}
		}

		// Verificar si el email ya existe en otra empresa
		if (email && email !== empresa.email) {
			const empresaExistente = await Empresa.findOne({
				where: { email },
			});
			if (
				empresaExistente &&
				empresaExistente.id_empresa !== empresa.id_empresa
			) {
				return res.status(400).json({
					success: false,
					mensaje: "El email ya está registrado en otra empresa",
				});
			}
		}

		// Actualizar empresa
		await empresa.update({
			nombre: nombre || empresa.nombre,
			nit: nit !== undefined ? nit : empresa.nit,
			telefono: telefono !== undefined ? telefono : empresa.telefono,
			direccion: direccion !== undefined ? direccion : empresa.direccion,
			email: email !== undefined ? email : empresa.email,
			logo: logo !== undefined ? logo : empresa.logo,
		});

		return res.status(200).json({
			success: true,
			mensaje: "Empresa actualizada exitosamente",
			data: empresa,
		});
	} catch (error) {
		console.error("Error al actualizar empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar empresa",
			error: error.message,
		});
	}
};

// Activar/desactivar empresa (solo SUPERUSER)
exports.toggleEmpresa = async (req, res) => {
	try {
		const { id } = req.params;

		const empresa = await Empresa.findByPk(id);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Cambiar estado
		await empresa.update({ activo: !empresa.activo });

		// También desactivar/activar todos los usuarios de la empresa
		await Usuario.update(
			{ activo: empresa.activo },
			{ where: { id_empresa: empresa.id_empresa } },
		);

		return res.status(200).json({
			success: true,
			mensaje: `Empresa ${empresa.activo ? "activada" : "desactivada"} exitosamente`,
			data: empresa,
		});
	} catch (error) {
		console.error("Error al cambiar estado de empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar estado de empresa",
			error: error.message,
		});
	}
};

// Eliminar empresa (solo SUPERUSER) - Eliminación suave
exports.eliminarEmpresa = async (req, res) => {
	try {
		const { id } = req.params;

		const empresa = await Empresa.findByPk(id);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Desactivar empresa y todos sus usuarios
		await empresa.update({ activo: false });
		await Usuario.update(
			{ activo: false },
			{ where: { id_empresa: empresa.id_empresa } },
		);

		return res.status(200).json({
			success: true,
			mensaje: "Empresa desactivada exitosamente",
		});
	} catch (error) {
		console.error("Error al eliminar empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al eliminar empresa",
			error: error.message,
		});
	}
};

// Obtener estadísticas de una empresa (solo SUPERUSER)
exports.obtenerEstadisticasEmpresa = async (req, res) => {
	try {
		const { id } = req.params;

		const empresa = await Empresa.findByPk(id);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Obtener estadísticas detalladas
		const totalUsuarios = await Usuario.count({
			where: { id_empresa: id },
		});

		const usuariosActivos = await Usuario.count({
			where: { id_empresa: id, activo: true },
		});

		const totalProductos = await Producto.count({
			where: { id_empresa: id },
		});

		const totalClientes = await Cliente.count({
			where: { id_empresa: id },
		});

		const totalVentas = await Venta.count({
			where: { id_empresa: id },
		});

		// Obtener usuarios por rol
		const usuariosPorRol = await Usuario.findAll({
			where: { id_empresa: id },
			attributes: [],
			include: [
				{
					model: Rol,
					as: "rol",
					attributes: ["nombre"],
				},
			],
			group: ["rol.id_rol", "rol.nombre"],
			raw: true,
		});

		return res.status(200).json({
			success: true,
			data: {
				empresa: {
					id_empresa: empresa.id_empresa,
					nombre: empresa.nombre,
					nit: empresa.nit,
					activo: empresa.activo,
				},
				estadisticas: {
					usuarios: {
						total: totalUsuarios,
						activos: usuariosActivos,
						inactivos: totalUsuarios - usuariosActivos,
					},
					totalProductos,
					totalClientes,
					totalVentas,
				},
			},
		});
	} catch (error) {
		console.error("Error al obtener estadísticas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener estadísticas",
			error: error.message,
		});
	}
};
// Obtener empresas públicas (sin autenticación)
exports.obtenerEmpresasPublicas = async (req, res) => {
	try {
		const empresas = await Empresa.findAll({
			where: { activo: true },
			attributes: ["id_empresa", "nombre", "slug"],
			order: [["nombre", "ASC"]],
		});

		return res.status(200).json({
			success: true,
			data: empresas,
		});
	} catch (error) {
		console.error("Error al obtener empresas públicas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener empresas",
			error: error.message,
		});
	}
};
