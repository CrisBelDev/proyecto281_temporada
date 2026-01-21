/**
 * Script para crear el primer usuario SUPERUSER
 * Ejecutar con: node crear-superuser.js
 */

require("dotenv").config();
const sequelize = require("./src/config/database");
const Usuario = require("./src/models/Usuario");
const Rol = require("./src/models/Rol");
const Empresa = require("./src/models/Empresa");

const crearSuperuser = async () => {
	try {
		console.log("🚀 Iniciando creación de SUPERUSER...\n");

		// 1. Verificar conexión a la base de datos
		await sequelize.authenticate();
		console.log("✓ Conexión a la base de datos establecida\n");

		// 2. Buscar o crear el rol SUPERUSER
		let [rolSuperuser] = await Rol.findOrCreate({
			where: { nombre: "SUPERUSER" },
			defaults: {
				nombre: "SUPERUSER",
				descripcion:
					"Super Usuario - Acceso total al sistema y gestión de empresas",
			},
		});
		console.log(
			`✓ Rol SUPERUSER encontrado/creado con ID: ${rolSuperuser.id_rol}\n`,
		);

		// 3. Buscar o crear la empresa del sistema
		let [empresaSistema] = await Empresa.findOrCreate({
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
		console.log(
			`✓ Empresa del sistema encontrada/creada con ID: ${empresaSistema.id_empresa}\n`,
		);

		// 4. Verificar si ya existe el usuario
		const usuarioExistente = await Usuario.findOne({
			where: {
				email: "superadmin@sistema.com",
				id_empresa: empresaSistema.id_empresa,
			},
		});

		if (usuarioExistente) {
			console.log("⚠️  El usuario SUPERUSER ya existe:");
			console.log(`   Email: ${usuarioExistente.email}`);
			console.log(`   ID: ${usuarioExistente.id_usuario}`);
			console.log(`   Activo: ${usuarioExistente.activo}\n`);

			// Preguntar si desea actualizar el rol
			const actualizarRol = await preguntarSiNo(
				"¿Desea actualizar el rol de este usuario a SUPERUSER? (s/n): ",
			);

			if (actualizarRol) {
				await usuarioExistente.update({
					id_rol: rolSuperuser.id_rol,
					activo: true,
				});
				console.log("\n✓ Usuario actualizado a SUPERUSER exitosamente!\n");
			}
		} else {
			// 5. Crear el usuario SUPERUSER
			const nuevoUsuario = await Usuario.create({
				id_empresa: empresaSistema.id_empresa,
				id_rol: rolSuperuser.id_rol,
				nombre: "Super",
				apellido: "Usuario",
				email: "superadmin@sistema.com",
				password: "SuperAdmin@2026", // El modelo automáticamente lo hasheará
				telefono: "+591 00000000",
				activo: true,
				email_verificado: true,
			});

			console.log("✓ Usuario SUPERUSER creado exitosamente!\n");
			console.log("📋 CREDENCIALES DEL SUPERUSER:");
			console.log("================================");
			console.log(`Email:    superadmin@sistema.com`);
			console.log(`Password: SuperAdmin@2026`);
			console.log("================================\n");
			console.log(`ID Usuario: ${nuevoUsuario.id_usuario}`);
			console.log(`ID Empresa: ${empresaSistema.id_empresa}`);
			console.log(`ID Rol:     ${rolSuperuser.id_rol}\n`);
			console.log(
				"⚠️  IMPORTANTE: Cambiar la contraseña después del primer login!\n",
			);
		}

		console.log("\n✅ Proceso completado exitosamente!");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Error al crear SUPERUSER:");
		console.error(error);
		process.exit(1);
	}
};

// Función auxiliar para preguntar sí/no (solo para Node.js interactivo)
async function preguntarSiNo(pregunta) {
	// Si no es interactivo, retornar false
	return false;
}

// Ejecutar el script
crearSuperuser();
