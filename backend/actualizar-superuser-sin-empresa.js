/**
 * Script para actualizar SUPERUSER sin empresa asignada
 * Ejecutar: node actualizar-superuser-sin-empresa.js
 */

require("dotenv").config();
const sequelize = require("./src/config/database");

const actualizarSuperuser = async () => {
	try {
		console.log("🔄 Iniciando actualización de SUPERUSER...\n");

		// Conectar a la base de datos
		await sequelize.authenticate();
		console.log("✅ Conexión a la base de datos establecida\n");

		// Ejecutar consulta SQL directa para mostrar estado actual
		console.log("📋 Estado ANTES de la actualización:");
		console.log("=====================================");

		const [resultadosAntes] = await sequelize.query(`
			SELECT 
				u.id_usuario,
				u.nombre,
				u.apellido,
				u.email,
				r.nombre as rol,
				COALESCE(e.nombre, 'SIN EMPRESA') as empresa,
				u.id_empresa
			FROM usuarios u
			JOIN roles r ON u.id_rol = r.id_rol
			LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
			WHERE r.nombre = 'SUPERUSER';
		`);

		if (resultadosAntes.length === 0) {
			console.log("ℹ️  No hay usuarios SUPERUSER en el sistema");
			console.log(
				"   Ejecuta el servidor (npm run dev) para crear el SUPERUSER automáticamente",
			);
			await sequelize.close();
			return;
		}

		resultadosAntes.forEach((user) => {
			console.log(`  • ${user.nombre} ${user.apellido} (${user.email})`);
			console.log(`    Empresa actual: ${user.empresa}`);
			console.log(`    id_empresa: ${user.id_empresa}`);
			console.log("");
		});

		// Actualizar SUPERUSERS
		console.log("🔧 Paso 1: Modificando la restricción de clave foránea...\n");

		try {
			// Eliminar la clave foránea existente
			await sequelize.query(`
				ALTER TABLE usuarios
				DROP FOREIGN KEY usuarios_ibfk_1;
			`);
			console.log("   ✅ Clave foránea eliminada");

			// Modificar la columna para permitir NULL
			await sequelize.query(`
				ALTER TABLE usuarios
				MODIFY COLUMN id_empresa INT NULL;
			`);
			console.log("   ✅ Columna modificada para permitir NULL");

			// Volver a crear la clave foránea con SET NULL
			await sequelize.query(`
				ALTER TABLE usuarios
				ADD CONSTRAINT usuarios_ibfk_1 
				FOREIGN KEY (id_empresa) 
				REFERENCES empresas(id_empresa) 
				ON DELETE SET NULL 
				ON UPDATE CASCADE;
			`);
			console.log("   ✅ Clave foránea recreada con SET NULL\n");
		} catch (error) {
			console.log(
				"   ⚠️  Error al modificar restricción (puede ser que ya esté modificada)",
			);
			console.log("      " + error.message + "\n");
		}

		console.log("🔧 Paso 2: Actualizando SUPERUSERS...\n");

		// Sintaxis compatible con MySQL/MariaDB
		const [updateResult] = await sequelize.query(`
			UPDATE usuarios u
			INNER JOIN roles r ON u.id_rol = r.id_rol
			SET u.id_empresa = NULL
			WHERE r.nombre = 'SUPERUSER'
			  AND u.id_empresa IS NOT NULL;
		`);

		console.log(`✅ SUPERUSER(s) actualizado(s)\n`);

		// Verificar actualización
		console.log("📋 Estado DESPUÉS de la actualización:");
		console.log("======================================");

		const [resultadosDespues] = await sequelize.query(`
			SELECT 
				u.id_usuario,
				u.nombre,
				u.apellido,
				u.email,
				r.nombre as rol,
				COALESCE(e.nombre, 'SIN EMPRESA - GESTIONA TODAS') as empresa,
				u.id_empresa
			FROM usuarios u
			JOIN roles r ON u.id_rol = r.id_rol
			LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
			WHERE r.nombre = 'SUPERUSER';
		`);

		resultadosDespues.forEach((user) => {
			console.log(`  • ${user.nombre} ${user.apellido} (${user.email})`);
			console.log(`    Empresa: ${user.empresa}`);
			console.log(
				`    id_empresa: ${user.id_empresa === null ? "NULL ✅" : user.id_empresa}`,
			);
			console.log("");
		});

		// Resumen
		console.log("\n🎉 ACTUALIZACIÓN COMPLETADA");
		console.log("===========================");
		console.log("✅ Los usuarios SUPERUSER ahora:");
		console.log("   • NO están asociados a ninguna empresa específica");
		console.log("   • Pueden gestionar TODAS las empresas del sistema");
		console.log(
			"   • Pueden especificar la empresa con la que quieren trabajar mediante:",
		);
		console.log("     - Query param: ?empresa_id=123");
		console.log("     - Header: X-Empresa-Id: 123");
		console.log("     - Body: empresa_id: 123");
		console.log("\n💡 Ejemplos de uso:");
		console.log(
			"   GET /api/productos?empresa_id=1  (ver productos de empresa 1)",
		);
		console.log("   GET /api/productos               (ver productos de TODAS)");
		console.log(
			"   POST /api/clientes con {empresa_id: 2, ...} (crear en empresa 2)",
		);
		console.log("\n📖 Ver documentación completa en: SUPERUSER_SIN_EMPRESA.md");

		await sequelize.close();
		console.log("\n✅ Conexión cerrada");
	} catch (error) {
		console.error("❌ Error al actualizar SUPERUSER:", error);
		process.exit(1);
	}
};

// Ejecutar script
actualizarSuperuser();
