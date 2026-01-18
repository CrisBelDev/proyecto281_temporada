const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Venta = require("../models/Venta");
const Compra = require("../models/Compra");
const Producto = require("../models/Producto");
const DetalleVenta = require("../models/DetalleVenta");

// Reporte de ventas por período
exports.reporteVentas = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { fecha_inicio, fecha_fin } = req.query;

		const where = {
			id_empresa,
			estado: "COMPLETADA",
		};

		if (fecha_inicio && fecha_fin) {
			where.fecha_venta = {
				[Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
			};
		}

		const ventas = await Venta.findAll({
			where,
			attributes: [
				[sequelize.fn("COUNT", sequelize.col("id_venta")), "total_ventas"],
				[sequelize.fn("SUM", sequelize.col("total")), "monto_total"],
				[sequelize.fn("SUM", sequelize.col("descuento")), "total_descuentos"],
				"metodo_pago",
			],
			group: ["metodo_pago"],
		});

		const totalGeneral = await Venta.findOne({
			where,
			attributes: [
				[sequelize.fn("COUNT", sequelize.col("id_venta")), "cantidad"],
				[sequelize.fn("SUM", sequelize.col("total")), "total"],
			],
		});

		return res.status(200).json({
			success: true,
			data: {
				ventas_por_metodo: ventas,
				resumen: totalGeneral,
			},
		});
	} catch (error) {
		console.error("Error al generar reporte de ventas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar reporte de ventas",
			error: error.message,
		});
	}
};

// Reporte de productos más vendidos
exports.reporteProductosMasVendidos = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { fecha_inicio, fecha_fin, limite } = req.query;

		const whereVenta = {
			id_empresa,
			estado: "COMPLETADA",
		};

		if (fecha_inicio && fecha_fin) {
			whereVenta.fecha_venta = {
				[Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
			};
		}

		const productos = await DetalleVenta.findAll({
			attributes: [
				"id_producto",
				[sequelize.fn("SUM", sequelize.col("cantidad")), "cantidad_vendida"],
				[sequelize.fn("SUM", sequelize.col("subtotal")), "total_vendido"],
			],
			include: [
				{
					model: Venta,
					as: "venta",
					where: whereVenta,
					attributes: [],
				},
				{
					model: Producto,
					as: "producto",
					attributes: ["id_producto", "codigo", "nombre", "precio_venta"],
				},
			],
			group: ["id_producto", "producto.id_producto"],
			order: [[sequelize.fn("SUM", sequelize.col("cantidad")), "DESC"]],
			limit: parseInt(limite) || 10,
		});

		return res.status(200).json({
			success: true,
			data: productos,
		});
	} catch (error) {
		console.error("Error al generar reporte de productos más vendidos:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar reporte de productos más vendidos",
			error: error.message,
		});
	}
};

// Reporte de inventario actual
exports.reporteInventario = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const productos = await Producto.findAll({
			where: { id_empresa, activo: true },
			attributes: [
				"id_producto",
				"codigo",
				"nombre",
				"stock_actual",
				"stock_minimo",
				"precio_compra",
				"precio_venta",
				[sequelize.literal("stock_actual * precio_compra"), "valor_inventario"],
			],
			order: [["nombre", "ASC"]],
		});

		const resumen = await Producto.findOne({
			where: { id_empresa, activo: true },
			attributes: [
				[
					sequelize.fn("COUNT", sequelize.col("id_producto")),
					"total_productos",
				],
				[sequelize.fn("SUM", sequelize.col("stock_actual")), "total_unidades"],
				[
					sequelize.fn(
						"SUM",
						sequelize.literal("stock_actual * precio_compra"),
					),
					"valor_total",
				],
			],
		});

		return res.status(200).json({
			success: true,
			data: {
				productos,
				resumen,
			},
		});
	} catch (error) {
		console.error("Error al generar reporte de inventario:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar reporte de inventario",
			error: error.message,
		});
	}
};

// Dashboard general
exports.dashboard = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0);

		// Ventas del día
		const ventasHoy = await Venta.findOne({
			where: {
				id_empresa,
				estado: "COMPLETADA",
				fecha_venta: {
					[Op.gte]: hoy,
				},
			},
			attributes: [
				[sequelize.fn("COUNT", sequelize.col("id_venta")), "cantidad"],
				[sequelize.fn("SUM", sequelize.col("total")), "total"],
			],
		});

		// Productos con stock bajo
		const productosStockBajo = await Producto.count({
			where: {
				id_empresa,
				activo: true,
				stock_actual: {
					[Op.lte]: sequelize.col("stock_minimo"),
				},
			},
		});

		// Total de productos
		const totalProductos = await Producto.count({
			where: { id_empresa, activo: true },
		});

		// Valor del inventario
		const valorInventario = await Producto.findOne({
			where: { id_empresa, activo: true },
			attributes: [
				[
					sequelize.fn(
						"SUM",
						sequelize.literal("stock_actual * precio_compra"),
					),
					"valor_total",
				],
			],
		});

		return res.status(200).json({
			success: true,
			data: {
				ventas_hoy: {
					cantidad: ventasHoy.dataValues.cantidad || 0,
					total: parseFloat(ventasHoy.dataValues.total || 0),
				},
				productos_stock_bajo: productosStockBajo,
				total_productos: totalProductos,
				valor_inventario: parseFloat(
					valorInventario.dataValues.valor_total || 0,
				),
			},
		});
	} catch (error) {
		console.error("Error al generar dashboard:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al generar dashboard",
			error: error.message,
		});
	}
};
