import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Categorias.css";

function Categorias() {
	const { isAdmin } = useAuth();
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [categoriaEdit, setCategoriaEdit] = useState(null);
	const [formData, setFormData] = useState({
		nombre: "",
		descripcion: "",
	});

	useEffect(() => {
		cargarCategorias();
	}, []);

	const cargarCategorias = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				"http://localhost:3000/api/categorias/con-productos",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			if (data.success) {
				setCategorias(data.data);
			}
		} catch (error) {
			console.error("Error al cargar categorías:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (categoria = null) => {
		if (categoria) {
			setCategoriaEdit(categoria);
			setFormData({
				nombre: categoria.nombre,
				descripcion: categoria.descripcion || "",
			});
		} else {
			setCategoriaEdit(null);
			setFormData({
				nombre: "",
				descripcion: "",
			});
		}
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setCategoriaEdit(null);
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
			const url = categoriaEdit
				? `http://localhost:3000/api/categorias/${categoriaEdit.id_categoria}`
				: "http://localhost:3000/api/categorias";

			const response = await fetch(url, {
				method: categoriaEdit ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (data.success) {
				alert(data.mensaje);
				handleCloseModal();
				cargarCategorias();
			} else {
				alert(data.mensaje || "Error al guardar categoría");
			}
		} catch (error) {
			alert("Error al guardar categoría");
		}
	};

	const handleEliminar = async (id) => {
		if (window.confirm("¿Está seguro de eliminar esta categoría?")) {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					`http://localhost:3000/api/categorias/${id}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const data = await response.json();

				if (data.success) {
					alert(data.mensaje);
					cargarCategorias();
				} else {
					alert(data.mensaje || "Error al eliminar categoría");
				}
			} catch (error) {
				alert("Error al eliminar categoría");
			}
		}
	};

	if (loading) {
		return <div className="loading">Cargando categorías...</div>;
	}

	return (
		<div className="categorias-page">
			<div className="page-header">
				<h1>Categorías</h1>
				{isAdmin() && (
					<button onClick={() => handleOpenModal()} className="btn btn-primary">
						+ Nueva Categoría
					</button>
				)}
			</div>

			<div className="categorias-grid">
				{categorias.map((categoria) => (
					<div key={categoria.id_categoria} className="categoria-card">
						<div className="categoria-header">
							<h3>{categoria.nombre}</h3>
							{isAdmin() && (
								<div className="categoria-actions">
									<button
										onClick={() => handleOpenModal(categoria)}
										className="btn-icon"
										title="Editar"
									>
										✏️
									</button>
									<button
										onClick={() => handleEliminar(categoria.id_categoria)}
										className="btn-icon btn-danger"
										title="Eliminar"
									>
										🗑️
									</button>
								</div>
							)}
						</div>
						<p className="categoria-descripcion">
							{categoria.descripcion || "Sin descripción"}
						</p>
						<div className="categoria-stats">
							<span className="stat-badge">
								{categoria.cantidad_productos || 0} producto
								{categoria.cantidad_productos !== 1 ? "s" : ""}
							</span>
						</div>
					</div>
				))}
			</div>

			{categorias.length === 0 && (
				<div className="empty-state">
					<p>No hay categorías registradas</p>
					{isAdmin() && (
						<button
							onClick={() => handleOpenModal()}
							className="btn btn-primary"
						>
							Crear primera categoría
						</button>
					)}
				</div>
			)}

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title={categoriaEdit ? "Editar Categoría" : "Nueva Categoría"}
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
							placeholder="Ej: Electrónicos, Ropa, Alimentos..."
						/>
					</div>
					<div className="form-group">
						<label>Descripción</label>
						<textarea
							name="descripcion"
							value={formData.descripcion}
							onChange={handleChange}
							rows="3"
							placeholder="Descripción de la categoría (opcional)"
						/>
					</div>
					<div className="form-actions">
						<button type="button" onClick={handleCloseModal} className="btn">
							Cancelar
						</button>
						<button type="submit" className="btn btn-primary">
							{categoriaEdit ? "Actualizar" : "Crear"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Categorias;
