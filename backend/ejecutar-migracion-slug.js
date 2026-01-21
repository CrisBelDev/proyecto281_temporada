const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function ejecutarMigracion() {
    let conexion;
    
    try {
        console.log('📊 Conectando a la base de datos...');
        
        conexion = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        
        console.log('✓ Conexión establecida\n');
        
        // Leer el archivo de migración
        const sqlFile = path.join(__dirname, 'migrations', 'add_slug_empresas.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('🔧 Ejecutando migración add_slug_empresas.sql...\n');
        
        // Ejecutar la migración
        await conexion.query(sql);
        
        console.log('✓ Migración ejecutada correctamente\n');
        
        // Verificar que la columna se agregó
        const [columnas] = await conexion.query(`
            SHOW COLUMNS FROM empresas WHERE Field = 'slug'
        `);
        
        if (columnas.length > 0) {
            console.log('✓ Columna "slug" agregada a la tabla empresas');
            console.log('  Tipo:', columnas[0].Type);
            console.log('  Null:', columnas[0].Null);
            console.log('  Key:', columnas[0].Key);
        }
        
        // Mostrar empresas con sus slugs
        const [empresas] = await conexion.query(`
            SELECT id_empresa, nombre, slug FROM empresas
        `);
        
        if (empresas.length > 0) {
            console.log('\n📋 Empresas actualizadas con slug:');
            empresas.forEach(emp => {
                console.log(`  • ${emp.nombre} → ${emp.slug || 'pendiente'}`);
            });
        }
        
        console.log('\n✅ Migración completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al ejecutar migración:');
        console.error(error.message);
        
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('\n⚠️  La columna "slug" ya existe en la tabla empresas');
        }
        
        process.exit(1);
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
}

ejecutarMigracion();
