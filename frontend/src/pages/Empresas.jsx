import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import axios from "axios";
import "../styles/Empresas.css";

function Empresas() {
	const { isSuperUser } = useAuth();
	const [empresas, setEmpresas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modo, setModo] = useState("crear");
	const [empresaEditando, setEmpresaEditando] = useState(null);
	const [formData, setFormData] = useState({
		nombre: "",
		nit: "",
		telefono: "",
		direccion: "",
		email: "",
		logo: "",
	});

	useEffect(() => {
		if (isSuperUser()) {
			cargarEmpresas();
		}
	}, []);

	const cargarEmpresas = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get("/api/empresas", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				setEmpresas(response.data.data);
			}
		} catch (error) {
			console.error("Error al cargar empresas:", error);
			alert("Error al cargar empresas");
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (empresa = null) => {
		if (empresa) {
			setModo("editar");
			setEmpresaEditando(empresa);
			setFormData({
				nombre: empresa.nombre || "",
				nit: empresa.nit || "",
				telefono: empresa.telefono || "",
				direccion: empresa.direccion || "",
				email: empresa.email || "",
				logo: empresa.logo || "",
			});
		} else {
			setModo("crear");
			setEmpresaEditando(null);
			setFormData({
				nombre: "",
				nit: "",
				telefono: "",
				direccion: "",
				email: "",
				logo: "",
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
			const token = localStorage.getItem("token");
			if (modo === "crear") {
				await axios.post("/api/empresas", formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				alert("Empresa creada exitosamente");
			} else {
				await axios.put(
					`/api/empresas/${empresaEditando.id_empresa}`,
					formData,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				alert("Empresa actualizada exitosamente");
			}
			handleCloseModal();
			cargarEmpresas();
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al procesar empresa");
		}
	};

	const handleToggle = async (id) => {
		if (
			window.confirm(
				"¿Desea cambiar el estado de la empresa? Esto afectará a todos sus usuarios.",
			)
		) {
			try {
				const token = localStorage.getItem("token");
				await axios.patch(
					`/api/empresas/${id}/toggle`,
					{},
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				cargarEmpresas();
				alert("Estado de empresa actualizado");
			} catch (error) {
				alert("Error al cambiar estado de empresa");
			}
		}
	};

	const verEstadisticas = async (id) => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`/api/empresas/${id}/estadisticas`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				const stats = response.data.data.estadisticas;
				alert(
					`Estadísticas de ${response.data.data.empresa.nombre}:\n\n` +
						`Usuarios: ${stats.usuarios.total} (${stats.usuarios.activos} activos)\n` +
						`Productos: ${stats.totalProductos}\n` +
						`Clientes: ${stats.totalClientes}\n` +
						`Ventas: ${stats.totalVentas}`,
				);
			}
		} catch (error) {
			alert("Error al obtener estadísticas");
		}
	};

	if (!isSuperUser()) {
		return (
			<div className="no-autorizado">
				<h2>No tienes permisos para ver esta página</h2>
				<p>Solo usuarios SUPERUSER pueden gestionar empresas</p>
			</div>
		);
	}

	if (loading) {
		return <div className="loading">Cargando empresas...</div>;
	}

	return (
		<div className="empresas-page">
			<div className="page-header">
				<h1>Gestión de Empresas</h1>
				<button
					onClick={() => handleOpenModal(null)}
					className="btn btn-primary"
				>
					+ Nueva Empresa
				</button>
			</div>

			<div className="empresas-grid">
				{empresas.map((empresa) => (
					<div
						key={empresa.id_empresa}
						className={`empresa-card ${!empresa.activo ? "inactiva" : ""}`}
					>
						<div className="empresa-header">
							<h3>{empresa.nombre}</h3>
							<span
								className={`badge ${empresa.activo ? "badge-success" : "badge-danger"}`}
							>
								{empresa.activo ? "Activa" : "Inactiva"}
							</span>
						</div>

						<div className="empresa-info">
							<p>
								<strong>NIT:</strong> {empresa.nit || "N/A"}
							</p>
							<p>
								<strong>Email:</strong> {empresa.email || "N/A"}
							</p>
							<p>
								<strong>Teléfono:</strong> {empresa.telefono || "N/A"}
							</p>
							<p>
								<strong>Dirección:</strong> {empresa.direccion || "N/A"}
							</p>
						</div>

						{empresa.estadisticas && (
							<div className="empresa-stats">
								<div className="stat-item">
									<span className="stat-value">
										{empresa.estadisticas.totalUsuarios}
									</span>
									<span className="stat-label">Usuarios</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{empresa.estadisticas.totalProductos}
									</span>
									<span className="stat-label">Productos</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{empresa.estadisticas.totalClientes}
									</span>
									<span className="stat-label">Clientes</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{empresa.estadisticas.totalVentas}
									</span>
									<span className="stat-label">Ventas</span>
								</div>
							</div>
						)}

						<div className="empresa-actions">
							<button
								onClick={() => verEstadisticas(empresa.id_empresa)}
								className="btn btn-sm btn-info"
								title="Ver estadísticas"
							>
								📊 Estadísticas
							</button>
							<button
								onClick={() => handleToggle(empresa.id_empresa)}
								className="btn btn-sm btn-warning"
								title="Cambiar estado"
							>
								{empresa.activo ? "🔒 Desactivar" : "🔓 Activar"}
							</button>
							<button
								onClick={() => handleOpenModal(empresa)}
								className="btn btn-sm btn-secondary"
								title="Editar empresa"
							>
								✏️ Editar
							</button>
						</div>
					</div>
				))}
			</div>

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title={modo === "crear" ? "Nueva Empresa" : "Editar Empresa"}
			>
				<form onSubmit={handleSubmit} className="form">
					<div className="form-group">
						<label>Nombre de la Empresa *</label>
						<input
							type="text"
							name="nombre"
							value={formData.nombre}
							onChange={handleChange}
							required
							placeholder="Ej: Mi Empresa SRL"
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
								placeholder="Número de identificación tributaria"
							/>
						</div>
						<div className="form-group">
							<label>Teléfono</label>
							<input
								type="tel"
								name="telefono"
								value={formData.telefono}
								onChange={handleChange}
								placeholder="+591 12345678"
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
							placeholder="contacto@empresa.com"
						/>
					</div>

					<div className="form-group">
						<label>Dirección</label>
						<textarea
							name="direccion"
							value={formData.direccion}
							onChange={handleChange}
							rows="2"
							placeholder="Dirección completa de la empresa"
						/>
					</div>

					<div className="form-group">
						<label>Logo (URL)</label>
						<input
							type="url"
							name="logo"
							value={formData.logo}
							onChange={handleChange}
							placeholder="https://ejemplo.com/logo.png"
						/>
						<small className="form-hint">URL de la imagen del logo</small>
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
							{modo === "crear" ? "Crear Empresa" : "Actualizar Empresa"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Empresas;
