// Middleware para verificar roles
const verificarRol = (...rolesPermitidos) => {
	return (req, res, next) => {
		try {
			const { nombre_rol } = req.usuario;

			if (!nombre_rol) {
				return res.status(403).json({
					success: false,
					mensaje: "Rol no identificado",
				});
			}

			// SUPERUSER tiene acceso a todo
			if (nombre_rol === "SUPERUSER") {
				return next();
			}

			// Verificar si el rol del usuario está en los roles permitidos
			if (!rolesPermitidos.includes(nombre_rol)) {
				return res.status(403).json({
					success: false,
					mensaje: "No tiene permisos para realizar esta acción",
				});
			}

			next();
		} catch (error) {
			console.error("Error en middleware de roles:", error);
			return res.status(500).json({
				success: false,
				mensaje: "Error al verificar permisos",
				error: error.message,
			});
		}
	};
};

module.exports = verificarRol;
