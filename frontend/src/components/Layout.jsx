import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "../styles/Layout.css";

function Layout() {
	const { usuario, logout, isAdmin, isSuperUser } = useAuth();
	const navigate = useNavigate();
	const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

	useEffect(() => {
		if (!isSuperUser()) {
			cargarNotificacionesNoLeidas();
			const interval = setInterval(cargarNotificacionesNoLeidas, 60000); // Actualizar cada minuto
			return () => clearInterval(interval);
		}
	}, []);

	const cargarNotificacionesNoLeidas = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				"http://localhost:3000/api/notificaciones?solo_no_leidas=true&limite=1",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			if (data.success) {
				setNotificacionesNoLeidas(data.no_leidas || 0);
			}
		} catch (error) {
			console.error("Error al cargar notificaciones:", error);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="layout">
			<aside className="sidebar">
				<div className="sidebar-header">
					<h2>SaaS Inventario</h2>
					<p className="empresa-nombre">{usuario?.empresa?.nombre}</p>
				</div>

				<nav className="sidebar-nav">
					<NavLink
						to="/admin/dashboard"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📊 Dashboard
					</NavLink>
					<NavLink
						to="/admin/productos"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📦 Productos
					</NavLink>
					<NavLink
						to="/admin/categorias"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📑 Categorías
					</NavLink>
					<NavLink
						to="/admin/notificaciones"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						🔔 Notificaciones
						{notificacionesNoLeidas > 0 && (
							<span className="notification-badge">
								{notificacionesNoLeidas}
							</span>
						)}
					</NavLink>
					<NavLink
						to="/admin/clientes"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						👤 Clientes
					</NavLink>

					{/* Módulos operativos - Solo para usuarios de empresas (NO SUPERUSER) */}
					{!isSuperUser() && (
						<>
							<NavLink
								to="/admin/mi-empresa"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								🏪 Mi Empresa
							</NavLink>
							<NavLink
								to="/admin/ventas"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								💰 Ventas
							</NavLink>
							<NavLink
								to="/admin/proveedores"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								📦 Proveedores
							</NavLink>
							<NavLink
								to="/admin/compras"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								🛒 Compras
							</NavLink>
							<NavLink
								to="/admin/reportes"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								📈 Reportes
							</NavLink>
						</>
					)}

					{isSuperUser() && (
						<NavLink
							to="/admin/empresas"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							🏢 Empresas
						</NavLink>
					)}
					{isAdmin() && (
						<NavLink
							to="/admin/usuarios"
							className={({ isActive }) => (isActive ? "active" : "")}
						>
							👥 Usuarios
						</NavLink>
					)}
				</nav>

				<div className="sidebar-footer">
					<div className="user-info">
						<p className="user-name">
							{usuario?.nombre} {usuario?.apellido}
						</p>
						<p className="user-role">
							{usuario?.rol}
							{isSuperUser() && (
								<span className="superuser-badge">⭐ SUPER</span>
							)}
						</p>
					</div>
					<button onClick={handleLogout} className="btn-logout">
						🚪 Cerrar Sesión
					</button>
				</div>
			</aside>

			<main className="main-content">
				<Outlet />
			</main>
		</div>
	);
}

export default Layout;
