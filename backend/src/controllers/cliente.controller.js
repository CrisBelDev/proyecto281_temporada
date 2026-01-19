const Cliente = require("../models/Cliente");
const Empresa = require("../models/Empresa");
const { Op } = require("sequelize");

// ============================================
// PUNTO 1: Registrar cliente con manejo de id_tenant
// ============================================
// Ejemplo: POST /api/clientes
// Body: { "nombre": "abc", "nit": "111" }
// El id_tenant (id_empresa) se obtiene del token JWT del usuario autenticado
exports.crear = async (req, res) => {
	try {
		const { nombre, nit, telefono, email, direccion } = req.body;
		// ID_TENANT: Se obtiene del usuario autenticado (contexto multi-tenant)
		const id_tenant = req.usuario.id_empresa;

		// Validaciones
		if (!nombre) {
			return res.status(400).json({
				success: false,
				mensaje: "El nombre del cliente es obligatorio",
			});
		}

		// Verificar si ya existe un cliente con el mismo NIT en esta empresa (tenant)
		if (nit) {
			const clienteExistente = await Cliente.findOne({
				where: { nit, id_empresa: id_tenant }, // Filtro por tenant
			});
			if (clienteExistente) {
				return res.status(400).json({
					success: false,
					mensaje: "Ya existe un cliente con este NIT en esta empresa",
				});
			}
		}

		// Crear cliente asociado al tenant (empresa)
		const nuevoCliente = await Cliente.create({
			id_empresa: id_tenant, // FK hacia empresas (id_tenant)
			nombre,
			nit,
			telefono,
			email,
			direccion,
			activo: true,
		});

		return res.status(201).json({
			success: true,
			mensaje: "Cliente creado exitosamente",
			data: {
				...nuevoCliente.toJSON(),
				id_tenant: nuevoCliente.id_empresa, // Mostrar explícitamente el id_tenant
			},
		});
	} catch (error) {
		console.error("Error al crear cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear cliente",
			error: error.message,
		});
	}
};

// ============================================
// PUNTO 2: Modificar datos del cliente
// ============================================
// Ejemplo: PUT /api/clientes/:id
// Body: { "nombre": "taller" }
exports.actualizar = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre, nit, telefono, email, direccion } = req.body;
		const id_tenant = req.usuario.id_empresa;

		// Buscar cliente dentro del contexto del tenant
		const cliente = await Cliente.findOne({
			where: { id_cliente: id, id_empresa: id_tenant },
		});

		if (!cliente) {
			return res.status(404).json({
				success: false,
				mensaje: "Cliente no encontrado en esta empresa",
			});
		}

		// Validaciones
		if (!nombre) {
			return res.status(400).json({
				success: false,
				mensaje: "El nombre del cliente es obligatorio",
			});
		}

		// Verificar si ya existe otro cliente con el mismo NIT en este tenant
		if (nit && nit !== cliente.nit) {
			const clienteExistente = await Cliente.findOne({
				where: {
					nit,
					id_empresa: id_tenant,
					id_cliente: { [Op.ne]: id },
				},
			});
			if (clienteExistente) {
				return res.status(400).json({
					success: false,
					mensaje: "Ya existe otro cliente con este NIT en esta empresa",
				});
			}
		}

		// Actualizar cliente
		await cliente.update({
			nombre,
			nit,
			telefono,
			email,
			direccion,
		});

		return res.status(200).json({
			success: true,
			mensaje: "Cliente actualizado exitosamente",
			data: {
				...cliente.toJSON(),
				id_tenant: cliente.id_empresa,
			},
		});
	} catch (error) {
		console.error("Error al actualizar cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar cliente",
			error: error.message,
		});
	}
};

// ============================================
// PUNTO 3: Buscar todos los clientes de una microempresa (por id_tenant)
// ============================================
// Ejemplo: GET /api/clientes?busqueda=sistoys
// O mejor: GET /api/clientes (automáticamente filtra por el tenant del usuario)
exports.obtenerTodos = async (req, res) => {
	try {
		const { busqueda } = req.query;
		// ID_TENANT: Se obtiene automáticamente del usuario autenticado
		const id_tenant = req.usuario.id_empresa;

		// Condición base: siempre filtrar por el tenant
		let whereClause = { id_empresa: id_tenant };

		// Si hay búsqueda, agregar filtros
		if (busqueda) {
			whereClause[Op.or] = [
				{ nombre: { [Op.like]: `%${busqueda}%` } },
				{ nit: { [Op.like]: `%${busqueda}%` } },
				{ email: { [Op.like]: `%${busqueda}%` } },
				{ telefono: { [Op.like]: `%${busqueda}%` } },
			];
		}

		// Incluir información de la empresa (tenant) para verificación
		const clientes = await Cliente.findAll({
			where: whereClause,
			// Temporalmente sin include hasta verificar asociaciones
			// include: [
			// 	{
			// 		model: Empresa,
			// 		as: "empresa",
			// 		attributes: ["id_empresa", "nombre"],
			// 	},
			// ],
			order: [["fecha_creacion", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: clientes.map((c) => ({
				...c.toJSON(),
				id_tenant: c.id_empresa,
			})),
			total: clientes.length,
			tenant_info: {
				id_tenant: id_tenant,
				mensaje: "Clientes filtrados por empresa/tenant",
			},
		});
	} catch (error) {
		console.error("Error al obtener clientes:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener clientes",
			error: error.message,
		});
	}
};

// Obtener cliente por ID
exports.obtenerPorId = async (req, res) => {
	try {
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;

		const cliente = await Cliente.findOne({
			where: { id_cliente: id, id_empresa: id_tenant },
		});

		if (!cliente) {
			return res.status(404).json({
				success: false,
				mensaje: "Cliente no encontrado en esta empresa",
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				...cliente.toJSON(),
				id_tenant: cliente.id_empresa,
			},
		});
	} catch (error) {
		console.error("Error al obtener cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener cliente",
			error: error.message,
		});
	}
};

