const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/cliente.controller");
const verificarToken = require("../middlewares/auth.middleware");

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ============================================
// RUTAS DE CLIENTES CON MANEJO DE MULTI-TENANCY
// ============================================

// PUNTO 3: Obtener todos los clientes del tenant
router.get("/", clienteController.obtenerTodos);

// PUNTO 5: Obtener clientes eliminados (soft delete)
router.get("/eliminados", clienteController.obtenerEliminados);

// Obtener un cliente específico
router.get("/:id", clienteController.obtenerPorId);

// PUNTO 1: Crear nuevo cliente (con id_tenant)
router.post("/", clienteController.crear);

// PUNTO 2: Actualizar cliente
router.put("/:id", clienteController.actualizar);

// Cambiar estado activo/inactivo
router.patch("/:id/toggle", clienteController.toggle);

// PUNTO 4: Eliminar cliente (soft delete)
router.delete("/:id", clienteController.eliminar);

// BONUS: Restaurar cliente eliminado
router.patch("/:id/restaurar", clienteController.restaurar);

module.exports = router;
