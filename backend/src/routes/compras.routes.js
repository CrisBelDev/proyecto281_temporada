const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compra.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de compras
router.get("/", compraController.obtenerCompras);
router.get("/:id", compraController.obtenerCompraPorId);
router.post("/", verificarRol("ADMIN"), compraController.crearCompra);
router.patch(
	"/:id/anular",
	verificarRol("ADMIN"),
	compraController.anularCompra,
);

module.exports = router;
