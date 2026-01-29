const Empresa = require("../models/Empresa");
const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Venta = require("../models/Venta");
const HistorialPago = require("../models/HistorialPago");
const path = require("path");
const fs = require("fs");

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
			logo: req.file ? `/uploads/empresas/${req.file.filename}` : logo,
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
			logo: req.file
				? `/uploads/empresas/${req.file.filename}`
				: logo !== undefined
					? logo
					: empresa.logo,
		});

		// Si se subió un nuevo logo, eliminar el anterior
		if (req.file && empresa.logo) {
			const oldLogoPath = path.join(
				__dirname,
				"../../uploads/empresas",
				path.basename(empresa.logo),
			);
			if (fs.existsSync(oldLogoPath)) {
				fs.unlinkSync(oldLogoPath);
			}
		}

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
			attributes: ["id_empresa", "nombre", "slug", "logo"],
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

// Actualizar solo el logo de la empresa
exports.actualizarLogo = async (req, res) => {
	try {
		const { id } = req.params;

		if (!req.file) {
			return res.status(400).json({
				success: false,
				mensaje: "No se proporcionó ningún logo",
			});
		}

		const empresa = await Empresa.findByPk(id);

		if (!empresa) {
			// Si la empresa no existe, eliminar el logo subido
			fs.unlinkSync(req.file.path);
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		// Eliminar logo anterior si existe
		if (empresa.logo) {
			const oldLogoPath = path.join(
				__dirname,
				"../../uploads/empresas",
				path.basename(empresa.logo),
			);
			if (fs.existsSync(oldLogoPath)) {
				fs.unlinkSync(oldLogoPath);
			}
		}

		// Actualizar con el nuevo logo
		empresa.logo = `/uploads/empresas/${req.file.filename}`;
		await empresa.save();

		return res.status(200).json({
			success: true,
			mensaje: "Logo actualizado exitosamente",
			data: {
				logo: empresa.logo,
			},
		});
	} catch (error) {
		console.error("Error al actualizar logo:", error);
		// Si hay error, eliminar el logo subido
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar logo",
			error: error.message,
		});
	}
};

// Obtener la empresa del usuario autenticado
exports.obtenerMiEmpresa = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		if (!id_empresa) {
			return res.status(400).json({
				success: false,
				mensaje: "El usuario no tiene una empresa asociada",
			});
		}

		const empresa = await Empresa.findByPk(id_empresa);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		return res.status(200).json({
			success: true,
			data: empresa,
		});
	} catch (error) {
		console.error("Error al obtener mi empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener la empresa",
			error: error.message,
		});
	}
};

// Actualizar la empresa del usuario autenticado
exports.actualizarMiEmpresa = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		if (!id_empresa) {
			return res.status(400).json({
				success: false,
				mensaje: "El usuario no tiene una empresa asociada",
			});
		}

		const empresa = await Empresa.findByPk(id_empresa);

		if (!empresa) {
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		const {
			nombre,
			nit,
			telefono,
			direccion,
			email,
			horario_apertura,
			horario_cierre,
			dias_atencion,
		} = req.body;

		// Si hay nuevo logo
		if (req.file) {
			// Eliminar logo anterior si existe
			if (empresa.logo) {
				const oldLogoPath = path.join(
					__dirname,
					"../../uploads/empresas",
					path.basename(empresa.logo),
				);
				if (fs.existsSync(oldLogoPath)) {
					fs.unlinkSync(oldLogoPath);
				}
			}
			empresa.logo = `/uploads/empresas/${req.file.filename}`;
		}

		// Actualizar campos permitidos
		if (nombre) empresa.nombre = nombre;
		if (nit) empresa.nit = nit;
		if (telefono) empresa.telefono = telefono;
		if (direccion) empresa.direccion = direccion;
		if (email) empresa.email = email;
		if (horario_apertura) empresa.horario_apertura = horario_apertura;
		if (horario_cierre) empresa.horario_cierre = horario_cierre;
		if (dias_atencion) empresa.dias_atencion = dias_atencion;

		await empresa.save();

		return res.status(200).json({
			success: true,
			mensaje: "Empresa actualizada exitosamente",
			data: empresa,
		});
	} catch (error) {
		console.error("Error al actualizar mi empresa:", error);
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar la empresa",
			error: error.message,
		});
	}
};

