const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/roles.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de usuarios
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", usuarioController.obtenerUsuarioPorId);
router.post("/", verificarRol("ADMIN"), usuarioController.crearUsuario);
router.put("/:id", verificarRol("ADMIN"), usuarioController.actualizarUsuario);
router.delete("/:id", verificarRol("ADMIN"), usuarioController.eliminarUsuario);
router.patch(
	"/:id/toggle",
	verificarRol("ADMIN"),
	usuarioController.toggleUsuario,
);
router.put("/cambiar-password", usuarioController.cambiarPassword);

module.exports = router;
