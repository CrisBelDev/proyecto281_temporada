require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const Rol = require("./src/models/Rol");
const Usuario = require("./src/models/Usuario");
const Empresa = require("./src/models/Empresa");

const PORT = process.env.PORT || 3000;

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

		// Buscar o crear la empresa del sistema
		const [empresaSistema] = await Empresa.findOrCreate({
			where: { email: "superadmin@sistema.com" },
			defaults: {
				nombre: "Sistema Central",
				nit: "SUPERUSER-001",
				email: "superadmin@sistema.com",
				telefono: "+591 00000000",
				direccion: "Sistema Central",
				activo: true,
			},
		});

		// Verificar si ya existe el usuario SUPERUSER
		const usuarioExistente = await Usuario.findOne({
			where: {
				email: "superadmin@sistema.com",
				id_empresa: empresaSistema.id_empresa,
			},
		});

		if (!usuarioExistente) {
			// Crear el usuario SUPERUSER
			await Usuario.create({
				id_empresa: empresaSistema.id_empresa,
				id_rol: rolSuperuser.id_rol,
				nombre: "Super",
				apellido: "Usuario",
				email: "superadmin@sistema.com",
				password: "SuperAdmin@2026", // Se hasheará automáticamente
				telefono: "+591 00000000",
				activo: true,
				email_verificado: true,
			});

			console.log("✓ Usuario SUPERUSER creado exitosamente");
			console.log("  📧 Email: superadmin@sistema.com");
			console.log("  🔑 Password: SuperAdmin@2026");
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
