const express = require("express");
const router = express.Router();
const portalController = require("../controllers/portal.controller");

// Rutas públicas (sin autenticación)
router.get(
	"/:empresa_slug/productos",
	portalController.obtenerProductosPublicos,
);
router.get(
	"/:empresa_slug/productos/:id",
	portalController.obtenerProductoPublico,
);
router.get(
	"/:empresa_slug/categorias",
	portalController.obtenerCategoriasPublicas,
);

module.exports = router;
