const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresa.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Ruta pública (sin autenticación)
router.get("/publicas", empresaController.obtenerEmpresasPublicas);

// Todas las demás rutas requieren autenticación y rol SUPERUSER
router.use(verificarToken);
router.use(verificarRol("SUPERUSER"));

// Rutas de empresas
router.get("/", empresaController.obtenerEmpresas);
router.get("/:id", empresaController.obtenerEmpresaPorId);
router.get("/:id/estadisticas", empresaController.obtenerEstadisticasEmpresa);
router.post("/", empresaController.crearEmpresa);
router.put("/:id", empresaController.actualizarEmpresa);
router.patch("/:id/toggle", empresaController.toggleEmpresa);
router.delete("/:id", empresaController.eliminarEmpresa);

module.exports = router;
