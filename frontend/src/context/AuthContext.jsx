import { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth debe usarse dentro de AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [usuario, setUsuario] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		verificarAutenticacion();
	}, []);

	const verificarAutenticacion = async () => {
		try {
			const token = localStorage.getItem("token");
			if (token) {
				const data = await authService.verificarToken();
				if (data.success) {
					setUsuario(data.data.usuario);
				} else {
					logout();
				}
			}
		} catch (error) {
			console.error("Error al verificar autenticación:", error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		const data = await authService.login(email, password);
		if (data.success) {
			setUsuario(data.data.usuario);
		}
		return data;
	};

	const logout = () => {
		authService.logout();
		setUsuario(null);
	};

	const isAdmin = () => {
		return usuario?.rol === "ADMIN" || usuario?.rol === "SUPERUSER";
	};

	const isSuperUser = () => {
		return usuario?.rol === "SUPERUSER";
	};

	const value = {
		usuario,
		loading,
		login,
		logout,
		isAdmin,
		isSuperUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
