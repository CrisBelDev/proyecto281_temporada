const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresa.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");
const { uploadEmpresa } = require("../middlewares/upload.middleware");

// Ruta pública (sin autenticación)
router.get("/publicas", empresaController.obtenerEmpresasPublicas);

// Rutas para usuarios autenticados (pueden ver/editar su propia empresa)
router.use(verificarToken);

// Ruta para que usuarios vean/editen su propia empresa
router.get("/mi-empresa", empresaController.obtenerMiEmpresa);
router.put("/mi-empresa", uploadEmpresa, empresaController.actualizarMiEmpresa);
router.post(
	"/mi-empresa/cambiar-plan",
	empresaController.cambiarPlanSuscripcion,
);
router.get(
	"/mi-empresa/historial-pagos",
	empresaController.obtenerHistorialPagos,
);

// Todas las demás rutas requieren autenticación y rol SUPERUSER
router.use(verificarRol("SUPERUSER"));

// Rutas de empresas
router.get("/", empresaController.obtenerEmpresas);
router.get("/:id", empresaController.obtenerEmpresaPorId);
router.get("/:id/estadisticas", empresaController.obtenerEstadisticasEmpresa);
router.post("/", uploadEmpresa, empresaController.crearEmpresa);
router.put("/:id", uploadEmpresa, empresaController.actualizarEmpresa);
router.patch("/:id/toggle", empresaController.toggleEmpresa);
router.delete("/:id", empresaController.eliminarEmpresa);
router.post("/:id/logo", uploadEmpresa, empresaController.actualizarLogo);

module.exports = router;
