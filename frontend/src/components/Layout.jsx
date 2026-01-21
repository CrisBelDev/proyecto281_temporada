import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Layout.css";

function Layout() {
	const { usuario, logout, isAdmin, isSuperUser } = useAuth();
	const navigate = useNavigate();

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
					</NavLink>
					<NavLink
						to="/admin/clientes"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						👤 Clientes
					</NavLink>
					<NavLink
						to="/admin/ventas"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						💰 Ventas
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
