const sequelize = require("./src/config/database");

async function verificarEmpresas() {
	try {
		console.log("🔍 Verificando empresas en la BD...\n");

		const [empresas] = await sequelize.query(`
      SELECT id_empresa, nombre, slug, activo 
      FROM empresas
    `);

		console.log("📋 Empresas encontradas:");
		console.table(empresas);

		const [productos] = await sequelize.query(`
      SELECT p.id_producto, p.nombre, p.codigo, e.nombre as empresa, e.slug
      FROM productos p
      LEFT JOIN empresas e ON p.id_empresa = e.id_empresa
      WHERE p.activo = true
      LIMIT 10
    `);

		console.log("\n📦 Algunos productos:");
		console.table(productos);

		await sequelize.close();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

verificarEmpresas();
