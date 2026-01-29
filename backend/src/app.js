const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// Importar modelos
const Empresa = require("./models/Empresa");
const Rol = require("./models/Rol");
const Usuario = require("./models/Usuario");
const Categoria = require("./models/Categoria");
const Producto = require("./models/Producto");
const Cliente = require("./models/Cliente");
const Proveedor = require("./models/Proveedor");
const ProveedorProducto = require("./models/ProveedorProducto");
const Venta = require("./models/Venta");
const DetalleVenta = require("./models/DetalleVenta");
const Compra = require("./models/Compra");
const DetalleCompra = require("./models/DetalleCompra");
const Notificacion = require("./models/Notificacion");

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const productosRoutes = require("./routes/productos.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const notificacionesRoutes = require("./routes/notificaciones.routes");
const ventasRoutes = require("./routes/ventas.routes");
const comprasRoutes = require("./routes/compras.routes");
const reportesRoutes = require("./routes/reportes.routes");
const clientesRoutes = require("./routes/clientes.routes");
const empresasRoutes = require("./routes/empresas.routes");
const portalRoutes = require("./routes/portal.routes");
const proveedoresRoutes = require("./routes/proveedores.routes");
const path = require("path");

const app = express();

// Middlewares
// CORS configurado para permitir múltiples orígenes
const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",")
	: ["http://localhost:5173"];

app.use(
	cors({
		origin: function (origin, callback) {
			// Permitir requests sin origin (como mobile apps o curl)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				// En desarrollo, permitir cualquier origen
				if (process.env.NODE_ENV === "development") {
					callback(null, true);
				} else {
					callback(new Error("Not allowed by CORS"));
				}
			}
		},
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// NOTA: Las asociaciones entre modelos ahora se manejan desde server.js
// usando el patrón Model.associate(models) en cada modelo

// Rutas de la API
app.get("/", (req, res) => {
	res.json({
		success: true,
		mensaje: "API SaaS Inventario - Backend funcionando correctamente",
		version: "1.0.0",
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/portal", portalRoutes); // Portal público
app.use("/api/proveedores", proveedoresRoutes);

// Manejo de errores 404
app.use((req, res) => {
	res.status(404).json({
		success: false,
		mensaje: "Ruta no encontrada",
	});
});

// Manejo de errores globales
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({
		success: false,
		mensaje: "Error interno del servidor",
		error: err.message,
	});
});

module.exports = app;
