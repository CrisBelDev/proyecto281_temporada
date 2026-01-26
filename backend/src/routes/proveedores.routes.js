const express = require("express");
const router = express.Router();
const proveedorController = require("../controllers/proveedor.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de proveedores
router.get("/", proveedorController.obtenerProveedores);
router.get("/:id", proveedorController.obtenerProveedorPorId);
router.get("/:id/compras", proveedorController.obtenerHistorialCompras);

router.post(
	"/",
	verificarRol("ADMIN", "SUPERUSER"),
	proveedorController.crearProveedor,
);

router.put(
	"/:id",
	verificarRol("ADMIN", "SUPERUSER"),
	proveedorController.actualizarProveedor,
);

router.patch(
	"/:id/toggle",
	verificarRol("ADMIN", "SUPERUSER"),
	proveedorController.toggleProveedor,
);

// Gestión de productos del proveedor
router.post(
	"/:id/productos",
	verificarRol("ADMIN", "SUPERUSER"),
	proveedorController.agregarProducto,
);

router.patch(
	"/:id/productos/:id_producto/toggle",
	verificarRol("ADMIN", "SUPERUSER"),
	proveedorController.toggleProducto,
);

module.exports = router;
