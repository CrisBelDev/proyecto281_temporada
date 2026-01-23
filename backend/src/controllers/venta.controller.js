const sequelize = require("../config/database");
const { Op } = require("sequelize");
const Venta = require("../models/Venta");
const DetalleVenta = require("../models/DetalleVenta");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const Empresa = require("../models/Empresa");
const Notificacion = require("../models/Notificacion");

// Obtener todas las ventas (multitenant con soporte SUPERUSER)
exports.obtenerVentas = async (req, res) => {
	try {
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { empresa_id } = req.query;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = {};

		// Filtrado por empresa
		if (isSuperUser) {
			if (empresa_id) {
				whereClause.id_empresa = empresa_id;
			}
			// Si no hay empresa_id, SUPERUSER ve TODAS las ventas
		} else {
			whereClause.id_empresa = id_tenant;
		}

		const ventas = await Venta.findAll({
			where: whereClause,
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
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "slug"],
				},
			],
			order: [["fecha_venta", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: ventas,
			total: ventas.length,
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
		const { id_empresa: id_tenant, nombre_rol } = req.usuario;
		const { id } = req.params;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_venta: id };

		// Filtrado por empresa
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const venta = await Venta.findOne({
			where: whereClause,
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
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "slug"],
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
		const { id_empresa: id_tenant, id_usuario, nombre_rol } = req.usuario;
		const {
			id_cliente,
			metodo_pago,
			descuento,
			observaciones,
			productos,
			id_empresa,
		} = req.body;

		// SUPERUSER puede especificar empresa, otros usuarios usan su empresa
		const empresaVenta =
			nombre_rol === "SUPERUSER" && id_empresa ? id_empresa : id_tenant;

		if (!empresaVenta) {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "Debe especificar una empresa para la venta",
			});
		}

		// Validaciones
		if (!productos || productos.length === 0) {
			await t.rollback();
			return res.status(400).json({
				success: false,
				mensaje: "Debe incluir al menos un producto",
			});
		}

		// Validar que el cliente pertenezca a la empresa
		if (id_cliente) {
			const cliente = await Cliente.findOne({
				where: {
					id_cliente,
					id_empresa: empresaVenta,
				},
			});

			if (!cliente) {
				await t.rollback();
				return res.status(404).json({
					success: false,
					mensaje: "Cliente no encontrado en esta empresa",
				});
			}
		}

		// Generar número de venta
		const ultimaVenta = await Venta.findOne({
			where: { id_empresa: empresaVenta },
			order: [["id_venta", "DESC"]],
		});

		const numeroVenta = ultimaVenta
			? `V-${String(parseInt(ultimaVenta.numero_venta.split("-")[1]) + 1).padStart(6, "0")}`
			: "V-000001";

		// Calcular subtotal y validar productos
		let subtotal = 0;
		const detallesVenta = [];

		for (const item of productos) {
			const producto = await Producto.findOne({
				where: {
					id_producto: item.id_producto,
					id_empresa: empresaVenta,
				},
				transaction: t,
			});

			if (!producto) {
				await t.rollback();
				return res.status(404).json({
					success: false,
					mensaje: `Producto con ID ${item.id_producto} no encontrado en esta empresa`,
				});
			}

			if (!producto.activo) {
				await t.rollback();
				return res.status(400).json({
					success: false,
					mensaje: `El producto ${producto.nombre} no está activo`,
				});
			}

			// Verificar stock disponible
			if (producto.stock_actual < item.cantidad) {
				await t.rollback();
				return res.status(400).json({
					success: false,
					mensaje: `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock_actual}, Solicitado: ${item.cantidad}`,
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

			// ✅ ACTUALIZAR STOCK DEL PRODUCTO
			const stockAnterior = producto.stock_actual;
			producto.stock_actual -= item.cantidad;
			await producto.save({ transaction: t });

			console.log(
				`📦 Producto "${producto.nombre}": Stock ${stockAnterior} → ${producto.stock_actual} (vendidos: ${item.cantidad})`,
			);

			// Notificaciones de stock
			if (producto.stock_actual === 0) {
				await Notificacion.create(
					{
						id_empresa: empresaVenta,
						id_usuario,
						tipo: "STOCK_AGOTADO",
						titulo: "Producto sin stock",
						mensaje: `El producto "${producto.nombre}" se agotó tras una venta. Stock actual: 0`,
						leida: false,
					},
					{ transaction: t },
				);
			} else if (producto.stock_actual <= producto.stock_minimo) {
				await Notificacion.create(
					{
						id_empresa: empresaVenta,
						id_usuario,
						tipo: "STOCK_BAJO",
						titulo: "Stock bajo",
						mensaje: `El producto "${producto.nombre}" tiene stock bajo (${producto.stock_actual} unidades, mínimo: ${producto.stock_minimo})`,
						leida: false,
					},
					{ transaction: t },
				);
			}
		}

		const descuentoAplicado = descuento || 0;
		const total = subtotal - descuentoAplicado;

		// Crear venta
		const nuevaVenta = await Venta.create(
			{
				id_empresa: empresaVenta,
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

		// Crear notificación de venta exitosa
		await Notificacion.create(
			{
				id_empresa: empresaVenta,
				id_usuario,
				tipo: "VENTA",
				titulo: "Nueva venta registrada",
				mensaje: `Venta ${numeroVenta} completada por un total de Bs. ${total.toFixed(2)}`,
				leida: false,
			},
			{ transaction: t },
		);

		await t.commit();

		// Obtener venta completa con relaciones
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
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "slug"],
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

// Anular venta (devuelve el stock)
exports.anularVenta = async (req, res) => {
	const t = await sequelize.transaction();

	try {
		const { id_empresa: id_tenant, nombre_rol, id_usuario } = req.usuario;
		const { id } = req.params;

		const isSuperUser = nombre_rol === "SUPERUSER";
		const whereClause = { id_venta: id };

		// Filtrado por empresa
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const venta = await Venta.findOne({
			where: whereClause,
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

		// ✅ DEVOLVER STOCK A LOS PRODUCTOS
		for (const detalle of venta.detalles) {
			const producto = await Producto.findByPk(detalle.id_producto, {
				transaction: t,
			});
			if (producto) {
				const stockAnterior = producto.stock_actual;
				producto.stock_actual += detalle.cantidad;
				await producto.save({ transaction: t });

				console.log(
					`📦 Stock devuelto - Producto "${producto.nombre}": ${stockAnterior} → ${producto.stock_actual} (+${detalle.cantidad})`,
				);
			}
		}

		// Anular venta
		venta.estado = "ANULADA";
		await venta.save({ transaction: t });

		// Crear notificación
		await Notificacion.create(
			{
				id_empresa: venta.id_empresa,
				id_usuario,
				tipo: "VENTA",
				titulo: "Venta anulada",
				mensaje: `La venta ${venta.numero_venta} fue anulada. Stock devuelto a los productos.`,
				leida: false,
			},
			{ transaction: t },
		);

		await t.commit();

		return res.status(200).json({
			success: true,
			mensaje: "Venta anulada exitosamente. Stock devuelto a los productos.",
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
