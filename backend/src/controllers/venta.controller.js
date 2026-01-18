const sequelize = require("../config/database");
const Venta = require("../models/Venta");
const DetalleVenta = require("../models/DetalleVenta");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const Notificacion = require("../models/Notificacion");

// Obtener todas las ventas (multitenant)
exports.obtenerVentas = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const ventas = await Venta.findAll({
			where: { id_empresa },
			include: [
				{ model: Cliente, as: "cliente" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleVenta,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
			order: [["fecha_venta", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: ventas,
		});
	} catch (error) {
		console.error("Error al obtener ventas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener ventas",
			error: error.message,
		});
	}
};

// Obtener venta por ID
exports.obtenerVentaPorId = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const venta = await Venta.findOne({
			where: {
				id_venta: id,
				id_empresa,
			},
			include: [
				{ model: Cliente, as: "cliente" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleVenta,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
		});

		if (!venta) {
			return res.status(404).json({
				success: false,
				mensaje: "Venta no encontrada",
			});
		}

		return res.status(200).json({
			success: true,
			data: venta,
		});
	} catch (error) {
		console.error("Error al obtener venta:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener venta",
			error: error.message,
		});
	}
};

// Crear venta
exports.crearVenta = async (req, res) => {
	const t = await sequelize.transaction();

	try {
		const { id_empresa, id_usuario } = req.usuario;
		const { id_cliente, metodo_pago, descuento, observaciones, productos } =
			req.body;

		// Validaciones
		if (!productos || productos.length === 0) {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "Debe incluir al menos un producto",
			});
		}

		// Generar número de venta
		const ultimaVenta = await Venta.findOne({
			where: { id_empresa },
			order: [["id_venta", "DESC"]],
		});

		const numeroVenta = ultimaVenta
			? `V-${String(parseInt(ultimaVenta.numero_venta.split("-")[1]) + 1).padStart(6, "0")}`
			: "V-000001";

		// Calcular subtotal
		let subtotal = 0;
		const detallesVenta = [];

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

			// Verificar stock
			if (producto.stock_actual < item.cantidad) {
				await t.rollback();
				return res.status(400).json({
					success: false,
					mensaje: `Stock insuficiente para el producto ${producto.nombre}`,
				});
			}

			const subtotalItem = item.cantidad * producto.precio_venta;
			subtotal += subtotalItem;

			detallesVenta.push({
				id_producto: producto.id_producto,
				cantidad: item.cantidad,
				precio_unitario: producto.precio_venta,
				subtotal: subtotalItem,
			});

			// Descontar stock
			producto.stock_actual -= item.cantidad;
			await producto.save({ transaction: t });
		}

		const descuentoAplicado = descuento || 0;
		const total = subtotal - descuentoAplicado;

		// Crear venta
		const nuevaVenta = await Venta.create(
			{
				id_empresa,
				id_usuario,
				id_cliente,
				numero_venta: numeroVenta,
				fecha_venta: new Date(),
				subtotal,
				descuento: descuentoAplicado,
				total,
				metodo_pago: metodo_pago || "EFECTIVO",
				estado: "COMPLETADA",
				observaciones,
			},
			{ transaction: t },
		);

		// Crear detalles de venta
		for (const detalle of detallesVenta) {
			await DetalleVenta.create(
				{
					id_venta: nuevaVenta.id_venta,
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
				tipo: "VENTA",
				titulo: "Nueva venta registrada",
				mensaje: `Venta ${numeroVenta} por un total de Bs. ${total}`,
			},
			{ transaction: t },
		);

		await t.commit();

		// Obtener venta completa
		const ventaCreada = await Venta.findByPk(nuevaVenta.id_venta, {
			include: [
				{ model: Cliente, as: "cliente" },
				{
					model: Usuario,
					as: "usuario",
					attributes: ["id_usuario", "nombre", "apellido"],
				},
				{
					model: DetalleVenta,
					as: "detalles",
					include: [{ model: Producto, as: "producto" }],
				},
			],
		});

		return res.status(201).json({
			success: true,
			mensaje: "Venta registrada exitosamente",
			data: ventaCreada,
		});
	} catch (error) {
		await t.rollback();
		console.error("Error al crear venta:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear venta",
			error: error.message,
		});
	}
};

// Anular venta
exports.anularVenta = async (req, res) => {
	const t = await sequelize.transaction();

	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const venta = await Venta.findOne({
			where: {
				id_venta: id,
				id_empresa,
			},
			include: [{ model: DetalleVenta, as: "detalles" }],
			transaction: t,
		});

		if (!venta) {
			await t.rollback();
			return res.status(404).json({
				success: false,
				mensaje: "Venta no encontrada",
			});
		}

		if (venta.estado === "ANULADA") {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "La venta ya está anulada",
			});
		}

		// Devolver stock
		for (const detalle of venta.detalles) {
			const producto = await Producto.findByPk(detalle.id_producto, {
				transaction: t,
			});
			if (producto) {
				producto.stock_actual += detalle.cantidad;
				await producto.save({ transaction: t });
			}
		}

		// Anular venta
		venta.estado = "ANULADA";
		await venta.save({ transaction: t });

		await t.commit();

		return res.status(200).json({
			success: true,
			mensaje: "Venta anulada exitosamente",
			data: venta,
		});
	} catch (error) {
		await t.rollback();
		console.error("Error al anular venta:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al anular venta",
			error: error.message,
		});
	}
};
