const sequelize = require("./src/config/database");

async function actualizarSlugs() {
	try {
		console.log("🔧 Actualizando slugs de empresas...\n");

		// Generar slug para cada empresa que no tenga uno
		const [result] = await sequelize.query(`
      UPDATE empresas 
      SET slug = CONCAT(
        LOWER(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(nombre, ' ', '-'),
                    'á', 'a'
                  ),
                  'é', 'e'
                ),
                'í', 'i'
              ),
              'ó', 'o'
            ),
            'ú', 'u'
          )
        ),
        '-',
        id_empresa
      )
      WHERE slug IS NULL
    `);

		console.log(`✅ ${result.affectedRows} empresa(s) actualizada(s)\n`);

		// Mostrar resultados
		const [empresas] = await sequelize.query(`
      SELECT id_empresa, nombre, slug, activo 
      FROM empresas
    `);

		console.log("📋 Empresas con slugs:");
		console.table(empresas);

		console.log("\n✨ Ahora puedes acceder al portal con la URL:");
		empresas.forEach((e) => {
			console.log(`   http://localhost:5173/portal/${e.slug}`);
		});

		await sequelize.close();
		console.log("\n✅ Proceso completado");
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

actualizarSlugs();
