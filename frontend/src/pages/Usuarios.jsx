import { useState, useEffect } from "react";
import { usuariosService } from "../services";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import axios from "axios";
import "../styles/Usuarios.css";

function Usuarios() {
	const { isAdmin, isSuperUser } = useAuth();
	const [usuarios, setUsuarios] = useState([]);
	const [empresas, setEmpresas] = useState([]);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modo, setModo] = useState("crear"); // 'crear' o 'editar'
	const [usuarioEditando, setUsuarioEditando] = useState(null);
	const [empresaFiltro, setEmpresaFiltro] = useState("");
	const [formData, setFormData] = useState({
		nombre: "",
		apellido: "",
		email: "",
		password: "",
		telefono: "",
		id_rol: "2",
		empresa_id: "",
	});

	useEffect(() => {
		if (isAdmin()) {
			cargarUsuarios();
			cargarRoles();
			if (isSuperUser()) {
				cargarEmpresas();
			}
		}
	}, []);

	useEffect(() => {
		if (isSuperUser() && empresaFiltro !== "") {
			cargarUsuarios();
		}
	}, [empresaFiltro]);

	const cargarUsuarios = async () => {
		try {
			let url = "/api/usuarios";
			if (isSuperUser() && empresaFiltro) {
				url += `?empresa_id=${empresaFiltro}`;
			}
			const token = localStorage.getItem("token");
			const response = await axios.get(url, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				setUsuarios(response.data.data);
			}
		} catch (error) {
			console.error("Error al cargar usuarios:", error);
		} finally {
			setLoading(false);
		}
	};

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
		}
	};

	const cargarRoles = async () => {
		try {
			// Roles base
			const rolesBase = [
				{ id_rol: 1, nombre: "SUPERUSER" },
				{ id_rol: 2, nombre: "ADMIN" },
				{ id_rol: 3, nombre: "VENDEDOR" },
			];

			// Si es SUPERUSER, puede asignar todos los roles
			// Si es ADMIN, solo puede asignar ADMIN y VENDEDOR
			if (isSuperUser()) {
				setRoles(rolesBase);
			} else {
				setRoles(rolesBase.filter((r) => r.nombre !== "SUPERUSER"));
			}
		} catch (error) {
			console.error("Error al cargar roles:", error);
		}
	};

	const handleOpenModal = (usuario = null) => {
		if (usuario) {
			setModo("editar");
			setUsuarioEditando(usuario);
			setFormData({
				nombre: usuario.nombre || "",
				apellido: usuario.apellido || "",
				email: usuario.email || "",
				password: "", // No mostrar contraseña
				telefono: usuario.telefono || "",
				id_rol: usuario.rol?.id_rol?.toString() || "2",
				empresa_id: usuario.empresa?.id_empresa?.toString() || "",
			});
		} else {
			setModo("crear");
			setUsuarioEditando(null);
			setFormData({
				nombre: "",
				apellido: "",
				email: "",
				password: "",
				telefono: "",
				id_rol: "2",
				empresa_id:
					empresas.length > 0 ? empresas[0].id_empresa.toString() : "",
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
				await usuariosService.crear(formData);
				alert("Usuario creado exitosamente");
			} else {
				const dataToUpdate = { ...formData };
				if (!dataToUpdate.password) delete dataToUpdate.password; // No enviar password vacío
				await usuariosService.actualizar(
					usuarioEditando.id_usuario,
					dataToUpdate,
				);
				alert("Usuario actualizado exitosamente");
			}
			handleCloseModal();
			cargarUsuarios();
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al procesar usuario");
		}
	};

	const handleToggle = async (id) => {
		if (window.confirm("¿Desea cambiar el estado del usuario?")) {
			try {
				await usuariosService.toggle(id);
				cargarUsuarios();
			} catch (error) {
				alert("Error al cambiar estado");
			}
		}
	};

	const handleDelete = async (id) => {
		if (
			window.confirm(
				"¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.",
			)
		) {
			try {
				await usuariosService.eliminar(id);
				cargarUsuarios();
				alert("Usuario eliminado exitosamente");
			} catch (error) {
				alert(error.response?.data?.mensaje || "Error al eliminar usuario");
			}
		}
	};

	if (!isAdmin()) {
		return (
			<div className="no-autorizado">
				<h2>No tienes permisos para ver esta página</h2>
			</div>
		);
	}

	if (loading) {
		return <div className="loading">Cargando usuarios...</div>;
	}

	return (
		<div className="usuarios-page">
			<div className="page-header">
				<h1>Gestión de Usuarios {isSuperUser() && "(Todas las Empresas)"}</h1>
				<button
					onClick={() => handleOpenModal(null)}
					className="btn btn-primary"
				>
					+ Nuevo Usuario
				</button>
			</div>

			{isSuperUser() && empresas.length > 0 && (
				<div className="filter-section">
					<label>Filtrar por Empresa:</label>
					<select
						value={empresaFiltro}
						onChange={(e) => setEmpresaFiltro(e.target.value)}
						className="form-control"
					>
						<option value="">Todas las empresas</option>
						{empresas.map((empresa) => (
							<option key={empresa.id_empresa} value={empresa.id_empresa}>
								{empresa.nombre} {empresa.nit && `(${empresa.nit})`}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Email</th>
							<th>Teléfono</th>
							{isSuperUser() && <th>Empresa</th>}
							<th>Rol</th>
							<th>Estado</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usuarios.map((usuario) => (
							<tr key={usuario.id_usuario}>
								<td>
									{usuario.nombre} {usuario.apellido}
								</td>
								<td>{usuario.email}</td>
								<td>{usuario.telefono || "-"}</td>
								{isSuperUser() && <td>{usuario.empresa?.nombre || "N/A"}</td>}
								<td>
									<span
										className={`badge badge-${usuario.rol?.nombre === "SUPERUSER" ? "warning" : usuario.rol?.nombre === "ADMIN" ? "info" : "secondary"}`}
									>
										{usuario.rol?.nombre}
									</span>
								</td>
								<td>
									<span
										className={`badge ${usuario.activo ? "badge-success" : "badge-danger"}`}
									>
										{usuario.activo ? "Activo" : "Inactivo"}
									</span>
								</td>
								<td>
									<button
										onClick={() => handleToggle(usuario.id_usuario)}
										className="btn-icon"
										title="Cambiar estado"
									>
										{usuario.activo ? "🔒" : "🔓"}
									</button>
									<button
										onClick={() => handleOpenModal(usuario)}
										className="btn-icon"
										title="Editar usuario"
									>
										✏️
									</button>
									<button
										onClick={() => handleDelete(usuario.id_usuario)}
										className="btn-icon btn-danger"
										title="Eliminar usuario"
									>
										🗑️
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title={modo === "crear" ? "Nuevo Usuario" : "Editar Usuario"}
			>
				<form onSubmit={handleSubmit} className="form">
					<div className="form-row">
						<div className="form-group">
							<label>Nombre *</label>
							<input
								type="text"
								name="nombre"
								value={formData.nombre}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="form-group">
							<label>Apellido</label>
							<input
								type="text"
								name="apellido"
								value={formData.apellido}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="form-group">
						<label>Email *</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>
							Contraseña{" "}
							{modo === "crear" ? "*" : "(dejar vacío para mantener)"}
						</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required={modo === "crear"}
							minLength="6"
						/>
					</div>

					<div className="form-group">
						<label>Teléfono</label>
						<input
							type="tel"
							name="telefono"
							value={formData.telefono}
							onChange={handleChange}
						/>
					</div>

					{isSuperUser() && empresas.length > 0 && modo === "crear" && (
						<div className="form-group">
							<label>Empresa *</label>
							<select
								name="empresa_id"
								value={formData.empresa_id}
								onChange={handleChange}
								required
							>
								<option value="">Seleccionar empresa</option>
								{empresas.map((empresa) => (
									<option key={empresa.id_empresa} value={empresa.id_empresa}>
										{empresa.nombre} {empresa.nit && `(${empresa.nit})`}
									</option>
								))}
							</select>
							<small className="form-hint">
								El usuario será creado en la empresa seleccionada
							</small>
						</div>
					)}

					{isSuperUser() && modo === "editar" && formData.empresa_id && (
						<div className="form-group">
							<label>Empresa Actual</label>
							<input
								type="text"
								value={
									usuarios.find(
										(u) => u.id_usuario === usuarioEditando?.id_usuario,
									)?.empresa?.nombre || "N/A"
								}
								disabled
								className="form-control-disabled"
							/>
							<small className="form-hint">
								La empresa no puede ser modificada después de la creación
							</small>
						</div>
					)}

					<div className="form-group">
						<label>Rol *</label>
						<select
							name="id_rol"
							value={formData.id_rol}
							onChange={handleChange}
							required
						>
							<option value="">Seleccionar rol</option>
							{roles.map((rol) => (
								<option key={rol.id_rol} value={rol.id_rol}>
									{rol.nombre}
								</option>
							))}
						</select>
						{isSuperUser() && (
							<small className="form-hint">
								⚠️ Solo SUPERUSER puede asignar el rol SUPERUSER
							</small>
						)}
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
							{modo === "crear" ? "Crear Usuario" : "Actualizar Usuario"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Usuarios;
