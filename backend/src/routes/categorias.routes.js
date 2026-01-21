const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoria.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de categorías
router.get("/", categoriaController.obtenerCategorias);
router.get("/con-productos", categoriaController.obtenerCategoriasConProductos);
router.get("/:id", categoriaController.obtenerCategoriaPorId);
router.post("/", verificarRol("ADMIN"), categoriaController.crearCategoria);
router.put(
	"/:id",
	verificarRol("ADMIN"),
	categoriaController.actualizarCategoria,
);
router.delete(
	"/:id",
	verificarRol("ADMIN"),
	categoriaController.eliminarCategoria,
);

module.exports = router;
