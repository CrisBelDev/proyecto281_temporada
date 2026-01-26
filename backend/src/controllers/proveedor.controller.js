const Proveedor = require("../models/Proveedor");
const ProveedorProducto = require("../models/ProveedorProducto");
const Producto = require("../models/Producto");
const Compra = require("../models/Compra");
const { Op } = require("sequelize");

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { empresa_id } = req.query;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = {};

		if (isSuperUser) {
			if (empresa_id) {
				whereClause.id_empresa = empresa_id;
			}
		} else {
			whereClause.id_empresa = id_tenant;
		}

		const proveedores = await Proveedor.findAll({
			where: whereClause,
			include: [
				{
					model: ProveedorProducto,
					as: "productos_suministrados",
					include: [
						{
							model: Producto,
							as: "producto",
							attributes: ["id_producto", "codigo", "nombre"],
						},
					],
				},
			],
			order: [["nombre", "ASC"]],
		});

		return res.status(200).json({
			success: true,
			data: proveedores,
		});
	} catch (error) {
		console.error("Error al obtener proveedores:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener proveedores",
			error: error.message,
		});
	}
};

// Obtener proveedor por ID
exports.obtenerProveedorPorId = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { id } = req.params;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_proveedor: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const proveedor = await Proveedor.findOne({
			where: whereClause,
			include: [
				{
					model: ProveedorProducto,
					as: "productos_suministrados",
					include: [
						{
							model: Producto,
							as: "producto",
						},
					],
				},
			],
		});

		if (!proveedor) {
			return res.status(404).json({
				success: false,
				mensaje: "Proveedor no encontrado",
			});
		}

		return res.status(200).json({
			success: true,
			data: proveedor,
		});
	} catch (error) {
		console.error("Error al obtener proveedor:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener proveedor",
			error: error.message,
		});
	}
};

// Crear proveedor
exports.crearProveedor = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const {
			nombre,
			nit,
			email,
			telefono,
			direccion,
			contacto_nombre,
			contacto_telefono,
			datos_pago,
			observaciones,
			empresa_id,
			productos,
		} = req.body;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const empresaFinal = isSuperUser && empresa_id ? empresa_id : id_tenant;

		// Crear proveedor
		const proveedor = await Proveedor.create({
			nombre,
			nit,
			email,
			telefono,
			direccion,
			contacto_nombre,
			contacto_telefono,
			datos_pago: datos_pago ? JSON.stringify(datos_pago) : null,
			observaciones,
			id_empresa: empresaFinal,
		});

		// Si se proporcionaron productos, asociarlos
		if (productos && productos.length > 0) {
			const productosData = productos.map((p) => ({
				id_proveedor: proveedor.id_proveedor,
				id_producto: p.id_producto,
				precio_compra_habitual: p.precio_compra_habitual || null,
			}));

			await ProveedorProducto.bulkCreate(productosData);
		}

		// Obtener el proveedor completo con relaciones
		const proveedorCompleto = await Proveedor.findByPk(proveedor.id_proveedor, {
			include: [
				{
					model: ProveedorProducto,
					as: "productos_suministrados",
					include: [
						{
							model: Producto,
							as: "producto",
						},
					],
				},
			],
		});

		return res.status(201).json({
			success: true,
			mensaje: "Proveedor creado exitosamente",
			data: proveedorCompleto,
		});
	} catch (error) {
		console.error("Error al crear proveedor:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear proveedor",
			error: error.message,
		});
	}
};

