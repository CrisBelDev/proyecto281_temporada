import api from "./api";

export const authService = {
	// Registrar empresa
	registrarEmpresa: async (data) => {
		const response = await api.post("/auth/registrar-empresa", data);
		return response.data;
	},

	// Login
	login: async (email, password) => {
		const response = await api.post("/auth/login", { email, password });
		if (response.data.success) {
			localStorage.setItem("token", response.data.data.token);
			localStorage.setItem(
				"usuario",
				JSON.stringify(response.data.data.usuario),
			);
		}
		return response.data;
	},

	// Logout
	logout: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("usuario");
	},

	// Verificar token
	verificarToken: async () => {
		const response = await api.get("/auth/verificar");
		return response.data;
	},

	// Obtener usuario actual
	getUsuarioActual: () => {
		const usuario = localStorage.getItem("usuario");
		return usuario ? JSON.parse(usuario) : null;
	},
};

export const productosService = {
	obtenerTodos: async () => {
		const response = await api.get("/productos");
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/productos/${id}`);
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/productos", data);
		return response.data;
	},

	actualizar: async (id, data) => {
		const response = await api.put(`/productos/${id}`, data);
		return response.data;
	},

	toggle: async (id) => {
		const response = await api.patch(`/productos/${id}/toggle`);
		return response.data;
	},

	obtenerStockBajo: async () => {
		const response = await api.get("/productos/stock-bajo");
		return response.data;
	},
};

export const ventasService = {
	obtenerTodas: async () => {
		const response = await api.get("/ventas");
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/ventas/${id}`);
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/ventas", data);
		return response.data;
	},

	anular: async (id) => {
		const response = await api.patch(`/ventas/${id}/anular`);
		return response.data;
	},
};

export const comprasService = {
	obtenerTodas: async () => {
		const response = await api.get("/compras");
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/compras/${id}`);
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/compras", data);
		return response.data;
	},

	anular: async (id) => {
		const response = await api.patch(`/compras/${id}/anular`);
		return response.data;
	},
};

export const usuariosService = {
	obtenerTodos: async () => {
		const response = await api.get("/usuarios");
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/usuarios", data);
		return response.data;
	},

	actualizar: async (id, data) => {
		const response = await api.put(`/usuarios/${id}`, data);
		return response.data;
	},

	toggle: async (id) => {
		const response = await api.patch(`/usuarios/${id}/toggle`);
		return response.data;
	},

	eliminar: async (id) => {
		const response = await api.delete(`/usuarios/${id}`);
		return response.data;
	},

	cambiarPassword: async (data) => {
		const response = await api.put("/usuarios/cambiar-password", data);
		return response.data;
	},
};

export const reportesService = {
	dashboard: async () => {
		const response = await api.get("/reportes/dashboard");
		return response.data;
	},

	ventas: async (params) => {
		const response = await api.get("/reportes/ventas", { params });
		return response.data;
	},

	productosMasVendidos: async (params) => {
		const response = await api.get("/reportes/productos-mas-vendidos", {
			params,
		});
		return response.data;
	},

	inventario: async () => {
		const response = await api.get("/reportes/inventario");
		return response.data;
	},
};

export const clientesService = {
	obtenerTodos: async (busqueda = "", empresa_id = "") => {
		const params = {};
		if (busqueda) params.busqueda = busqueda;
		if (empresa_id) params.empresa_id = empresa_id;
		const response = await api.get("/clientes", { params });
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/clientes/${id}`);
		return response.data;
	},

	obtenerEliminados: async () => {
		const response = await api.get("/clientes/eliminados");
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/clientes", data);
		return response.data;
	},

	actualizar: async (id, data) => {
		const response = await api.put(`/clientes/${id}`, data);
		return response.data;
	},

	toggle: async (id) => {
		const response = await api.patch(`/clientes/${id}/toggle`);
		return response.data;
	},

	eliminar: async (id) => {
		const response = await api.delete(`/clientes/${id}`);
		return response.data;
	},

	restaurar: async (id) => {
		const response = await api.patch(`/clientes/${id}/restaurar`);
		return response.data;
	},
};

export const categoriasService = {
	obtenerTodas: async () => {
		const response = await api.get("/categorias");
		return response.data;
	},

	obtenerConProductos: async () => {
		const response = await api.get("/categorias/con-productos");
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/categorias/${id}`);
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/categorias", data);
		return response.data;
	},

	actualizar: async (id, data) => {
		const response = await api.put(`/categorias/${id}`, data);
		return response.data;
	},

	eliminar: async (id) => {
		const response = await api.delete(`/categorias/${id}`);
		return response.data;
	},
};

export const notificacionesService = {
	obtenerTodas: async (soloNoLeidas = false) => {
		const response = await api.get("/notificaciones", {
			params: { solo_no_leidas: soloNoLeidas },
		});
		return response.data;
	},

	marcarComoLeida: async (id) => {
		const response = await api.patch(`/notificaciones/${id}/leida`);
		return response.data;
	},

	marcarTodasLeidas: async () => {
		const response = await api.patch("/notificaciones/todas/leidas");
		return response.data;
	},

	eliminar: async (id) => {
		const response = await api.delete(`/notificaciones/${id}`);
		return response.data;
	},

	limpiar: async (dias = 30) => {
		const response = await api.delete("/notificaciones", {
			params: { dias },
		});
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/notificaciones", data);
		return response.data;
	},
};

export const empresasService = {
	obtenerTodas: async () => {
		const response = await api.get("/empresas");
		return response.data;
	},

	obtenerPorId: async (id) => {
		const response = await api.get(`/empresas/${id}`);
		return response.data;
	},

	crear: async (data) => {
		const response = await api.post("/empresas", data);
		return response.data;
	},

	actualizar: async (id, data) => {
		const response = await api.put(`/empresas/${id}`, data);
		return response.data;
	},

	toggle: async (id) => {
		const response = await api.patch(`/empresas/${id}/toggle`);
		return response.data;
	},

	obtenerEstadisticas: async (id) => {
		const response = await api.get(`/empresas/${id}/estadisticas`);
		return response.data;
	},
};
