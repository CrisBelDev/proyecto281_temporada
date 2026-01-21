const Producto = require("../models/Producto");
const Categoria = require("../models/Categoria");
const Empresa = require("../models/Empresa");

// Portal público de productos (sin autenticación)
exports.obtenerProductosPublicos = async (req, res) => {
	try {
		const { empresa_slug } = req.params;
		const { categoria, busqueda, limite = 50 } = req.query;

		// Buscar empresa por slug
		const empresa = await Empresa.findOne({
			where: { slug: empresa_slug, activo: true },
		});

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		const where = {
			id_empresa: empresa.id_empresa,
			activo: true,
			stock_actual: {
				[require("sequelize").Op.gt]: 0,
			},
		};

		// Filtrar por categoría
		if (categoria) {
			where.id_categoria = categoria;
		}

		// Búsqueda por nombre o código
		if (busqueda) {
			where[require("sequelize").Op.or] = [
				{
					nombre: {
						[require("sequelize").Op.like]: `%${busqueda}%`,
					},
				},
				{
					codigo: {
						[require("sequelize").Op.like]: `%${busqueda}%`,
					},
				},
			];
		}

		const productos = await Producto.findAll({
			where,
			include: [{ model: Categoria, as: "categoria" }],
			order: [["nombre", "ASC"]],
			limit: parseInt(limite),
			attributes: [
				"id_producto",
				"codigo",
				"nombre",
				"descripcion",
				"precio_venta",
				"stock_actual",
				"imagen",
			],
		});

		return res.status(200).json({
			success: true,
			empresa: {
				nombre: empresa.nombre,
				slug: empresa.slug,
			},
			data: productos,
		});
	} catch (error) {
		console.error("Error al obtener productos públicos:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener productos",
			error: error.message,
		});
	}
};

// Obtener categorías públicas
exports.obtenerCategoriasPublicas = async (req, res) => {
	try {
		const { empresa_slug } = req.params;

		// Buscar empresa por slug
		const empresa = await Empresa.findOne({
			where: { slug: empresa_slug, activo: true },
		});

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		const categorias = await Categoria.findAll({
			where: { id_empresa: empresa.id_empresa },
			include: [
				{
					model: Producto,
					as: "productos",
					where: {
						activo: true,
						stock_actual: { [require("sequelize").Op.gt]: 0 },
					},
					attributes: [],
					required: false,
				},
			],
			attributes: {
				include: [
					[
						require("sequelize").fn(
							"COUNT",
							require("sequelize").col("productos.id_producto"),
						),
						"cantidad_productos",
					],
				],
			},
			group: ["Categoria.id_categoria"],
			order: [["nombre", "ASC"]],
		});

		return res.status(200).json({
			success: true,
			data: categorias,
		});
	} catch (error) {
		console.error("Error al obtener categorías públicas:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener categorías",
			error: error.message,
		});
	}
};

// Obtener detalle de producto público
exports.obtenerProductoPublico = async (req, res) => {
	try {
		const { empresa_slug, id } = req.params;

		// Buscar empresa por slug
		const empresa = await Empresa.findOne({
			where: { slug: empresa_slug, activo: true },
		});

		if (!empresa) {
			return res.status(404).json({
				success: false,
				mensaje: "Empresa no encontrada",
			});
		}

		const producto = await Producto.findOne({
			where: {
				id_producto: id,
				id_empresa: empresa.id_empresa,
				activo: true,
			},
			include: [{ model: Categoria, as: "categoria" }],
			attributes: [
				"id_producto",
				"codigo",
				"nombre",
				"descripcion",
				"precio_venta",
				"stock_actual",
				"imagen",
			],
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
		console.error("Error al obtener producto público:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener producto",
			error: error.message,
		});
	}
};
