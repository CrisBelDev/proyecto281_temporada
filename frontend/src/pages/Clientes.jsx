import { useState, useEffect } from "react";
import { clientesService, empresasService } from "../services";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Clientes.css";

function Clientes() {
	const { isSuperUser } = useAuth();
	const [clientes, setClientes] = useState([]);
	const [empresas, setEmpresas] = useState([]);
	const [clientesEliminados, setClientesEliminados] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modo, setModo] = useState("crear"); // 'crear' o 'editar'
	const [clienteEditando, setClienteEditando] = useState(null);
	const [busqueda, setBusqueda] = useState("");
	const [empresaFiltro, setEmpresaFiltro] = useState("");
	const [vistaActual, setVistaActual] = useState("activos"); // 'activos' o 'eliminados'
	const [formData, setFormData] = useState({
		nombre: "",
		nit: "",
		telefono: "",
		email: "",
		direccion: "",
	});

	useEffect(() => {
		cargarClientes();
		if (isSuperUser()) {
			cargarEmpresas();
		}
	}, []);

	const cargarEmpresas = async () => {
		try {
			const response = await empresasService.obtenerTodas();
			if (response.success) {
				setEmpresas(response.data);
			}
		} catch (error) {
			console.error("Error al cargar empresas:", error);
		}
	};

	const cargarClientes = async (termino = "", empresa = "") => {
		try {
			setLoading(true);
			const response = await clientesService.obtenerTodos(termino, empresa);
			if (response.success) {
				setClientes(response.data);
			}
		} catch (error) {
			console.error("Error al cargar clientes:", error);
		} finally {
			setLoading(false);
		}
	};

	const cargarEliminados = async () => {
		try {
			setLoading(true);
			const response = await clientesService.obtenerEliminados();
			if (response.success) {
				setClientesEliminados(response.data);
			}
		} catch (error) {
			console.error("Error al cargar eliminados:", error);
		} finally {
			setLoading(false);
		}
	};

	const cambiarVista = (vista) => {
		setVistaActual(vista);
		if (vista === "eliminados") {
			cargarEliminados();
		} else {
			cargarClientes(busqueda);
		}
	};

	const handleBusqueda = (e) => {
		const termino = e.target.value;
		setBusqueda(termino);
		cargarClientes(termino, empresaFiltro);
	};

	const handleFiltroEmpresa = (e) => {
		const empresa = e.target.value;
		setEmpresaFiltro(empresa);
		cargarClientes(busqueda, empresa);
	};

	const handleOpenModal = (cliente = null) => {
		if (cliente) {
			setModo("editar");
			setClienteEditando(cliente);
			setFormData({
				nombre: cliente.nombre || "",
				nit: cliente.nit || "",
				telefono: cliente.telefono || "",
				email: cliente.email || "",
				direccion: cliente.direccion || "",
			});
		} else {
			setModo("crear");
			setClienteEditando(null);
			setFormData({
				nombre: "",
				nit: "",
				telefono: "",
				email: "",
				direccion: "",
			});
		}
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (modo === "crear") {
				await clientesService.crear(formData);
				alert("Cliente creado exitosamente");
			} else {
				await clientesService.actualizar(clienteEditando.id_cliente, formData);
				alert("Cliente actualizado exitosamente");
			}
			handleCloseModal();
			cargarClientes(busqueda);
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al procesar cliente");
		}
	};

	const handleToggle = async (id) => {
		if (window.confirm("¿Desea cambiar el estado del cliente?")) {
			try {
				await clientesService.toggle(id);
				cargarClientes(busqueda);
			} catch (error) {
				alert("Error al cambiar estado");
			}
		}
	};

	const handleDelete = async (id) => {
		if (
			window.confirm(
				"¿Está seguro de que desea eliminar este cliente? Podrá recuperarlo desde la papelera.",
			)
		) {
			try {
				await clientesService.eliminar(id);
				cargarClientes(busqueda);
				alert("Cliente eliminado exitosamente (soft delete)");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al eliminar cliente");
			}
		}
	};

	const handleRestaurar = async (id) => {
		if (window.confirm("¿Desea restaurar este cliente?")) {
			try {
				await clientesService.restaurar(id);
				cargarEliminados();
				alert("Cliente restaurado exitosamente");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al restaurar cliente");
			}
		}
	};

	if (loading && clientes.length === 0 && clientesEliminados.length === 0) {
		return <div className="loading">Cargando clientes...</div>;
	}

	const clientesAMostrar =
		vistaActual === "activos" ? clientes : clientesEliminados;

	return (
		<div className="clientes-page">
			<div className="page-header">
				<h1>Clientes</h1>
				<button
					onClick={() => handleOpenModal(null)}
					className="btn btn-primary"
				>
					+ Nuevo Cliente
				</button>
			</div>

			{/* TEMPORAL: Ocultar pestaña de eliminados hasta ejecutar migración */}
			{/* 
			<div className="tabs-container">
				<button
					className={`tab-btn ${vistaActual === "activos" ? "active" : ""}`}
					onClick={() => cambiarVista("activos")}
				>
					📋 Activos ({clientes.length})
				</button>
				<button
					className={`tab-btn ${vistaActual === "eliminados" ? "active" : ""}`}
					onClick={() => cambiarVista("eliminados")}
				>
					🗑️ Eliminados ({clientesEliminados.length})
				</button>
			</div>
			*/}

			{vistaActual === "activos" && (
				<>
					{isSuperUser() && empresas.length > 0 && (
						<div className="filter-bar">
							<label
								htmlFor="empresa-filter"
								style={{ marginRight: "10px", fontWeight: "bold" }}
							>
								Filtrar por Empresa:
							</label>
							<select
								id="empresa-filter"
								value={empresaFiltro}
								onChange={handleFiltroEmpresa}
								className="select-input"
								style={{
									padding: "8px 12px",
									borderRadius: "4px",
									border: "1px solid #ddd",
									fontSize: "14px",
									minWidth: "250px",
									marginBottom: "15px",
								}}
							>
								<option value="">🏢 Todas las Empresas</option>
								{empresas.map((empresa) => (
									<option key={empresa.id_empresa} value={empresa.id_empresa}>
										{empresa.nombre} ({empresa.nit})
									</option>
								))}
							</select>
						</div>
					)}
					<div className="search-bar">
						<input
							type="text"
							placeholder="Buscar por nombre, NIT, email o teléfono..."
							value={busqueda}
							onChange={handleBusqueda}
							className="search-input"
						/>
					</div>
				</>
			)}

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							{isSuperUser() && <th>Empresa</th>}
							<th>Nombre</th>
							<th>NIT</th>
							<th>Teléfono</th>
							<th>Email</th>
							<th>Dirección</th>
							{vistaActual === "activos" && <th>Estado</th>}
							{vistaActual === "eliminados" && <th>Fecha Eliminación</th>}
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{clientesAMostrar.length === 0 ? (
							<tr>
								<td
									colSpan={isSuperUser() ? "9" : "8"}
									style={{ textAlign: "center" }}
								>
									{vistaActual === "activos"
										? "No se encontraron clientes"
										: "No hay clientes eliminados"}
								</td>
							</tr>
						) : (
							clientesAMostrar.map((cliente) => (
								<tr key={cliente.id_cliente}>
									{isSuperUser() && (
										<td>
											<strong>{cliente.empresa?.nombre || "N/A"}</strong>
											<br />
											<small style={{ color: "#666" }}>
												NIT: {cliente.empresa?.nit || "-"}
											</small>
										</td>
									)}
									<td>{cliente.nombre}</td>
									<td>{cliente.nit || "-"}</td>
									<td>{cliente.telefono || "-"}</td>
									<td>{cliente.email || "-"}</td>
									<td>{cliente.direccion || "-"}</td>
									{vistaActual === "activos" ? (
										<td>
											<span
												className={`badge ${cliente.activo ? "badge-success" : "badge-danger"}`}
											>
												{cliente.activo ? "Activo" : "Inactivo"}
											</span>
										</td>
									) : (
										<td>
											{new Date(cliente.fecha_eliminacion).toLocaleDateString()}
										</td>
									)}
									<td>
										{vistaActual === "activos" ? (
											<>
												<button
													onClick={() => handleToggle(cliente.id_cliente)}
													className="btn-icon"
													title="Cambiar estado"
												>
													{cliente.activo ? "🔒" : "🔓"}
												</button>
												<button
													onClick={() => handleOpenModal(cliente)}
													className="btn-icon"
													title="Editar cliente"
												>
													✏️
												</button>
												<button
													onClick={() => handleDelete(cliente.id_cliente)}
													className="btn-icon btn-danger"
													title="Eliminar cliente"
												>
													🗑️
												</button>
											</>
										) : (
											<button
												onClick={() => handleRestaurar(cliente.id_cliente)}
												className="btn-icon btn-success"
												title="Restaurar cliente"
											>
												♻️ Restaurar
											</button>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title={modo === "crear" ? "Nuevo Cliente" : "Editar Cliente"}
			>
				<form onSubmit={handleSubmit} className="form">
					<div className="form-group">
						<label>Nombre *</label>
						<input
							type="text"
							name="nombre"
							value={formData.nombre}
							onChange={handleChange}
							required
							placeholder="Nombre del cliente"
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>NIT</label>
							<input
								type="text"
								name="nit"
								value={formData.nit}
								onChange={handleChange}
								placeholder="NIT del cliente"
							/>
						</div>
						<div className="form-group">
							<label>Teléfono</label>
							<input
								type="tel"
								name="telefono"
								value={formData.telefono}
								onChange={handleChange}
								placeholder="Teléfono"
							/>
						</div>
					</div>

					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="email@ejemplo.com"
						/>
					</div>

					<div className="form-group">
						<label>Dirección</label>
						<textarea
							name="direccion"
							value={formData.direccion}
							onChange={handleChange}
							placeholder="Dirección completa del cliente"
							rows="3"
						/>
					</div>

					<div className="form-actions">
						<button
							type="button"
							onClick={handleCloseModal}
							className="btn btn-secondary"
						>
							Cancelar
						</button>
						<button type="submit" className="btn btn-primary">
							{modo === "crear" ? "Crear Cliente" : "Actualizar Cliente"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Clientes;
