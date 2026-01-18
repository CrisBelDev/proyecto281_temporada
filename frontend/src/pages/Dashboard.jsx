import { useState, useEffect } from "react";
import { reportesService } from "../services";
import "../styles/Dashboard.css";

function Dashboard() {
	const [datos, setDatos] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			const response = await reportesService.dashboard();
			if (response.success) {
				setDatos(response.data);
			}
		} catch (error) {
			console.error("Error al cargar dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className="loading">Cargando dashboard...</div>;
	}

	return (
		<div className="dashboard">
			<h1>Dashboard</h1>

			<div className="dashboard-cards">
				<div className="dashboard-card">
					<div className="card-icon">💰</div>
					<div className="card-info">
						<h3>Ventas Hoy</h3>
						<p className="card-value">
							Bs. {datos?.ventas_hoy?.total?.toFixed(2) || "0.00"}
						</p>
						<p className="card-subtitle">
							{datos?.ventas_hoy?.cantidad || 0} ventas
						</p>
					</div>
				</div>

				<div className="dashboard-card">
					<div className="card-icon">📦</div>
					<div className="card-info">
						<h3>Total Productos</h3>
						<p className="card-value">{datos?.total_productos || 0}</p>
						<p className="card-subtitle">productos activos</p>
					</div>
				</div>

				<div className="dashboard-card">
					<div className="card-icon">⚠️</div>
					<div className="card-info">
						<h3>Stock Bajo</h3>
						<p className="card-value">{datos?.productos_stock_bajo || 0}</p>
						<p className="card-subtitle">productos con stock mínimo</p>
					</div>
				</div>

				<div className="dashboard-card">
					<div className="card-icon">📊</div>
					<div className="card-info">
						<h3>Valor Inventario</h3>
						<p className="card-value">
							Bs. {datos?.valor_inventario?.toFixed(2) || "0.00"}
						</p>
						<p className="card-subtitle">valor total en stock</p>
					</div>
				</div>
			</div>

			<div className="dashboard-info">
				<p>Bienvenido al sistema de gestión de inventarios y ventas</p>
			</div>
		</div>
	);
}

export default Dashboard;
