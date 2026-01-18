const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
	try {
		// Obtener token del header
		const authHeader = req.headers["authorization"];

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				mensaje: "Token no proporcionado",
			});
		}

		// El formato esperado es: "Bearer TOKEN"
		const token = authHeader.startsWith("Bearer ")
			? authHeader.substring(7)
			: authHeader;

		if (!token) {
			return res.status(401).json({
				success: false,
				mensaje: "Token no válido",
			});
		}

		// Verificar token
		jwt.verify(token, jwtConfig.secret, (err, decoded) => {
			if (err) {
				return res.status(401).json({
					success: false,
					mensaje: "Token inválido o expirado",
				});
			}

			// Guardar información del usuario en el request
			req.usuario = {
				id_usuario: decoded.id_usuario,
				id_empresa: decoded.id_empresa,
				id_rol: decoded.id_rol,
				nombre_rol: decoded.nombre_rol,
				email: decoded.email,
			};

			next();
		});
	} catch (error) {
		console.error("Error en middleware de autenticación:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al verificar token",
			error: error.message,
		});
	}
};

module.exports = verificarToken;
