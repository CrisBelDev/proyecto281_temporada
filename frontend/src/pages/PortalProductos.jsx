import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/PortalProductos.css";

function PortalProductos() {
	const { empresaSlug } = useParams();
	const [empresa, setEmpresa] = useState(null);
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
	const [busqueda, setBusqueda] = useState("");
	const [productoDetalle, setProductoDetalle] = useState(null);

	useEffect(() => {
		cargarCategorias();
		cargarProductos();
	}, [empresaSlug]);

	useEffect(() => {
		cargarProductos();
	}, [categoriaSeleccionada, busqueda]);

	const cargarCategorias = async () => {
		try {
			const response = await fetch(
				`http://localhost:3000/api/portal/${empresaSlug}/categorias`,
			);
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
			let url = `http://localhost:3000/api/portal/${empresaSlug}/productos?`;
			if (categoriaSeleccionada) url += `categoria=${categoriaSeleccionada}&`;
			if (busqueda) url += `busqueda=${encodeURIComponent(busqueda)}&`;

			const response = await fetch(url);
			const data = await response.json();
			if (data.success) {
				setEmpresa(data.empresa);
				setProductos(data.data);
			} else {
				alert(data.mensaje);
			}
		} catch (error) {
			console.error("Error al cargar productos:", error);
			alert("Error al cargar productos");
		} finally {
			setLoading(false);
		}
	};

	const verDetalle = async (id) => {
		try {
			const response = await fetch(
				`http://localhost:3000/api/portal/${empresaSlug}/productos/${id}`,
			);
			const data = await response.json();
			if (data.success) {
				setProductoDetalle(data.data);
			}
		} catch (error) {
			console.error("Error al cargar detalle:", error);
		}
	};

	if (loading) {
		return <div className="loading">Cargando portal...</div>;
	}

	if (!empresa) {
		return (
			<div className="error-page">
				<h1>Empresa no encontrada</h1>
				<p>La empresa que buscas no existe o no está activa.</p>
			</div>
		);
	}

	return (
		<div className="portal-container">
			{/* Header */}
			<header className="portal-header">
				<div className="portal-header-content">
					<h1>{empresa.nombre}</h1>
					<p>Portal de Productos</p>
				</div>
			</header>

			{/* Filtros y búsqueda */}
			<div className="portal-filters">
				<div className="search-box">
					<input
						type="text"
						placeholder="Buscar productos..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						className="search-input"
					/>
					<span className="search-icon">🔍</span>
				</div>

				<div className="categories-filter">
					<button
						className={`category-btn ${categoriaSeleccionada === "" ? "active" : ""}`}
						onClick={() => setCategoriaSeleccionada("")}
					>
						Todas
					</button>
					{categorias.map((cat) => (
						<button
							key={cat.id_categoria}
							className={`category-btn ${categoriaSeleccionada === cat.id_categoria.toString() ? "active" : ""}`}
							onClick={() =>
								setCategoriaSeleccionada(cat.id_categoria.toString())
							}
						>
							{cat.nombre}
							<span className="count">({cat.cantidad_productos || 0})</span>
						</button>
					))}
				</div>
			</div>

			{/* Grid de productos */}
			<div className="productos-grid">
				{productos.length === 0 ? (
					<div className="empty-state">
						<p>No se encontraron productos</p>
					</div>
				) : (
					productos.map((producto) => (
						<div
							key={producto.id_producto}
							className="producto-card"
							onClick={() => verDetalle(producto.id_producto)}
						>
							{producto.imagen ? (
								<img
									src={`http://localhost:3000${producto.imagen}`}
									alt={producto.nombre}
									className="producto-imagen"
								/>
							) : (
								<div className="producto-imagen-placeholder">📦</div>
							)}
							<div className="producto-info">
								<span className="producto-codigo">{producto.codigo}</span>
								<h3 className="producto-nombre">{producto.nombre}</h3>
								{producto.categoria && (
									<span className="producto-categoria">
										{producto.categoria.nombre}
									</span>
								)}
								<p className="producto-descripcion">
									{producto.descripcion?.substring(0, 100) || "Sin descripción"}
								</p>
								<div className="producto-footer">
									<span className="producto-precio">
										Bs. {parseFloat(producto.precio_venta).toFixed(2)}
									</span>
									<span className="producto-stock">
										Stock: {producto.stock_actual}
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Modal de detalle */}
			{productoDetalle && (
				<div className="modal-overlay" onClick={() => setProductoDetalle(null)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<button
							className="modal-close"
							onClick={() => setProductoDetalle(null)}
						>
							✕
						</button>

						<div className="detalle-producto">
							{productoDetalle.imagen ? (
								<img
									src={`http://localhost:3000${productoDetalle.imagen}`}
									alt={productoDetalle.nombre}
									className="detalle-imagen"
								/>
							) : (
								<div className="detalle-imagen-placeholder">📦</div>
							)}

							<div className="detalle-info">
								<span className="detalle-codigo">
									Código: {productoDetalle.codigo}
								</span>
								<h2>{productoDetalle.nombre}</h2>
								{productoDetalle.categoria && (
									<span className="detalle-categoria">
										{productoDetalle.categoria.nombre}
									</span>
								)}
								<p className="detalle-descripcion">
									{productoDetalle.descripcion || "Sin descripción disponible"}
								</p>
								<div className="detalle-precio-stock">
									<div className="precio-box">
										<span className="label">Precio</span>
										<span className="value">
											Bs. {parseFloat(productoDetalle.precio_venta).toFixed(2)}
										</span>
									</div>
									<div className="stock-box">
										<span className="label">Disponible</span>
										<span className="value">
											{productoDetalle.stock_actual} unidades
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Footer */}
			<footer className="portal-footer">
				<p>
					© {new Date().getFullYear()} {empresa.nombre}. Todos los derechos
					reservados.
				</p>
			</footer>
		</div>
	);
}

export default PortalProductos;
