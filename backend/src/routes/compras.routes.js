const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compra.controller");
const compraPDFController = require("../controllers/compra.pdf.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de compras
router.get("/", compraController.obtenerCompras);
router.get("/:id", compraController.obtenerCompraPorId);

// Generar PDF de compra
router.get("/:id/pdf", compraPDFController.generarPDFCompra);

router.post(
	"/",
	verificarRol("ADMIN", "SUPERUSER"),
	compraController.crearCompra,
);

// Marcar compra como recibida (actualiza stock)
router.patch(
	"/:id/recibir",
	verificarRol("ADMIN", "SUPERUSER"),
	compraController.marcarRecibida,
);

router.patch(
	"/:id/anular",
	verificarRol("ADMIN", "SUPERUSER"),
	compraController.anularCompra,
);

module.exports = router;
