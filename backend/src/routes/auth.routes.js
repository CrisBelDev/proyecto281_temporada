const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verificarToken = require("../middlewares/auth.middleware");

// Rutas públicas
router.post("/registrar-empresa", authController.registrarEmpresa);
router.post("/login", authController.login);
router.get("/verificar-email/:token", authController.verificarEmail);
router.post("/reenviar-verificacion", authController.reenviarVerificacion);
router.post("/solicitar-recuperacion", authController.solicitarRecuperacion);
router.get(
	"/verificar-token-recuperacion/:token",
	authController.verificarTokenRecuperacion,
);
router.post("/resetear-password", authController.resetearPassword);

// Rutas protegidas
router.get("/verificar", verificarToken, authController.verificarToken);

module.exports = router;
