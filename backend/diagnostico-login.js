// Herramienta de diagnóstico de login
// Ejecutar: node diagnostico-login.js

const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log("🔍 HERRAMIENTA DE DIAGNÓSTICO DE LOGIN\n");
console.log("=".repeat(50));

function question(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function diagnosticar() {
	console.log("\n1. Diagnóstico rápido de base de datos");
	console.log(
		"   Ejecuta: mysql -u root -p proyecto281 < migrations/diagnostico-login.sql\n",
	);

	console.log("2. Verificar hash de contraseña");
	console.log(
		"   Esta herramienta te ayudará a verificar si tu contraseña coincide\n",
	);

	const opcion = await question("¿Qué deseas hacer? (1 o 2): ");

	if (opcion === "2") {
		await verificarPassword();
	} else {
		console.log(
			"\nEjecuta el diagnóstico SQL para ver el estado de los usuarios.",
		);
	}

	rl.close();
}

async function verificarPassword() {
	console.log("\n📝 VERIFICACIÓN DE CONTRASEÑA");
	console.log("=".repeat(50));

	const passwordTexto = await question("\nIngresa la contraseña a probar: ");

	console.log(
		'\nAhora copia el hash desde la base de datos con:\nmysql> SELECT email, password FROM usuarios WHERE email = "tu-email";\n',
	);

	const hashBD = await question("Pega el hash de la base de datos: ");

	try {
		const coincide = await bcrypt.compare(passwordTexto, hashBD.trim());

		console.log("\n" + "=".repeat(50));
		if (coincide) {
			console.log("✅ ¡La contraseña COINCIDE con el hash!");
			console.log("\nPosibles problemas:");
			console.log("  1. Email no verificado");
			console.log("  2. Usuario inactivo");
			console.log("  3. Empresa inactiva");
			console.log(
				"\nEjecuta el diagnóstico SQL para verificar el estado del usuario.",
			);
		} else {
			console.log("❌ La contraseña NO coincide con el hash");
			console.log("\nPosibles soluciones:");
			console.log("  1. Verifica que estás usando la contraseña correcta");
			console.log("  2. Usa la opción 'Olvidé mi contraseña' en el login");
			console.log("  3. Restablece la contraseña desde la base de datos");
		}
		console.log("=".repeat(50));
	} catch (error) {
		console.log("\n❌ Error al verificar:", error.message);
		console.log("Verifica que el hash sea válido");
	}
}

console.log("\n🚀 SOLUCIONES RÁPIDAS:\n");
console.log(
	"A. Verificar email manualmente (si el problema es email no verificado):",
);
console.log(
	'   mysql> UPDATE usuarios SET email_verificado = 1 WHERE email = "tu-email";',
);
console.log("\nB. Activar usuario:");
console.log(
	'   mysql> UPDATE usuarios SET activo = 1 WHERE email = "tu-email";',
);
console.log("\nC. Activar empresa:");
console.log("   mysql> UPDATE empresas SET activo = 1 WHERE id_empresa = 1;\n");

diagnosticar();
