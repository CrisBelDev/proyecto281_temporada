import { useState } from "react";
import "../styles/Reportes.css";

function Reportes() {
	const [activeTab, setActiveTab] = useState("resumen");

	return (
		<div className="reportes-page">
			<h1>Reportes</h1>

			<div className="tabs">
				<button
					className={activeTab === "resumen" ? "tab active" : "tab"}
					onClick={() => setActiveTab("resumen")}
				>
					Resumen
				</button>
				<button
					className={activeTab === "ventas" ? "tab active" : "tab"}
					onClick={() => setActiveTab("ventas")}
				>
					Ventas
				</button>
				<button
					className={activeTab === "inventario" ? "tab active" : "tab"}
					onClick={() => setActiveTab("inventario")}
				>
					Inventario
				</button>
			</div>

			<div className="tab-content">
				{activeTab === "resumen" && (
					<div className="reporte-section">
						<h2>Resumen General</h2>
						<p>Información resumida del sistema</p>
						<div className="info-message">
							Los reportes detallados estarán disponibles próximamente
						</div>
					</div>
				)}

				{activeTab === "ventas" && (
					<div className="reporte-section">
						<h2>Reporte de Ventas</h2>
						<div className="filtros">
							<div className="form-group">
								<label>Fecha Inicio</label>
								<input type="date" />
							</div>
							<div className="form-group">
								<label>Fecha Fin</label>
								<input type="date" />
							</div>
							<button className="btn btn-primary">Generar Reporte</button>
						</div>
						<div className="info-message">
							Seleccione un rango de fechas para generar el reporte
						</div>
					</div>
				)}

				{activeTab === "inventario" && (
					<div className="reporte-section">
						<h2>Reporte de Inventario</h2>
						<div className="info-message">
							El reporte de inventario muestra el valor actual de todos los
							productos en stock
						</div>
						<button className="btn btn-primary">Generar Reporte</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default Reportes;
