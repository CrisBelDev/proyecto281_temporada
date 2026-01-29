// Configuración del servidor - SUPERUSER gestiona TODAS las empresas
require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const Rol = require("./src/models/Rol");
const Usuario = require("./src/models/Usuario");
const Empresa = require("./src/models/Empresa");
const Cliente = require("./src/models/Cliente");
const Categoria = require("./src/models/Categoria");
const Producto = require("./src/models/Producto");
const Proveedor = require("./src/models/Proveedor");
const ProveedorProducto = require("./src/models/ProveedorProducto");
const Venta = require("./src/models/Venta");
const DetalleVenta = require("./src/models/DetalleVenta");
const Compra = require("./src/models/Compra");
const DetalleCompra = require("./src/models/DetalleCompra");
const Notificacion = require("./src/models/Notificacion");
const HistorialPago = require("./src/models/HistorialPago");

const PORT = process.env.PORT || 3000;

// Inicializar asociaciones entre modelos
const models = {
	Empresa,
	Rol,
	Usuario,
	Cliente,
	Categoria,
	Producto,
	Proveedor,
	ProveedorProducto,
	Venta,
	DetalleVenta,
	Compra,
	DetalleCompra,
	Notificacion,
	HistorialPago,
};

Object.values(models).forEach((model) => {
	if (model.associate) {
		model.associate(models);
	}
});

// Función para inicializar roles por defecto
const inicializarRoles = async () => {
	try {
		const roles = [
			{
				nombre: "SUPERUSER",
				descripcion:
					"Super Usuario - Acceso total al sistema y gestión de empresas",
			},
			{ nombre: "ADMIN", descripcion: "Administrador del sistema" },
			{ nombre: "VENDEDOR", descripcion: "Vendedor" },
		];

		for (const rol of roles) {
			await Rol.findOrCreate({
				where: { nombre: rol.nombre },
				defaults: rol,
			});
		}

		console.log("✓ Roles inicializados correctamente");
	} catch (error) {
		console.error("Error al inicializar roles:", error);
	}
};

// Función para crear el usuario SUPERUSER por defecto
const crearSuperusuario = async () => {
	try {
		// Buscar el rol SUPERUSER
		const rolSuperuser = await Rol.findOne({ where: { nombre: "SUPERUSER" } });
		if (!rolSuperuser) {
			console.log("⚠️  Rol SUPERUSER no encontrado");
			return;
		}

		// El SUPERUSER no está asociado a ninguna empresa específica
		// Puede gestionar todas las empresas del sistema

		// Verificar si ya existe el usuario SUPERUSER
		const usuarioExistente = await Usuario.findOne({
			where: {
				email: "superadmin@sistema.com",
			},
		});

		if (!usuarioExistente) {
			// Crear el usuario SUPERUSER sin empresa asignada
			await Usuario.create({
				id_empresa: null, // SUPERUSER no tiene empresa específica
				id_rol: rolSuperuser.id_rol,
				nombre: "Super",
				apellido: "Usuario",
				email: "superadmin@sistema.com",
				password: "12345678", // Se hasheará automáticamente
				telefono: "+591 00000000",
				activo: true,
				email_verificado: true,
			});

			console.log("✓ Usuario SUPERUSER creado exitosamente");
			console.log("  📧 Email: superadmin@sistema.com");
			console.log("  🔑 Password: 12345678");
			console.log(
				"  ⚠️  IMPORTANTE: Cambiar contraseña después del primer login",
			);
		} else {
			console.log("✓ Usuario SUPERUSER ya existe");
		}
	} catch (error) {
		console.error("Error al crear SUPERUSER:", error);
	}
};

// Iniciar servidor
const iniciarServidor = async () => {
	try {
		// Probar conexión a la base de datos
		await sequelize.authenticate();
		console.log("✓ Conexión a la base de datos establecida correctamente");

		// Sincronizar modelos con la base de datos
		// En producción, usar migraciones en lugar de sync
		// Cambiar alter: true a false para evitar modificaciones automáticas
		await sequelize.sync({ alter: false });
		console.log("✓ Modelos sincronizados con la base de datos");

		// Inicializar roles
		await inicializarRoles();

		// Crear usuario SUPERUSER por defecto
		await crearSuperusuario();

		// Iniciar servidor - Escuchar en todas las interfaces (0.0.0.0) para acceso desde red local
		app.listen(PORT, "0.0.0.0", () => {
			const localIP = process.env.LOCAL_IP || "192.168.0.11";
			console.log(`\n========================================`);
			console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
			console.log(`📍 Local: http://localhost:${PORT}`);
			console.log(`📍 Red Local: http://${localIP}:${PORT}`);
			console.log(`📍 API Local: http://localhost:${PORT}/api`);
			console.log(`📍 API Red Local: http://${localIP}:${PORT}/api`);
			console.log(`\n💡 Para acceder desde otro dispositivo:`);
			console.log(`   1. Usa la URL: http://${localIP}:${PORT}/api`);
			console.log(`   2. Asegúrate que el firewall permita el puerto ${PORT}`);
			console.log(`   3. El dispositivo debe estar en la misma red WiFi`);
			console.log(`========================================\n`);
		});
	} catch (error) {
		console.error("❌ Error al iniciar el servidor:", error);
		process.exit(1);
	}
};

iniciarServidor();
