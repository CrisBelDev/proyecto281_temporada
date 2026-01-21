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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar relaciones entre modelos
const setupAssociations = () => {
	// Usuario - Empresa
	Usuario.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Usuario, { foreignKey: "id_empresa", as: "usuarios" });

	// Usuario - Rol
	Usuario.belongsTo(Rol, { foreignKey: "id_rol", as: "rol" });
	Rol.hasMany(Usuario, { foreignKey: "id_rol", as: "usuarios" });

	// Producto - Empresa
	Producto.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Producto, { foreignKey: "id_empresa", as: "productos" });

	// Producto - Categoria
	Producto.belongsTo(Categoria, {
		foreignKey: "id_categoria",
		as: "categoria",
	});
	Categoria.hasMany(Producto, { foreignKey: "id_categoria", as: "productos" });

	// Categoria - Empresa
	Categoria.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Categoria, { foreignKey: "id_empresa", as: "categorias" });

	// Cliente - Empresa
	Cliente.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Cliente, { foreignKey: "id_empresa", as: "clientes" });

	// Proveedor - Empresa
	Proveedor.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Proveedor, { foreignKey: "id_empresa", as: "proveedores" });

	// Venta - Empresa
	Venta.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Venta, { foreignKey: "id_empresa", as: "ventas" });

	// Venta - Usuario
	Venta.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });
	Usuario.hasMany(Venta, { foreignKey: "id_usuario", as: "ventas" });

	// Venta - Cliente
	Venta.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
	Cliente.hasMany(Venta, { foreignKey: "id_cliente", as: "ventas" });

	// DetalleVenta - Venta
	DetalleVenta.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
	Venta.hasMany(DetalleVenta, { foreignKey: "id_venta", as: "detalles" });

	// DetalleVenta - Producto
	DetalleVenta.belongsTo(Producto, {
		foreignKey: "id_producto",
		as: "producto",
	});
	Producto.hasMany(DetalleVenta, {
		foreignKey: "id_producto",
		as: "detalle_ventas",
	});

	// Compra - Empresa
	Compra.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Compra, { foreignKey: "id_empresa", as: "compras" });

	// Compra - Usuario
	Compra.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });
	Usuario.hasMany(Compra, { foreignKey: "id_usuario", as: "compras" });

	// Compra - Proveedor
	Compra.belongsTo(Proveedor, { foreignKey: "id_proveedor", as: "proveedor" });
	Proveedor.hasMany(Compra, { foreignKey: "id_proveedor", as: "compras" });

	// DetalleCompra - Compra
	DetalleCompra.belongsTo(Compra, { foreignKey: "id_compra", as: "compra" });
	Compra.hasMany(DetalleCompra, { foreignKey: "id_compra", as: "detalles" });

	// DetalleCompra - Producto
	DetalleCompra.belongsTo(Producto, {
		foreignKey: "id_producto",
		as: "producto",
	});
	Producto.hasMany(DetalleCompra, {
		foreignKey: "id_producto",
		as: "detalle_compras",
	});

	// Notificacion - Empresa
	Notificacion.belongsTo(Empresa, { foreignKey: "id_empresa", as: "empresa" });
	Empresa.hasMany(Notificacion, {
		foreignKey: "id_empresa",
		as: "notificaciones",
	});

	// Notificacion - Usuario
	Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });
	Usuario.hasMany(Notificacion, {
		foreignKey: "id_usuario",
		as: "notificaciones",
	});
};

setupAssociations();

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
