import { useState, useEffect } from "react";
import { usuariosService } from "../services";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Usuarios.css";

function Usuarios() {
	const { isAdmin } = useAuth();
	const [usuarios, setUsuarios] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		nombre: "",
		apellido: "",
		email: "",
		password: "",
		telefono: "",
		id_rol: "2",
	});

	useEffect(() => {
		if (isAdmin()) {
			cargarUsuarios();
		}
	}, []);

	const cargarUsuarios = async () => {
		try {
			const response = await usuariosService.obtenerTodos();
			if (response.success) {
				setUsuarios(response.data);
			}
		} catch (error) {
			console.error("Error al cargar usuarios:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = () => {
		setFormData({
			nombre: "",
			apellido: "",
			email: "",
			password: "",
			telefono: "",
			id_rol: "2",
		});
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
			await usuariosService.crear(formData);
			handleCloseModal();
			cargarUsuarios();
			alert("Usuario creado exitosamente");
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al crear usuario");
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
				<h1>Usuarios</h1>
				<button onClick={handleOpenModal} className="btn btn-primary">
					+ Nuevo Usuario
				</button>
			</div>

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Email</th>
							<th>Teléfono</th>
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
								<td>{usuario.rol?.nombre}</td>
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
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title="Nuevo Usuario"
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
						<label>Contraseña *</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
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

					<div className="form-group">
						<label>Rol *</label>
						<select
							name="id_rol"
							value={formData.id_rol}
							onChange={handleChange}
							required
						>
							<option value="1">ADMIN</option>
							<option value="2">VENDEDOR</option>
						</select>
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
							Crear Usuario
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Usuarios;
