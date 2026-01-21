const express = require("express");
const router = express.Router();
const notificacionController = require("../controllers/notificacion.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de notificaciones
router.get("/", notificacionController.obtenerNotificaciones);
router.post(
	"/",
	verificarRol("ADMIN"),
	notificacionController.crearNotificacion,
);
router.patch("/:id/leida", notificacionController.marcarComoLeida);
router.patch("/todas/leidas", notificacionController.marcarTodasComoLeidas);
router.delete("/:id", notificacionController.eliminarNotificacion);
router.delete("/", notificacionController.limpiarNotificaciones);

module.exports = router;
