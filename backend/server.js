require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const Rol = require("./src/models/Rol");

const PORT = process.env.PORT || 3000;

// Función para inicializar roles por defecto
const inicializarRoles = async () => {
	try {
		const roles = [
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

		// Iniciar servidor
		app.listen(PORT, () => {
			console.log(`\n========================================`);
			console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
			console.log(`📍 http://localhost:${PORT}`);
			console.log(`📍 API: http://localhost:${PORT}/api`);
			console.log(`========================================\n`);
		});
	} catch (error) {
		console.error("❌ Error al iniciar el servidor:", error);
		process.exit(1);
	}
};

iniciarServidor();
