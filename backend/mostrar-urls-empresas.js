const sequelize = require("./src/config/database");

async function mostrarURLsEmpresas() {
	try {
		console.log("\n🏪 RESUMEN DE EMPRESAS Y SUS PORTALES\n");
		console.log("═══════════════════════════════════════════════════════\n");

		const [empresas] = await sequelize.query(`
      SELECT 
        e.id_empresa, 
        e.nombre, 
        e.slug, 
        e.activo,
        COUNT(p.id_producto) as total_productos
      FROM empresas e
      LEFT JOIN productos p ON e.id_empresa = p.id_empresa AND p.activo = true
      GROUP BY e.id_empresa, e.nombre, e.slug, e.activo
      ORDER BY e.nombre
    `);

		if (empresas.length === 0) {
			console.log("❌ No hay empresas registradas\n");
			await sequelize.close();
			return;
		}

		console.log(`📊 Total de empresas: ${empresas.length}\n`);

		empresas.forEach((empresa, index) => {
			const estado = empresa.activo ? "✅ ACTIVA" : "❌ INACTIVA";
			const url = empresa.slug
				? `http://localhost:5174/portal/${empresa.slug}`
				: "⚠️  Sin slug - No accesible";

			console.log(`${index + 1}. ${empresa.nombre}`);
			console.log(`   Estado: ${estado}`);
			console.log(`   Slug: ${empresa.slug || "(no configurado)"}`);
			console.log(`   Productos: ${empresa.total_productos}`);
			console.log(`   URL: ${url}`);
			console.log("");
		});

		console.log("═══════════════════════════════════════════════════════");
		console.log("\n🌐 PÁGINA PRINCIPAL (Lista de todas las empresas):");
		console.log("   http://localhost:5174/\n");

		const empresasActivas = empresas.filter((e) => e.activo && e.slug);

		if (empresasActivas.length === 0) {
			console.log("⚠️  No hay empresas activas con slug configurado\n");
		} else {
			console.log("✅ Empresas listas para usar:\n");
			empresasActivas.forEach((e) => {
				console.log(`   • ${e.nombre}: http://localhost:5174/portal/${e.slug}`);
			});
			console.log("");
		}

		await sequelize.close();
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

mostrarURLsEmpresas();
