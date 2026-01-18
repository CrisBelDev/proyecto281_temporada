const Producto = require("../models/Producto");
const Categoria = require("../models/Categoria");
const Notificacion = require("../models/Notificacion");

// Obtener todos los productos (multitenant)
exports.obtenerProductos = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const productos = await Producto.findAll({
			where: { id_empresa },
			include: [{ model: Categoria, as: "categoria" }],
			order: [["fecha_creacion", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: productos,
		});
	} catch (error) {
		console.error("Error al obtener productos:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener productos",
			error: error.message,
		});
	}
};

// Obtener producto por ID
exports.obtenerProductoPorId = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const producto = await Producto.findOne({
			where: {
				id_producto: id,
				id_empresa,
			},
			include: [{ model: Categoria, as: "categoria" }],
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: "Producto no encontrado",
			});
		}

		return res.status(200).json({
			success: true,
			data: producto,
		});
	} catch (error) {
		console.error("Error al obtener producto:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener producto",
			error: error.message,
		});
	}
};

// Crear producto
exports.crearProducto = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const {
			codigo,
			nombre,
			descripcion,
			precio_compra,
			precio_venta,
			stock_actual,
			stock_minimo,
			id_categoria,
			imagen,
		} = req.body;

		// Validaciones
		if (!codigo || !nombre || !precio_venta) {
			return res.status(400).json({
				success: false,
				mensaje: "Faltan campos obligatorios",
			});
		}

		// Verificar si el código ya existe
		const productoExistente = await Producto.findOne({
			where: { codigo, id_empresa },
		});

		if (productoExistente) {
			return res.status(400).json({
				success: false,
				mensaje: "El código de producto ya existe",
			});
		}

		// Crear producto
		const nuevoProducto = await Producto.create({
			id_empresa,
			id_categoria,
			codigo,
			nombre,
			descripcion,
			precio_compra: precio_compra || 0,
			precio_venta,
			stock_actual: stock_actual || 0,
			stock_minimo: stock_minimo || 5,
			imagen,
			activo: true,
		});

		const productoCreado = await Producto.findByPk(nuevoProducto.id_producto, {
			include: [{ model: Categoria, as: "categoria" }],
		});

		return res.status(201).json({
			success: true,
			mensaje: "Producto creado exitosamente",
			data: productoCreado,
		});
	} catch (error) {
		console.error("Error al crear producto:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear producto",
			error: error.message,
		});
	}
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;
		const {
			codigo,
			nombre,
			descripcion,
			precio_compra,
			precio_venta,
			stock_minimo,
			id_categoria,
			imagen,
		} = req.body;

		const producto = await Producto.findOne({
			where: {
				id_producto: id,
				id_empresa,
			},
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: "Producto no encontrado",
			});
		}

		// Actualizar campos
		if (codigo) producto.codigo = codigo;
		if (nombre) producto.nombre = nombre;
		if (descripcion !== undefined) producto.descripcion = descripcion;
		if (precio_compra !== undefined) producto.precio_compra = precio_compra;
		if (precio_venta) producto.precio_venta = precio_venta;
		if (stock_minimo !== undefined) producto.stock_minimo = stock_minimo;
		if (id_categoria) producto.id_categoria = id_categoria;
		if (imagen !== undefined) producto.imagen = imagen;

		await producto.save();

		const productoActualizado = await Producto.findByPk(producto.id_producto, {
			include: [{ model: Categoria, as: "categoria" }],
		});

		return res.status(200).json({
			success: true,
			mensaje: "Producto actualizado exitosamente",
			data: productoActualizado,
		});
	} catch (error) {
		console.error("Error al actualizar producto:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar producto",
			error: error.message,
		});
	}
};

// Activar/desactivar producto
exports.toggleProducto = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const producto = await Producto.findOne({
			where: {
				id_producto: id,
				id_empresa,
			},
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: "Producto no encontrado",
			});
		}

		producto.activo = !producto.activo;
		await producto.save();

		return res.status(200).json({
			success: true,
			mensaje: `Producto ${producto.activo ? "activado" : "desactivado"} exitosamente`,
			data: { activo: producto.activo },
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

// Obtener productos con stock bajo
exports.obtenerProductosStockBajo = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { Op } = require("sequelize");

		const productos = await Producto.findAll({
			where: {
				id_empresa,
				activo: true,
				stock_actual: {
					[Op.lte]: sequelize.col("stock_minimo"),
				},
			},
			include: [{ model: Categoria, as: "categoria" }],
			order: [["stock_actual", "ASC"]],
		});

		// Crear notificaciones para productos con stock bajo
		for (const producto of productos) {
			await Notificacion.create({
				id_empresa,
				tipo: "STOCK_BAJO",
				titulo: "Stock bajo",
				mensaje: `El producto ${producto.nombre} tiene stock bajo (${producto.stock_actual} unidades)`,
			});
		}

		return res.status(200).json({
			success: true,
			data: productos,
		});
	} catch (error) {
		console.error("Error al obtener productos con stock bajo:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener productos con stock bajo",
			error: error.message,
		});
	}
};
