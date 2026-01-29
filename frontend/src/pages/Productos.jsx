import { useState, useEffect } from "react";
import { productosService } from "../services";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Productos.css";

function Productos() {
	const { isAdmin, isSuperUser } = useAuth();
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [empresas, setEmpresas] = useState([]);
	const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [productoEdit, setProductoEdit] = useState(null);
	const [filtroCategoria, setFiltroCategoria] = useState("");
	const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
	const [previsualizacion, setPrevisualizacion] = useState(null);
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
		if (isSuperUser()) {
			cargarEmpresas();
		}
	}, []);

	useEffect(() => {
		if (isSuperUser()) {
			cargarProductos();
		}
	}, [empresaSeleccionada]);

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

	const cargarEmpresas = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:3000/api/empresas", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			if (data.success) {
				setEmpresas(data.data);
			}
		} catch (error) {
			console.error("Error al cargar empresas:", error);
		}
	};

	const cargarProductos = async () => {
		try {
			const empresa_id = isSuperUser() ? empresaSeleccionada : null;
			const response = await productosService.obtenerTodos(empresa_id);
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
			// Mostrar imagen existente
			if (producto.imagen) {
				setPrevisualizacion(`http://localhost:3000${producto.imagen}`);
			} else {
				setPrevisualizacion(null);
			}
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
			setPrevisualizacion(null);
		}
		setImagenSeleccionada(null);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setProductoEdit(null);
		setImagenSeleccionada(null);
		setPrevisualizacion(null);
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleImagenChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validar que sea imagen
			if (!file.type.startsWith("image/")) {
				alert("Por favor selecciona un archivo de imagen");
				return;
			}
			// Validar tamaño (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert("La imagen no debe superar 5MB");
				return;
			}
			setImagenSeleccionada(file);
			// Crear previsualización
			const reader = new FileReader();
			reader.onloadend = () => {
				setPrevisualizacion(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const formDataToSend = new FormData();

			// Agregar campos del formulario
			Object.keys(formData).forEach((key) => {
				if (formData[key] !== "") {
					formDataToSend.append(key, formData[key]);
				}
			});

			// Agregar imagen si se seleccionó
			if (imagenSeleccionada) {
				formDataToSend.append("imagen", imagenSeleccionada);
			}

			const token = localStorage.getItem("token");
			const url = productoEdit
				? `http://localhost:3000/api/productos/${productoEdit.id_producto}`
				: "http://localhost:3000/api/productos";

			const response = await fetch(url, {
				method: productoEdit ? "PUT" : "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formDataToSend,
			});

			const data = await response.json();

			if (data.success) {
				handleCloseModal();
				cargarProductos();
				alert("Producto guardado exitosamente");
			} else {
				alert(data.mensaje || "Error al guardar producto");
			}
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
					{isSuperUser() && (
						<select
							value={empresaSeleccionada}
							onChange={(e) => setEmpresaSeleccionada(e.target.value)}
							className="filter-select"
						>
							<option value="">Todas las empresas</option>
							{empresas.map((emp) => (
								<option key={emp.id_empresa} value={emp.id_empresa}>
									{emp.nombre}
								</option>
							))}
						</select>
					)}

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
							<th>Imagen</th>
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
									{" "}
									<td>
										{producto.imagen ? (
											<img
												src={`http://localhost:3000${producto.imagen}`}
												alt={producto.nombre}
												style={{
													width: "50px",
													height: "50px",
													objectFit: "cover",
													borderRadius: "4px",
												}}
											/>
										) : (
											<span style={{ fontSize: "30px" }}>📦</span>
										)}
									</td>{" "}
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

					<div className="form-group">
						<label>Imagen del producto</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleImagenChange}
							className="form-control"
						/>
						{previsualizacion && (
							<div style={{ marginTop: "10px" }}>
								<img
									src={previsualizacion}
									alt="Previsualización"
									style={{
										maxWidth: "200px",
										maxHeight: "200px",
										objectFit: "contain",
										border: "1px solid #ddd",
										borderRadius: "4px",
										padding: "5px",
									}}
								/>
							</div>
						)}
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