// ============================================
// PUNTO 4: Eliminar cliente (TEMPORAL: Hard Delete)
// ============================================
// Ejemplo: DELETE /api/clientes/:id
// NOTA: Actualmente elimina físicamente. Cambiar a soft delete después de migración
exports.eliminar = async (req, res) => {
	try {
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;

		// Buscar cliente en el contexto del tenant
		const cliente = await Cliente.findOne({
			where: { id_cliente: id, id_empresa: id_tenant },
		});

		if (!cliente) {
			return res.status(404).json({
				success: false,
				mensaje: "Cliente no encontrado en esta empresa",
			});
		}

		// TEMPORAL: Hard delete hasta ejecutar migración
		await cliente.destroy({ force: true });

		return res.status(200).json({
			success: true,
			mensaje: "Cliente eliminado exitosamente",
			data: {
				id_cliente: cliente.id_cliente,
				nombre: cliente.nombre,
				id_tenant: cliente.id_empresa,
			},
		});
	} catch (error) {
		console.error("Error al eliminar cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al eliminar cliente",
			error: error.message,
		});
	}
};

// ============================================
// PUNTO 5: Mostrar clientes eliminados (DESHABILITADO TEMPORALMENTE)
// ============================================
// Habilitar después de ejecutar migración de soft delete
exports.obtenerEliminados = async (req, res) => {
	try {
		// TEMPORAL: Retornar array vacío hasta ejecutar migración
		return res.status(200).json({
			success: true,
			data: [],
			total_eliminados: 0,
			mensaje:
				"Función deshabilitada. Ejecutar migración add_soft_delete_clientes.sql primero",
		});

		/* DESCOMENTAR DESPUÉS DE MIGRACIÓN
		const id_tenant = req.usuario.id_empresa;

		// paranoid: false permite ver registros con fecha_eliminacion
		const clientesEliminados = await Cliente.findAll({
			where: { id_empresa: id_tenant },
			include: [
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre"],
				},
			],
			paranoid: false, // Incluye registros eliminados
			order: [["fecha_eliminacion", "DESC"]],
		});

		// Filtrar solo los que tienen fecha_eliminacion
		const soloEliminados = clientesEliminados.filter(
			(c) => c.fecha_eliminacion !== null,
		);

		return res.status(200).json({
			success: true,
			data: soloEliminados.map((c) => ({
				...c.toJSON(),
				id_tenant: c.id_empresa,
			})),
			total_eliminados: soloEliminados.length,
			tenant_info: {
				id_tenant: id_tenant,
				mensaje: "Clientes eliminados (soft delete) de esta empresa",
			},
		});
		*/
	} catch (error) {
		console.error("Error al obtener clientes eliminados:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener clientes eliminados",
			error: error.message,
		});
	}
};

// Restaurar cliente eliminado (DESHABILITADO TEMPORALMENTE)
exports.restaurar = async (req, res) => {
	try {
		return res.status(400).json({
			success: false,
			mensaje:
				"Función deshabilitada. Ejecutar migración add_soft_delete_clientes.sql primero",
		});

		/* DESCOMENTAR DESPUÉS DE MIGRACIÓN
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;

		// Buscar en eliminados
		const cliente = await Cliente.findOne({
			where: { id_cliente: id, id_empresa: id_tenant },
			paranoid: false,
		});

		if (!cliente) {
			return res.status(404).json({
				success: false,
				mensaje: "Cliente no encontrado",
			});
		}

		if (!cliente.fecha_eliminacion) {
			return res.status(400).json({
				success: false,
				mensaje: "Este cliente no está eliminado",
			});
		}

		// Restaurar
		await cliente.restore();

		return res.status(200).json({
			success: true,
			mensaje: "Cliente restaurado exitosamente",
			data: {
				...cliente.toJSON(),
				id_tenant: cliente.id_empresa,
			},
		});
		*/
	} catch (error) {
		console.error("Error al restaurar cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al restaurar cliente",
			error: error.message,
		});
	}
};

// Cambiar estado del cliente (activar/desactivar)
exports.toggle = async (req, res) => {
	try {
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;

		const cliente = await Cliente.findOne({
			where: { id_cliente: id, id_empresa: id_tenant },
		});

		if (!cliente) {
			return res.status(404).json({
				success: false,
				mensaje: "Cliente no encontrado en esta empresa",
			});
		}

		await cliente.update({ activo: !cliente.activo });

		return res.status(200).json({
			success: true,
			mensaje: `Cliente ${cliente.activo ? "activado" : "desactivado"} exitosamente`,
			data: {
				...cliente.toJSON(),
				id_tenant: cliente.id_empresa,
			},
		});
	} catch (error) {
		console.error("Error al cambiar estado del cliente:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar estado del cliente",
			error: error.message,
		});
	}
};
