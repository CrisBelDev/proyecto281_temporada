const Producto = require("../models/Producto");
const Categoria = require("../models/Categoria");
const Notificacion = require("../models/Notificacion");
const Empresa = require("../models/Empresa");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

// Obtener todos los productos (multitenant)
exports.obtenerProductos = async (req, res) => {
	try {
		const { busqueda, empresa_id } = req.query;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		console.log(
			"🔍 [PRODUCTOS] Usuario:",
			req.usuario.email,
			"| Rol:",
			rolUsuario,
			"| isSuperUser:",
			isSuperUser,
		);

		// Condición base: filtrar por tenant EXCEPTO para SUPERUSER
		let whereClause = {};

		if (isSuperUser) {
			// SUPERUSER: puede filtrar por empresa específica o ver todas
			if (empresa_id) {
				whereClause.id_empresa = empresa_id;
			}
			// Si no se especifica empresa_id, whereClause queda vacío = todos los productos
		} else {
			// Usuarios normales: solo ven productos de su empresa
			whereClause.id_empresa = id_tenant;
		}

		// Si hay búsqueda, agregar filtros
		if (busqueda) {
			whereClause[Op.or] = [
				{ nombre: { [Op.like]: `%${busqueda}%` } },
				{ codigo: { [Op.like]: `%${busqueda}%` } },
				{ descripcion: { [Op.like]: `%${busqueda}%` } },
			];
		}

		// Incluir información de la empresa y categoría
		const productos = await Producto.findAll({
			where: whereClause,
			include: [
				{ model: Categoria, as: "categoria" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
			order: [["fecha_creacion", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: productos.map((p) => ({
				...p.toJSON(),
				id_tenant: p.id_empresa,
			})),
			total: productos.length,
			tenant_info: {
				id_tenant: isSuperUser ? "TODOS" : id_tenant,
				mensaje: isSuperUser
					? "SUPERUSER - Acceso a todos los productos"
					: "Productos filtrados por empresa/tenant",
				is_superuser: isSuperUser,
			},
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
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		// Construir where clause según el rol
		const whereClause = { id_producto: id };
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const producto = await Producto.findOne({
			where: whereClause,
			include: [
				{ model: Categoria, as: "categoria" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: isSuperUser
					? "Producto no encontrado"
					: "Producto no encontrado en esta empresa",
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				...producto.toJSON(),
				id_tenant: producto.id_empresa,
			},
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
		const { empresa_id } = req.body;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		// Determinar la empresa del producto
		let id_empresa;
		if (isSuperUser) {
			// SUPERUSER debe especificar empresa_id
			if (!empresa_id) {
				return res.status(400).json({
					success: false,
					mensaje: "SUPERUSER debe especificar la empresa (empresa_id)",
				});
			}
			id_empresa = empresa_id;
		} else {
			// Usuarios normales usan su empresa
			id_empresa = id_tenant;
		}

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
		const stockActual = stock_actual || 0;
		const stockMinimo = stock_minimo || 5;

		const nuevoProducto = await Producto.create({
			id_empresa,
			id_categoria,
			codigo,
			nombre,
			descripcion,
			precio_compra: precio_compra || 0,
			precio_venta,
			stock_actual: stockActual,
			stock_minimo: stockMinimo,
			imagen: req.file ? `/uploads/productos/${req.file.filename}` : imagen,
			activo: true,
		});

		// Verificar si el producto tiene stock bajo o en cero
		if (stockActual === 0) {
			await Notificacion.create({
				id_empresa,
				id_usuario: req.usuario.id_usuario,
				tipo: "STOCK_AGOTADO",
				titulo: "Producto sin stock",
				mensaje: `El producto "${nombre}" se creó sin stock disponible y no será visible en el portal`,
				leida: false,
			});
		} else if (stockActual <= stockMinimo) {
			await Notificacion.create({
				id_empresa,
				id_usuario: req.usuario.id_usuario,
				tipo: "STOCK_BAJO",
				titulo: "Stock bajo",
				mensaje: `El producto "${nombre}" tiene stock bajo (${stockActual} unidades, mínimo: ${stockMinimo})`,
				leida: false,
			});
		}

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
		const { id } = req.params;
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
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		// Construir where clause según el rol
		const whereClause = { id_producto: id };
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const producto = await Producto.findOne({
			where: whereClause,
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: isSuperUser
					? "Producto no encontrado"
					: "Producto no encontrado en esta empresa",
			});
		}

		const id_empresa = producto.id_empresa;

		// Guardar valores anteriores para comparar
		const stockAnterior = producto.stock_actual;
		const stockMinimoAnterior = producto.stock_minimo;

		// Actualizar campos
		if (codigo) producto.codigo = codigo;
		if (nombre) producto.nombre = nombre;
		if (descripcion !== undefined) producto.descripcion = descripcion;
		if (precio_compra !== undefined) producto.precio_compra = precio_compra;
		if (precio_venta) producto.precio_venta = precio_venta;
		if (stock_actual !== undefined) producto.stock_actual = stock_actual;
		if (stock_minimo !== undefined) producto.stock_minimo = stock_minimo;
		if (id_categoria) producto.id_categoria = id_categoria;

		// Si se subió una nueva imagen
		if (req.file) {
			// Eliminar imagen anterior si existe
			if (producto.imagen) {
				const oldImagePath = path.join(
					__dirname,
					"../../uploads/productos",
					path.basename(producto.imagen),
				);
				if (fs.existsSync(oldImagePath)) {
					fs.unlinkSync(oldImagePath);
				}
			}
			producto.imagen = `/uploads/productos/${req.file.filename}`;
		} else if (imagen !== undefined) {
			producto.imagen = imagen;
		}

		await producto.save();

		// Verificar si el stock cambió y generar notificaciones
		const stockCambio =
			stock_actual !== undefined && stock_actual !== stockAnterior;
		const stockMinimoActual =
			stock_minimo !== undefined ? stock_minimo : stockMinimoAnterior;

		if (stockCambio) {
			if (producto.stock_actual === 0) {
				await Notificacion.create({
					id_empresa,
					id_usuario: req.usuario.id_usuario,
					tipo: "STOCK_AGOTADO",
					titulo: "Producto sin stock",
					mensaje: `El producto "${producto.nombre}" se quedó sin stock y no será visible en el portal`,
					leida: false,
				});
			} else if (
				producto.stock_actual <= stockMinimoActual &&
				stockAnterior > stockMinimoActual
			) {
				// Solo notificar si pasó de estar OK a stock bajo
				await Notificacion.create({
					id_empresa,
					id_usuario: req.usuario.id_usuario,
					tipo: "STOCK_BAJO",
					titulo: "Stock bajo",
					mensaje: `El producto "${producto.nombre}" tiene stock bajo (${producto.stock_actual} unidades, mínimo: ${stockMinimoActual})`,
					leida: false,
				});
			}
		}

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
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		// Construir where clause según el rol
		const whereClause = { id_producto: id };
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const producto = await Producto.findOne({
			where: whereClause,
		});

		if (!producto) {
			return res.status(404).json({
				success: false,
				mensaje: isSuperUser
					? "Producto no encontrado"
					: "Producto no encontrado en esta empresa",
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
		const { empresa_id } = req.query;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		// Condición base: filtrar por tenant EXCEPTO para SUPERUSER
		let whereClause = {
			activo: true,
			stock_actual: {
				[Op.lte]: require("sequelize").col("stock_minimo"),
			},
		};

		if (isSuperUser) {
			// SUPERUSER: puede filtrar por empresa específica o ver todas
			if (empresa_id) {
				whereClause.id_empresa = empresa_id;
			}
		} else {
			// Usuarios normales: solo ven productos de su empresa
			whereClause.id_empresa = id_tenant;
		}

		const productos = await Producto.findAll({
			where: whereClause,
			include: [
				{ model: Categoria, as: "categoria" },
				{
					model: Empresa,
					as: "empresa",
					attributes: ["id_empresa", "nombre", "nit"],
				},
			],
			order: [["stock_actual", "ASC"]],
		});

		// Crear notificaciones para productos con stock bajo (solo para usuarios normales)
		if (!isSuperUser) {
			for (const producto of productos) {
				await Notificacion.create({
					id_empresa: id_tenant,
					id_usuario: req.usuario.id_usuario,
					tipo: "STOCK_BAJO",
					titulo: "Stock bajo",
					mensaje: `El producto ${producto.nombre} tiene stock bajo (${producto.stock_actual} unidades)`,
					leida: false,
				});
			}
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

// Actualizar solo la imagen del producto
exports.actualizarImagen = async (req, res) => {
	try {
		const { id } = req.params;
		const id_tenant = req.usuario.id_empresa;
		const rolUsuario = req.usuario.nombre_rol;
		const isSuperUser = rolUsuario === "SUPERUSER";

		if (!req.file) {
			return res.status(400).json({
				success: false,
				mensaje: "No se proporcionó ninguna imagen",
			});
		}

		// Construir where clause según el rol
		const whereClause = { id_producto: id };
		if (!isSuperUser) {
			whereClause.id_empresa = id_tenant;
		}

		const producto = await Producto.findOne({
			where: whereClause,
		});

		if (!producto) {
			// Si el producto no existe, eliminar la imagen subida
			fs.unlinkSync(req.file.path);
			return res.status(404).json({
				success: false,
				mensaje: isSuperUser
					? "Producto no encontrado"
					: "Producto no encontrado en esta empresa",
			});
		}

		// Eliminar imagen anterior si existe
		if (producto.imagen) {
			const oldImagePath = path.join(
				__dirname,
				"../../uploads/productos",
				path.basename(producto.imagen),
			);
			if (fs.existsSync(oldImagePath)) {
				fs.unlinkSync(oldImagePath);
			}
		}

		// Actualizar con la nueva imagen
		producto.imagen = `/uploads/productos/${req.file.filename}`;
		await producto.save();

		return res.status(200).json({
			success: true,
			mensaje: "Imagen actualizada exitosamente",
			data: {
				imagen: producto.imagen,
			},
		});
	} catch (error) {
		console.error("Error al actualizar imagen:", error);
		// Si hay error, eliminar la imagen subida
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar imagen",
			error: error.message,
		});
	}
};
