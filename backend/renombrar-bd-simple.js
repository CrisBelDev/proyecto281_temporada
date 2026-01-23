require("dotenv").config();
const mysql = require("mysql2/promise");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function renombrarBDSimple() {
	try {
		console.log("🔧 Renombrando base de datos (método simple)...\n");

		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		// Desactivar foreign key checks
		console.log("1️⃣ Creando nueva base de datos...");
		await conexion.query("CREATE DATABASE IF NOT EXISTS saas_inventario_new");

		console.log("2️⃣ Copiando datos sin foreign keys...");
		await conexion.query("SET FOREIGN_KEY_CHECKS=0");

		// Obtener todas las tablas
		await conexion.query("USE `\tsaas_inventario`");
		const [tables] = await conexion.query("SHOW TABLES");

		for (const tableRow of tables) {
			const tableName = Object.values(tableRow)[0];
			console.log(`   📋 ${tableName}`);

			// Crear tabla sin foreign keys primero
			const [createTable] = await conexion.query(
				`SHOW CREATE TABLE \`${tableName}\``,
			);
			let createSQL = createTable[0]["Create Table"];

			// Ejecutar en nueva BD
			await conexion.query("USE saas_inventario_new");
			await conexion.query("SET FOREIGN_KEY_CHECKS=0");
			await conexion.query(createSQL);

			// Copiar datos
			await conexion.query(`
        INSERT INTO saas_inventario_new.\`${tableName}\` 
        SELECT * FROM \`\tsaas_inventario\`.\`${tableName}\`
      `);
		}

		console.log("\n3️⃣ Eliminando BD antigua y renombrando...");
		await conexion.query("DROP DATABASE `\tsaas_inventario`");
		await conexion.query(
			"RENAME TABLE saas_inventario_new.* TO saas_inventario.*",
		);

		// Esto no funciona con RENAME, usar otro método
		await conexion.query("CREATE DATABASE saas_inventario");
		await conexion.query("USE saas_inventario_new");

		const [tables2] = await conexion.query("SHOW TABLES");
		for (const tableRow of tables2) {
			const tableName = Object.values(tableRow)[0];
			await conexion.query(
				`RENAME TABLE saas_inventario_new.\`${tableName}\` TO saas_inventario.\`${tableName}\``,
			);
		}

		await conexion.query("DROP DATABASE saas_inventario_new");
		await conexion.query("SET FOREIGN_KEY_CHECKS=1");

		console.log("\n✅ ¡Base de datos renombrada correctamente!");

		// Verificar
		const [empresas] = await conexion.query(
			"SELECT id_empresa, nombre FROM saas_inventario.empresas LIMIT 3",
		);
		console.log("\n📊 Verificación:");
		console.table(empresas);

		await conexion.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

renombrarBDSimple();
