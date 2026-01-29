// Script para crear empresa y usuario de prueba
require("dotenv").config();
const sequelize = require("./src/config/database");
const Empresa = require("./src/models/Empresa");
const Usuario = require("./src/models/Usuario");
const Rol = require("./src/models/Rol");

async function crearUsuarioPrueba() {
	try {
		await sequelize.authenticate();
		console.log("✓ Conectado a la base de datos");

		// Buscar rol ADMIN
		const rolAdmin = await Rol.findOne({ where: { nombre: "ADMIN" } });
		if (!rolAdmin) {
			console.error("❌ Rol ADMIN no encontrado");
			process.exit(1);
		}

		// Crear empresa de prueba
		console.log("\n📦 Creando empresa de prueba...");

		// Generar valores únicos
		const timestamp = Date.now();

		const empresa = await Empresa.create({
			nombre: "Mi Empresa Demo",
			slug: `mi-empresa-demo-${timestamp}`,
			nit: `${Math.floor(100000000 + Math.random() * 900000000)}`,
			telefono: "+591 70000000",
			email: `contacto${timestamp}@miempresademo.com`,
			direccion: "Av. Principal #123",
			plan_suscripcion: "BASICO",
			monto_pago: 50.0,
			activo: true,
			horario_apertura: "08:00:00",
			horario_cierre: "18:00:00",
			dias_atencion: "Lunes a Sábado",
		});
		console.log(
			`✓ Empresa creada: ${empresa.nombre} (ID: ${empresa.id_empresa})`,
		);

		// Crear usuario de prueba
		console.log("\n👤 Creando usuario de prueba...");
		const usuario = await Usuario.create({
			id_empresa: empresa.id_empresa,
			id_rol: rolAdmin.id_rol,
			nombre: "Juan",
			apellido: "Pérez",
			email: `admin${timestamp}@miempresademo.com`,
			password: "12345678", // Se hasheará automáticamente
			telefono: "+591 70000001",
			activo: true,
			email_verificado: true,
		});
		console.log(`✓ Usuario creado: ${usuario.email}`);

		console.log("\n✅ ¡Usuario de prueba creado exitosamente!");
		console.log("\n📝 Credenciales para login:");
		console.log(`   📧 Email: ${usuario.email}`);
		console.log("   🔑 Password: 12345678");
		console.log("\n🎯 Ahora puedes:");
		console.log("   1. Ir a http://localhost:5173/login");
		console.log("   2. Iniciar sesión con las credenciales de arriba");
		console.log("   3. Ir a 'Mi Empresa' en el menú");
		console.log("   4. Cambiar entre los 3 planes disponibles:");
		console.log("      • BÁSICO (Bs. 50/mes)");
		console.log("      • PREMIUM (Bs. 150/mes)");
		console.log("      • EMPRESARIAL (Bs. 300/mes)");

		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error:", error.message);
		if (error.errors) {
			error.errors.forEach((err) => {
				console.error(`   - ${err.message}`);
			});
		}
		process.exit(1);
	}
}

crearUsuarioPrueba();
