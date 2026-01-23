/**
 * Middleware para manejar la selección de empresa para SUPERUSER
 *
 * El SUPERUSER puede especificar con qué empresa quiere trabajar mediante:
 * - Query parameter: ?empresa_id=123
 * - Header: X-Empresa-Id: 123
 * - Body: empresa_id: 123
 *
 * Para otros roles, siempre se usa su empresa asignada.
 */

const obtenerEmpresaActiva = (req, res, next) => {
	try {
		const { id_empresa, nombre_rol } = req.usuario;
		const isSuperUser = nombre_rol === "SUPERUSER";

		if (isSuperUser) {
			// SUPERUSER puede especificar la empresa con la que quiere trabajar
			const empresaSeleccionada =
				req.query.empresa_id || // Query parameter
				req.headers["x-empresa-id"] || // Header custom
				req.body?.empresa_id || // Body
				null;

			if (empresaSeleccionada) {
				// SUPERUSER especificó una empresa
				req.empresaActiva = parseInt(empresaSeleccionada);
			} else {
				// SUPERUSER no especificó empresa (puede listar todas)
				req.empresaActiva = null;
			}

			req.isSuperUser = true;
		} else {
			// Usuario normal: siempre usa su empresa asignada
			if (!id_empresa) {
				return res.status(400).json({
					success: false,
					mensaje: "Usuario sin empresa asignada",
				});
			}
			req.empresaActiva = id_empresa;
			req.isSuperUser = false;
		}

		next();
	} catch (error) {
		console.error("Error en middleware de empresa:", error);
		return res.status(500).json({
			success: false,
			mensaje: "Error al procesar la empresa activa",
			error: error.message,
		});
	}
};

/**
 * Middleware para requerir que se especifique una empresa
 * Útil para operaciones que DEBEN tener un contexto de empresa
 */
const requerirEmpresa = (req, res, next) => {
	if (req.isSuperUser && !req.empresaActiva) {
		return res.status(400).json({
			success: false,
			mensaje:
				"SUPERUSER debe especificar la empresa (empresa_id en query, header o body)",
		});
	}
	next();
};

/**
 * Construye una cláusula WHERE que respeta el multi-tenant
 * @param {Object} baseWhere - Condiciones base del WHERE
 * @param {Object} req - Request object con empresaActiva e isSuperUser
 * @returns {Object} - WHERE clause actualizado
 */
const construirWhereMultitenant = (baseWhere, req) => {
	const whereClause = { ...baseWhere };

	if (req.isSuperUser) {
		// SUPERUSER: filtrar por empresa solo si especificó una
		if (req.empresaActiva) {
			whereClause.id_empresa = req.empresaActiva;
		}
		// Si no especificó empresa, no filtra (ve todas)
	} else {
		// Usuario normal: siempre filtrar por su empresa
		whereClause.id_empresa = req.empresaActiva;
	}

	return whereClause;
};

module.exports = {
	obtenerEmpresaActiva,
	requerirEmpresa,
	construirWhereMultitenant,
};