// Cambiar plan de suscripción
exports.cambiarPlanSuscripcion = async (req, res) => {
	try {
		const { id_empresa, id_usuario, rol } = req.usuario;
		const { plan_nuevo, metodo_pago, empresa_id } = req.body;

		// Si es SUPERUSER, puede cambiar el plan de cualquier empresa
		let empresaId = id_empresa;
		if (rol === "SUPERUSER" && empresa_id) {
			empresaId = empresa_id;
		}

		if (!empresaId) {
			return res.status(400).json({
				success: false,
				mensaje: "Debes especificar una empresa para cambiar el plan",
			});
		}

		// Validar plan
		if (!["BASICO", "PREMIUM", "EMPRESARIAL"].includes(plan_nuevo)) {
			return res.status(400).json({
				success: false,
				mensaje: "Plan inválido. Debe ser BASICO, PREMIUM o EMPRESARIAL",
			});
		}

		const empresa = await Empresa.findByPk(empresaId);

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		const plan_anterior = empresa.plan_suscripcion;

		// Validar que no sea el mismo plan
		if (plan_anterior === plan_nuevo) {
			return res.status(400).json({
				success: false,
				mensaje: "Ya tienes activo este plan de suscripción",
			});
		}

		// Precios de los planes (mensuales)
		const precios = {
			BASICO: 50.0,
			PREMIUM: 150.0,
			EMPRESARIAL: 300.0,
		};

		const monto = precios[plan_nuevo];

		// Calcular fecha de vencimiento (30 días desde hoy)
		const fecha_vencimiento = new Date();
		fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30);

		// Crear registro de pago
		const pago = await HistorialPago.create({
			id_empresa: empresaId,
			id_usuario,
			plan_anterior,
			plan_nuevo,
			monto,
			metodo_pago: metodo_pago || "QR",
			estado_pago: "COMPLETADO",
			descripcion: `Cambio de plan de ${plan_anterior} a ${plan_nuevo}`,
			fecha_pago: new Date(),
			fecha_vencimiento,
			fecha_creacion: new Date(),
		});

		// Actualizar empresa
		empresa.plan_suscripcion = plan_nuevo;
		empresa.monto_pago = monto;
		await empresa.save();

		return res.status(200).json({
			success: true,
			mensaje: "Plan de suscripción actualizado exitosamente",
			data: {
				empresa: {
					id_empresa: empresa.id_empresa,
					nombre: empresa.nombre,
					plan_suscripcion: empresa.plan_suscripcion,
					monto_pago: empresa.monto_pago,
				},
				pago: {
					id_pago: pago.id_pago,
					monto: pago.monto,
					plan_nuevo: pago.plan_nuevo,
					metodo_pago: pago.metodo_pago,
					fecha_pago: pago.fecha_pago,
					fecha_vencimiento: pago.fecha_vencimiento,
				},
			},
		});
	} catch (error) {
		console.error("Error al cambiar plan de suscripción:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar el plan de suscripción",
			error: error.message,
		});
	}
};

// Obtener historial de pagos de la empresa
exports.obtenerHistorialPagos = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		if (!id_empresa) {
			return res.status(400).json({
				success: false,
				mensaje: "El usuario no tiene una empresa asociada",
			});
		}

		const pagos = await HistorialPago.findAll({
			where: { id_empresa },
			include: [
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido", "email"],
				},
			],
			order: [["fecha_pago", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: pagos,
		});
	} catch (error) {
		console.error("Error al obtener historial de pagos:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener el historial de pagos",
			error: error.message,
		});
	}
};
