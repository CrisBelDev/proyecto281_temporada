const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/venta.controller");
const facturaController = require("../controllers/factura.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de ventas
router.get("/", ventaController.obtenerVentas);
router.get("/:id", ventaController.obtenerVentaPorId);
router.get("/:id/factura/pdf", facturaController.generarFacturaPDF);
router.post(
	"/",
	verificarRol("ADMIN", "VENDEDOR", "SUPERUSER"),
	ventaController.crearVenta,
);
router.patch(
	"/:id/anular",
	verificarRol("ADMIN", "SUPERUSER"),
	ventaController.anularVenta,
);

module.exports = router;
