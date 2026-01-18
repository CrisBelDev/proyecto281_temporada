const sequelize = require("../config/database");
const Compra = require("../models/Compra");
const DetalleCompra = require("../models/DetalleCompra");
const Producto = require("../models/Producto");
const Proveedor = require("../models/Proveedor");
const Usuario = require("../models/Usuario");
const Notificacion = require("../models/Notificacion");

// Obtener todas las compras (multitenant)
exports.obtenerCompras = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const compras = await Compra.findAll({
			where: { id_empresa },
			include: [
				{ model: Proveedor, as: "proveedor" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleCompra,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
			order: [["fecha_compra", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: compras,
		});
	} catch (error) {
		console.error("Error al obtener compras:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener compras",
			error: error.message,
		});
	}
};

// Obtener compra por ID
exports.obtenerCompraPorId = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const compra = await Compra.findOne({
			where: {
				id_compra: id,
				id_empresa,
			},
			include: [
				{ model: Proveedor, as: "proveedor" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleCompra,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
		});

		if (!compra) {
			return res.status(404).json({
				success: false,
				mensaje: "Compra no encontrada",
			});
		}

		return res.status(200).json({
			success: true,
			data: compra,
		});
	} catch (error) {
		console.error("Error al obtener compra:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener compra",
			error: error.message,
		});
	}
};

// Crear compra
exports.crearCompra = async (req, res) => {
	const t = await sequelize.transaction();

	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { id_proveedor, observaciones, productos } = req.body;

		// Validaciones
		if (!productos || productos.length === 0) {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "Debe incluir al menos un producto",
			});
		}

		// Generar número de compra
		const ultimaCompra = await Compra.findOne({
			where: { id_empresa },
			order: [["id_compra", "DESC"]],
		});

		const numeroCompra = ultimaCompra
			? `C-${String(parseInt(ultimaCompra.numero_compra.split("-")[1]) + 1).padStart(6, "0")}`
			: "C-000001";

		// Calcular total
		let total = 0;
		const detallesCompra = [];

		for (const item of productos) {
			const producto = await Producto.findOne({
				where: {
					id_producto: item.id_producto,
					id_empresa,
				},
				transaction: t,
			});

			if (!producto) {
				await t.rollback();
				return res.status(404).json({
					success: false,
					mensaje: `Producto con ID ${item.id_producto} no encontrado`,
				});
			}

			const subtotalItem = item.cantidad * item.precio_unitario;
			total += subtotalItem;

			detallesCompra.push({
				id_producto: producto.id_producto,
				cantidad: item.cantidad,
				precio_unitario: item.precio_unitario,
				subtotal: subtotalItem,
			});

			// Incrementar stock
			producto.stock_actual += item.cantidad;

			// Actualizar precio de compra
			if (item.precio_unitario) {
				producto.precio_compra = item.precio_unitario;
			}

			await producto.save({ transaction: t });
		}

		// Crear compra
		const nuevaCompra = await Compra.create(
			{
				id_empresa,
				id_usuario,
				id_proveedor,
				numero_compra: numeroCompra,
				fecha_compra: new Date(),
				total,
				estado: "COMPLETADA",
				observaciones,
			},
			{ transaction: t },
		);

		// Crear detalles de compra
		for (const detalle of detallesCompra) {
			await DetalleCompra.create(
				{
					id_compra: nuevaCompra.id_compra,
					...detalle,
				},
				{ transaction: t },
			);
		}

		// Crear notificación
		await Notificacion.create(
			{
				id_empresa,
				id_usuario,
				tipo: "COMPRA",
				titulo: "Nueva compra registrada",
				mensaje: `Compra ${numeroCompra} por un total de Bs. ${total}`,
			},
			{ transaction: t },
		);

		await t.commit();

		// Obtener compra completa
		const compraCreada = await Compra.findByPk(nuevaCompra.id_compra, {
			include: [
				{ model: Proveedor, as: "proveedor" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleCompra,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
		});

		return res.status(201).json({
			success: true,
			mensaje: "Compra registrada exitosamente",
			data: compraCreada,
		});
	} catch (error) {
		await t.rollback();
		console.error("Error al crear compra:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear compra",
			error: error.message,
		});
	}
};

// Anular compra
exports.anularCompra = async (req, res) => {
	const t = await sequelize.transaction();

	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const compra = await Compra.findOne({
			where: {
				id_compra: id,
				id_empresa,
			},
			include: [{ model: DetalleCompra, as: "detalles" }],
			transaction: t,
		});

		if (!compra) {
			await t.rollback();
			return res.status(404).json({
				success: false,
				mensaje: "Compra no encontrada",
			});
		}

		if (compra.estado === "ANULADA") {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "La compra ya está anulada",
			});
		}

		// Devolver stock
		for (const detalle of compra.detalles) {
			const producto = await Producto.findByPk(detalle.id_producto, {
				transaction: t,
			});
			if (producto) {
				producto.stock_actual -= detalle.cantidad;
				await producto.save({ transaction: t });
			}
		}

		// Anular compra
		compra.estado = "ANULADA";
		await compra.save({ transaction: t });

		await t.commit();

		return res.status(200).json({
			success: true,
			mensaje: "Compra anulada exitosamente",
			data: compra,
		});
	} catch (error) {
		await t.rollback();
		console.error("Error al anular compra:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al anular compra",
			error: error.message,
		});
	}
};
