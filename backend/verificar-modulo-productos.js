// Script de verificación del módulo de productos
// Ejecutar: node verificar-modulo-productos.js

const fs = require("fs");
const path = require("path");

console.log("🔍 VERIFICACIÓN DEL MÓDULO DE PRODUCTOS\n");
console.log("=".repeat(50));

const checks = {
	backend: {
		controllers: [
			"src/controllers/categoria.controller.js",
			"src/controllers/notificacion.controller.js",
			"src/controllers/producto.controller.js",
			"src/controllers/portal.controller.js",
		],
		routes: [
			"src/routes/categorias.routes.js",
			"src/routes/notificaciones.routes.js",
			"src/routes/productos.routes.js",
			"src/routes/portal.routes.js",
		],
		models: [
			"src/models/Categoria.js",
			"src/models/Producto.js",
			"src/models/Notificacion.js",
			"src/models/Empresa.js",
		],
		migrations: ["migrations/add_slug_empresas.sql"],
	},
	frontend: {
		pages: [
			"src/pages/Categorias.jsx",
			"src/pages/Notificaciones.jsx",
			"src/pages/Productos.jsx",
			"src/pages/PortalProductos.jsx",
		],
		styles: [
			"src/styles/Categorias.css",
			"src/styles/Notificaciones.css",
			"src/styles/Productos.css",
			"src/styles/PortalProductos.css",
		],
		services: ["src/services/index.js"],
		routing: ["src/App.jsx"],
		layout: ["src/components/Layout.jsx"],
	},
};

let totalFiles = 0;
let foundFiles = 0;
let missingFiles = [];

function checkFile(basePath, file) {
	const fullPath = path.join(__dirname, basePath, file);
	totalFiles++;

	if (fs.existsSync(fullPath)) {
		console.log(`✅ ${file}`);
		foundFiles++;
		return true;
	} else {
		console.log(`❌ ${file} - NO ENCONTRADO`);
		missingFiles.push(`${basePath}/${file}`);
		return false;
	}
}

// Verificar Backend
console.log("\n📦 BACKEND\n");

console.log("  Controladores:");
checks.backend.controllers.forEach((file) => checkFile(".", file));

console.log("\n  Rutas:");
checks.backend.routes.forEach((file) => checkFile(".", file));

console.log("\n  Modelos:");
checks.backend.models.forEach((file) => checkFile(".", file));

console.log("\n  Migraciones:");
checks.backend.migrations.forEach((file) => checkFile(".", file));

// Verificar Frontend
console.log("\n🎨 FRONTEND\n");

console.log("  Páginas:");
checks.frontend.pages.forEach((file) => checkFile("../frontend", file));

console.log("\n  Estilos:");
checks.frontend.styles.forEach((file) => checkFile("../frontend", file));

console.log("\n  Servicios:");
checks.frontend.services.forEach((file) => checkFile("../frontend", file));

console.log("\n  Enrutamiento:");
checks.frontend.routing.forEach((file) => checkFile("../frontend", file));

console.log("\n  Layout:");
checks.frontend.layout.forEach((file) => checkFile("../frontend", file));

// Verificar contenido de archivos clave
console.log("\n🔍 VERIFICACIÓN DE CONTENIDO\n");

function checkFileContent(basePath, file, searchStrings) {
	const fullPath = path.join(__dirname, basePath, file);

	if (!fs.existsSync(fullPath)) {
		console.log(`⚠️  ${file} - No existe, saltando verificación de contenido`);
		return;
	}

	const content = fs.readFileSync(fullPath, "utf8");
	let allFound = true;

	searchStrings.forEach((str) => {
		if (content.includes(str)) {
			console.log(`  ✅ Contiene: "${str.substring(0, 40)}..."`);
		} else {
			console.log(`  ❌ Falta: "${str.substring(0, 40)}..."`);
			allFound = false;
		}
	});

	return allFound;
}

console.log("app.js - Rutas registradas:");
checkFileContent("src", "app.js", [
	'require("./routes/categorias.routes")',
	'require("./routes/notificaciones.routes")',
	'require("./routes/portal.routes")',
	'app.use("/api/categorias"',
	'app.use("/api/notificaciones"',
	'app.use("/api/portal"',
]);

console.log("\nApp.jsx - Rutas frontend:");
checkFileContent("../frontend/src", "App.jsx", [
	"import Categorias from",
	"import Notificaciones from",
	"import PortalProductos from",
	'<Route path="categorias"',
	'<Route path="notificaciones"',
	'<Route path="/portal/:empresaSlug"',
]);

console.log("\nLayout.jsx - Menú:");
checkFileContent("../frontend/src/components", "Layout.jsx", [
	'to="/categorias"',
	'to="/notificaciones"',
	"📑 Categorías",
	"🔔 Notificaciones",
]);

console.log("\nindex.js (services) - Servicios:");
checkFileContent("../frontend/src/services", "index.js", [
	"categoriasService",
	"notificacionesService",
]);

// Resumen final
console.log("\n" + "=".repeat(50));
console.log("\n📊 RESUMEN\n");
console.log(`Total de archivos verificados: ${totalFiles}`);
console.log(`Archivos encontrados: ${foundFiles}`);
console.log(`Archivos faltantes: ${totalFiles - foundFiles}`);

if (missingFiles.length > 0) {
	console.log("\n❌ ARCHIVOS FALTANTES:");
	missingFiles.forEach((file) => console.log(`  - ${file}`));
}

const porcentaje = ((foundFiles / totalFiles) * 100).toFixed(1);
console.log(`\nPorcentaje de completitud: ${porcentaje}%`);

if (foundFiles === totalFiles) {
	console.log("\n✅ ¡TODOS LOS ARCHIVOS ESTÁN EN SU LUGAR!");
	console.log("\n📝 PRÓXIMOS PASOS:");
	console.log(
		"1. Ejecutar migración: mysql -u root -p proyecto281 < migrations/add_slug_empresas.sql",
	);
	console.log("2. Iniciar backend: npm start");
	console.log("3. Iniciar frontend: npm run dev");
	console.log("4. Acceder a: http://localhost:5173");
	console.log("5. Probar módulo de categorías, productos y notificaciones");
	console.log("6. Configurar slug en empresas y probar portal público");
} else {
	console.log(
		"\n⚠️  Algunos archivos están faltantes. Revisar la lista arriba.",
	);
}

console.log("\n" + "=".repeat(50));
