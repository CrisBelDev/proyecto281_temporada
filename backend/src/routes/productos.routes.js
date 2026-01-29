const express = require("express");
const router = express.Router();
const productoController = require("../controllers/producto.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");
const { uploadProducto } = require("../middlewares/upload.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de productos
router.get("/", productoController.obtenerProductos);
router.get("/stock-bajo", productoController.obtenerProductosStockBajo);
router.get("/:id", productoController.obtenerProductoPorId);
router.post(
	"/",
	verificarRol("ADMIN", "SUPERUSER"),
	uploadProducto,
	productoController.crearProducto,
);
router.put(
	"/:id",
	verificarRol("ADMIN", "SUPERUSER"),
	uploadProducto,
	productoController.actualizarProducto,
);
router.patch(
	"/:id/toggle",
	verificarRol("ADMIN", "SUPERUSER"),
	productoController.toggleProducto,
);
router.post(
	"/:id/imagen",
	verificarRol("ADMIN", "SUPERUSER"),
	uploadProducto,
	productoController.actualizarImagen,
);

module.exports = router;
