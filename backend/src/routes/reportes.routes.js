const express = require("express");
const router = express.Router();
const reporteController = require("../controllers/reporte.controller");
const verificarToken = require("../middlewares/auth.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de reportes
router.get("/ventas", reporteController.reporteVentas);
router.get(
	"/productos-mas-vendidos",
	reporteController.reporteProductosMasVendidos,
);
router.get("/inventario", reporteController.reporteInventario);
router.get("/dashboard", reporteController.dashboard);

module.exports = router;
