const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verificarToken = require("../middlewares/auth.middleware");

// Rutas públicas
router.post("/registrar-empresa", authController.registrarEmpresa);
router.post("/login", authController.login);

// Rutas protegidas
router.get("/verificar", verificarToken, authController.verificarToken);

module.exports = router;
