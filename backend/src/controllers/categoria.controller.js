const Categoria = require("../models/Categoria");
const Producto = require("../models/Producto");

// Obtener todas las categorías (multitenant)
exports.obtenerCategorias = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const categorias = await Categoria.findAll({
			where: { id_empresa },
			order: [["fecha_creacion", "DESC"]],
		});

		return res.status(200).json({
			success: true,
			data: categorias,
		});
	} catch (error) {
		console.error("Error al obtener categorías:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener categorías",
			error: error.message,
		});
	}
};

// Obtener categoría por ID
exports.obtenerCategoriaPorId = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const categoria = await Categoria.findOne({
			where: {
				id_categoria: id,
				id_empresa,
			},
		});

		if (!categoria) {
			return res.status(404).json({
				success: false,
				mensaje: "Categoría no encontrada",
			});
		}

		return res.status(200).json({
			success: true,
			data: categoria,
		});
	} catch (error) {
		console.error("Error al obtener categoría:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener categoría",
			error: error.message,
		});
	}
};

// Crear categoría
exports.crearCategoria = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { nombre, descripcion } = req.body;

		// Validaciones
		if (!nombre) {
			return res.status(400).json({
				success: false,
				mensaje: "El nombre es obligatorio",
			});
		}

		// Verificar si el nombre ya existe
		const categoriaExistente = await Categoria.findOne({
			where: { nombre, id_empresa },
		});

		if (categoriaExistente) {
			return res.status(400).json({
				success: false,
				mensaje: "Ya existe una categoría con ese nombre",
			});
		}

		// Crear categoría
		const nuevaCategoria = await Categoria.create({
			id_empresa,
			nombre,
			descripcion,
		});

		return res.status(201).json({
			success: true,
			mensaje: "Categoría creada exitosamente",
			data: nuevaCategoria,
		});
	} catch (error) {
		console.error("Error al crear categoría:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al crear categoría",
			error: error.message,
		});
	}
};

// Actualizar categoría
exports.actualizarCategoria = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;
		const { nombre, descripcion } = req.body;

		const categoria = await Categoria.findOne({
			where: {
				id_categoria: id,
				id_empresa,
			},
		});

		if (!categoria) {
			return res.status(404).json({
				success: false,
				mensaje: "Categoría no encontrada",
			});
		}

		// Verificar si el nuevo nombre ya existe (si se está cambiando)
		if (nombre && nombre !== categoria.nombre) {
			const categoriaExistente = await Categoria.findOne({
				where: { nombre, id_empresa },
			});

			if (categoriaExistente) {
				return res.status(400).json({
					success: false,
					mensaje: "Ya existe una categoría con ese nombre",
				});
			}
		}

		// Actualizar campos
		if (nombre) categoria.nombre = nombre;
		if (descripcion !== undefined) categoria.descripcion = descripcion;

		await categoria.save();

		return res.status(200).json({
			success: true,
			mensaje: "Categoría actualizada exitosamente",
			data: categoria,
		});
	} catch (error) {
		console.error("Error al actualizar categoría:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al actualizar categoría",
			error: error.message,
		});
	}
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;
		const { id } = req.params;

		const categoria = await Categoria.findOne({
			where: {
				id_categoria: id,
				id_empresa,
			},
		});

		if (!categoria) {
			return res.status(404).json({
				success: false,
				mensaje: "Categoría no encontrada",
			});
		}

		// Verificar si hay productos asociados
		const productosAsociados = await Producto.count({
			where: {
				id_categoria: id,
				id_empresa,
			},
		});

		if (productosAsociados > 0) {
			return res.status(400).json({
				success: false,
				mensaje: `No se puede eliminar la categoría porque tiene ${productosAsociados} producto(s) asociado(s)`,
			});
		}

		await categoria.destroy();

		return res.status(200).json({
			success: true,
			mensaje: "Categoría eliminada exitosamente",
		});
	} catch (error) {
		console.error("Error al eliminar categoría:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al eliminar categoría",
			error: error.message,
		});
	}
};

// Obtener categorías con cantidad de productos
exports.obtenerCategoriasConProductos = async (req, res) => {
	try {
		const { id_empresa } = req.usuario;

		const categorias = await Categoria.findAll({
			where: { id_empresa },
			include: [
				{
					model: Producto,
					as: "productos",
					attributes: [],
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
		console.error("Error al obtener categorías con productos:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al obtener categorías con productos",
			error: error.message,
		});
	}
};
