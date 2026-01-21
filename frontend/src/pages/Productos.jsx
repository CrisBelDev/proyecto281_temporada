import { useState, useEffect } from "react";
import { productosService } from "../services";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Productos.css";

function Productos() {
	const { isAdmin } = useAuth();
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [productoEdit, setProductoEdit] = useState(null);
	const [filtroCategoria, setFiltroCategoria] = useState("");
	const [formData, setFormData] = useState({
		codigo: "",
		nombre: "",
		descripcion: "",
		precio_compra: "",
		precio_venta: "",
		stock_actual: "",
		stock_minimo: "",
		id_categoria: "",
	});

	useEffect(() => {
		cargarProductos();
		cargarCategorias();
	}, []);

	const cargarCategorias = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:3000/api/categorias", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			if (data.success) {
				setCategorias(data.data);
			}
		} catch (error) {
			console.error("Error al cargar categorías:", error);
		}
	};

	const cargarProductos = async () => {
		try {
			const response = await productosService.obtenerTodos();
			if (response.success) {
				setProductos(response.data);
			}
		} catch (error) {
			console.error("Error al cargar productos:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (producto = null) => {
		if (producto) {
			setProductoEdit(producto);
			setFormData({
				codigo: producto.codigo,
				nombre: producto.nombre,
				descripcion: producto.descripcion || "",
				precio_compra: producto.precio_compra,
				precio_venta: producto.precio_venta,
				stock_actual: producto.stock_actual,
				stock_minimo: producto.stock_minimo,
				id_categoria: producto.id_categoria || "",
			});
		} else {
			setProductoEdit(null);
			setFormData({
				codigo: "",
				nombre: "",
				descripcion: "",
				precio_compra: "",
				precio_venta: "",
				stock_actual: "",
				stock_minimo: "",
				id_categoria: "",
			});
		}
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setProductoEdit(null);
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
			if (productoEdit) {
				await productosService.actualizar(productoEdit.id_producto, formData);
			} else {
				await productosService.crear(formData);
			}
			handleCloseModal();
			cargarProductos();
			alert("Producto guardado exitosamente");
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al guardar producto");
		}
	};

	const handleToggle = async (id) => {
		if (window.confirm("¿Desea cambiar el estado del producto?")) {
			try {
				await productosService.toggle(id);
				cargarProductos();
			} catch (error) {
				alert("Error al cambiar estado");
			}
		}
	};

	if (loading) {
		return <div className="loading">Cargando productos...</div>;
	}

	return (
		<div className="productos-page">
			<div className="page-header">
				<h1>Productos</h1>
				<div className="header-actions">
					<select
						value={filtroCategoria}
						onChange={(e) => setFiltroCategoria(e.target.value)}
						className="filter-select"
					>
						<option value="">Todas las categorías</option>
						{categorias.map((cat) => (
							<option key={cat.id_categoria} value={cat.id_categoria}>
								{cat.nombre}
							</option>
						))}
					</select>
					{isAdmin() && (
						<button
							onClick={() => handleOpenModal()}
							className="btn btn-primary"
						>
							+ Nuevo Producto
						</button>
					)}
				</div>
			</div>

			<div className="table-container">
				<table className="table">
					<thead>
						<tr>
							<th>Código</th>
							<th>Nombre</th>
							<th>Categoría</th>
							<th>Precio Compra</th>
							<th>Precio Venta</th>
							<th>Stock Actual</th>
							<th>Stock Mínimo</th>
							<th>Estado</th>
							{isAdmin() && <th>Acciones</th>}
						</tr>
					</thead>
					<tbody>
						{productos
							.filter(
								(p) =>
									!filtroCategoria ||
									p.id_categoria === parseInt(filtroCategoria),
							)
							.map((producto) => (
								<tr key={producto.id_producto}>
									<td>{producto.codigo}</td>
									<td>{producto.nombre}</td>
									<td>
										<span className="badge badge-info">
											{producto.categoria?.nombre || "Sin categoría"}
										</span>
									</td>
									<td>Bs. {parseFloat(producto.precio_compra).toFixed(2)}</td>
									<td>Bs. {parseFloat(producto.precio_venta).toFixed(2)}</td>
									<td
										className={
											producto.stock_actual <= producto.stock_minimo
												? "stock-bajo"
												: ""
										}
									>
										{producto.stock_actual}
									</td>
									<td>{producto.stock_minimo}</td>
									<td>
										<span
											className={`badge ${producto.activo ? "badge-success" : "badge-danger"}`}
										>
											{producto.activo ? "Activo" : "Inactivo"}
										</span>
									</td>
									{isAdmin() && (
										<td>
											<button
												onClick={() => handleOpenModal(producto)}
												className="btn-icon"
												title="Editar"
											>
												✏️
											</button>
											<button
												onClick={() => handleToggle(producto.id_producto)}
												className="btn-icon"
												title="Cambiar estado"
											>
												{producto.activo ? "🔒" : "🔓"}
											</button>
										</td>
									)}
								</tr>
							))}
					</tbody>
				</table>
			</div>

			<Modal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				title={productoEdit ? "Editar Producto" : "Nuevo Producto"}
			>
				<form onSubmit={handleSubmit} className="form">
					<div className="form-row">
						<div className="form-group">
							<label>Código *</label>
							<input
								type="text"
								name="codigo"
								value={formData.codigo}
								onChange={handleChange}
								required
							/>
						</div>
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
					</div>

					<div className="form-group">
						<label>Categoría</label>
						<select
							name="id_categoria"
							value={formData.id_categoria}
							onChange={handleChange}
						>
							<option value="">Sin categoría</option>
							{categorias.map((cat) => (
								<option key={cat.id_categoria} value={cat.id_categoria}>
									{cat.nombre}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label>Descripción</label>
						<textarea
							name="descripcion"
							value={formData.descripcion}
							onChange={handleChange}
							rows="3"
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Precio Compra</label>
							<input
								type="number"
								name="precio_compra"
								value={formData.precio_compra}
								onChange={handleChange}
								step="0.01"
								min="0"
							/>
						</div>
						<div className="form-group">
							<label>Precio Venta *</label>
							<input
								type="number"
								name="precio_venta"
								value={formData.precio_venta}
								onChange={handleChange}
								step="0.01"
								min="0"
								required
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Stock Actual</label>
							<input
								type="number"
								name="stock_actual"
								value={formData.stock_actual}
								onChange={handleChange}
								min="0"
							/>
						</div>
						<div className="form-group">
							<label>Stock Mínimo</label>
							<input
								type="number"
								name="stock_minimo"
								value={formData.stock_minimo}
								onChange={handleChange}
								min="0"
							/>
						</div>
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
							Guardar
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default Productos;
