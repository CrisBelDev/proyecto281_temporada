import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Layout.css";

function Layout() {
	const { usuario, logout, isAdmin } = useAuth();
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
						to="/dashboard"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📊 Dashboard
					</NavLink>
					<NavLink
						to="/productos"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📦 Productos
					</NavLink>
					<NavLink
						to="/ventas"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						💰 Ventas
					</NavLink>
					<NavLink
						to="/compras"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						🛒 Compras
					</NavLink>
					<NavLink
						to="/reportes"
						className={({ isActive }) => (isActive ? "active" : "")}
					>
						📈 Reportes
					</NavLink>
					{isAdmin() && (
						<NavLink
							to="/usuarios"
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
						<p className="user-role">{usuario?.rol}</p>
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
