require("dotenv").config();
const mysql = require("mysql2/promise");

async function renombrarBD() {
	try {
		console.log("🔧 Renombrando base de datos...\n");

		const conexion = await mysql.createConnection({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		});

		// Crear una nueva BD sin el tab
		console.log("1️⃣ Creando nueva base de datos limpia...");
		await conexion.query("CREATE DATABASE IF NOT EXISTS saas_inventario_clean");

		// Copiar todas las tablas
		console.log("2️⃣ Obteniendo lista de tablas...");
		await conexion.query("USE `\tsaas_inventario`");
		const [tables] = await conexion.query("SHOW TABLES");

		console.log(`   Encontradas ${tables.length} tablas\n`);

		for (const tableRow of tables) {
			const tableName = Object.values(tableRow)[0];
			console.log(`   📋 Copiando tabla: ${tableName}`);

			// Crear tabla en nueva BD
			const [createTable] = await conexion.query(
				`SHOW CREATE TABLE \`${tableName}\``,
			);
			const createSQL = createTable[0]["Create Table"];

			await conexion.query("USE saas_inventario_clean");
			await conexion.query(createSQL);

			// Copiar datos
			await conexion.query(
				`INSERT INTO saas_inventario_clean.\`${tableName}\` SELECT * FROM \`\tsaas_inventario\`.\`${tableName}\``,
			);
		}

		console.log("\n3️⃣ Eliminando base de datos antigua...");
		await conexion.query("DROP DATABASE `\tsaas_inventario`");

		console.log("4️⃣ Renombrando base de datos nueva...");
		await conexion.query("CREATE DATABASE `saas_inventario`");

		// Copiar de clean a la final
		await conexion.query("USE saas_inventario_clean");
		const [tables2] = await conexion.query("SHOW TABLES");

		for (const tableRow of tables2) {
			const tableName = Object.values(tableRow)[0];

			const [createTable] = await conexion.query(
				`SHOW CREATE TABLE \`${tableName}\``,
			);
			const createSQL = createTable[0]["Create Table"];

			await conexion.query("USE saas_inventario");
			await conexion.query(createSQL);

			await conexion.query(
				`INSERT INTO saas_inventario.\`${tableName}\` SELECT * FROM saas_inventario_clean.\`${tableName}\``,
			);
		}

		console.log("5️⃣ Limpiando...");
		await conexion.query("DROP DATABASE saas_inventario_clean");

		console.log("\n✅ ¡Base de datos renombrada correctamente!");
		console.log('   Nombre antiguo: "\\tsaas_inventario" (con tab)');
		console.log('   Nombre nuevo: "saas_inventario" (sin espacios)');

		// Verificar
		const [empresas] = await conexion.query(
			"SELECT id_empresa, nombre FROM saas_inventario.empresas LIMIT 3",
		);
		console.log("\n📊 Verificación - Empresas:");
		console.table(empresas);

		await conexion.end();
		console.log("\n✨ Ahora ejecuta: npm run dev");
	} catch (error) {
		console.error("❌ Error:", error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

renombrarBD();
