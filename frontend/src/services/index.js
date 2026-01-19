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
	obtenerTodos: async (busqueda = "") => {
		const response = await api.get("/clientes", {
			params: { busqueda },
		});
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