// Actualizar proveedor
exports.actualizarProveedor = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { id } = req.params;
		const {
			nombre,
			nit,
			email,
			telefono,
			direccion,
			contacto_nombre,
			contacto_telefono,
			datos_pago,
			observaciones,
		} = req.body;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_proveedor: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const proveedor = await Proveedor.findOne({ where: whereClause });

		if (!proveedor) {
			return res.status(404).json({
				success: false,
				mensaje: "Proveedor no encontrado",
			});
		}

		await proveedor.update({
			nombre,
			nit,
			email,
			telefono,
			direccion,
			contacto_nombre,
			contacto_telefono,
			datos_pago: datos_pago
				? JSON.stringify(datos_pago)
				: proveedor.datos_pago,
			observaciones,
		});

		return res.status(200).json({
			success: true,
			mensaje: "Proveedor actualizado exitosamente",
			data: proveedor,
		});
	} catch (error) {
		console.error("Error al actualizar proveedor:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar proveedor",
			error: error.message,
		});
	}
};

// Toggle activo/inactivo
exports.toggleProveedor = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { id } = req.params;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_proveedor: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const proveedor = await Proveedor.findOne({ where: whereClause });

		if (!proveedor) {
			return res.status(404).json({
				success: false,
				mensaje: "Proveedor no encontrado",
			});
		}

		await proveedor.update({ activo: !proveedor.activo });

		return res.status(200).json({
			success: true,
			mensaje: `Proveedor ${proveedor.activo ? "activado" : "desactivado"}`,
			data: proveedor,
		});
	} catch (error) {
		console.error("Error al cambiar estado del proveedor:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar estado del proveedor",
			error: error.message,
		});
	}
};

// Agregar producto a proveedor
exports.agregarProducto = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { id } = req.params;
		const { id_producto, precio_compra_habitual } = req.body;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_proveedor: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const proveedor = await Proveedor.findOne({ where: whereClause });

		if (!proveedor) {
			return res.status(404).json({
				success: false,
				mensaje: "Proveedor no encontrado",
			});
		}

		// Verificar si ya existe la relación
		const existente = await ProveedorProducto.findOne({
			where: {
				id_proveedor: id,
				id_producto,
			},
		});

		if (existente) {
			return res.status(400).json({
				success: false,
				mensaje: "Este producto ya está asociado al proveedor",
			});
		}

		const proveedorProducto = await ProveedorProducto.create({
			id_proveedor: id,
			id_producto,
			precio_compra_habitual,
		});

		return res.status(201).json({
			success: true,
			mensaje: "Producto agregado al proveedor",
			data: proveedorProducto,
		});
	} catch (error) {
		console.error("Error al agregar producto:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al agregar producto",
			error: error.message,
		});
	}
};

// Toggle producto (activar/desactivar)
exports.toggleProducto = async (req, res) => {
	try {
		const { id, id_producto } = req.params;

		const proveedorProducto = await ProveedorProducto.findOne({
			where: {
				id_proveedor: id,
				id_producto,
			},
		});

		if (!proveedorProducto) {
			return res.status(404).json({
				success: false,
				mensaje: "Relación proveedor-producto no encontrada",
			});
		}

		await proveedorProducto.update({ activo: !proveedorProducto.activo });

		return res.status(200).json({
			success: true,
			mensaje: `Producto ${proveedorProducto.activo ? "activado" : "desactivado"}`,
			data: proveedorProducto,
		});
	} catch (error) {
		console.error("Error al cambiar estado del producto:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al cambiar estado del producto",
			error: error.message,
		});
	}
};

// Obtener historial de compras de un proveedor
exports.obtenerHistorialCompras = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_proveedor: id };

		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const compras = await Compra.findAll({
			where: whereClause,
			order: [["fecha_compra", "DESC"]],
		});

		const total = compras.reduce((sum, c) => sum + parseFloat(c.total), 0);
		const completadas = compras.filter((c) => c.estado === "COMPLETADA").length;

		return res.status(200).json({
			success: true,
			data: {
				compras,
				estadisticas: {
					total_compras: compras.length,
					compras_completadas: completadas,
					monto_total: total,
				},
			},
		});
	} catch (error) {
		console.error("Error al obtener historial:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener historial de compras",
			error: error.message,
		});
	}
};
