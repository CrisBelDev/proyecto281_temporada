import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { proveedoresService, comprasService } from "../services";
import ModalProductosProveedor from "../components/ModalProductosProveedor";
import "../styles/NuevaCompra.css";

function NuevaCompra() {
	const navigate = useNavigate();
	const [proveedores, setProveedores] = useState([]);
	const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
	const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		cargarProveedores();
	}, []);

	const cargarProveedores = async () => {
		try {
			const response = await proveedoresService.obtenerTodos();
			if (response.success) {
				setProveedores(response.data.filter((p) => p.activo));
			}
		} catch (error) {
			console.error("Error al cargar proveedores:", error);
		}
	};

	const seleccionarProveedor = (proveedor) => {
		setProveedorSeleccionado(proveedor);
		setMostrarModalProductos(true);
	};

	const cerrarModal = () => {
		setMostrarModalProductos(false);
		// Refrescar lista de proveedores después de crear una compra
		cargarProveedores();
	};

	return (
		<div className="nueva-compra-page">
			<div className="page-header">
				<h1>Nueva Compra</h1>
				<button
					onClick={() => navigate("/compras")}
					className="btn btn-secondary"
				>
					Volver
				</button>
			</div>

			<div className="contenido-nueva-compra">
				<div className="instrucciones">
					<p>
						<strong>📋 Instrucciones:</strong> Seleccione un proveedor para ver
						sus productos disponibles y realizar un pedido.
					</p>
				</div>

				{loading ? (
					<div className="loading">Cargando proveedores...</div>
				) : proveedores.length === 0 ? (
					<div className="mensaje-vacio">
						<p>No hay proveedores registrados</p>
						<button
							className="btn btn-primary"
							onClick={() => navigate("/proveedores")}
						>
							Ir a Proveedores
						</button>
					</div>
				) : (
					<div className="lista-proveedores">
						<h2>Seleccionar Proveedor</h2>
						<div className="grid-proveedores">
							{proveedores.map((proveedor) => (
								<div
									key={proveedor.id_proveedor}
									className="tarjeta-proveedor"
									onClick={() => seleccionarProveedor(proveedor)}
								>
									<div className="proveedor-info">
										<h3>{proveedor.nombre}</h3>
										{proveedor.telefono && (
											<p className="telefono">📞 {proveedor.telefono}</p>
										)}
										{proveedor.email && (
											<p className="email">📧 {proveedor.email}</p>
										)}
										{proveedor.direccion && (
											<p className="direccion">📍 {proveedor.direccion}</p>
										)}
									</div>
									<div className="proveedor-accion">
										<button className="btn btn-primary">Ver Productos →</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{mostrarModalProductos && proveedorSeleccionado && (
				<ModalProductosProveedor
					proveedor={proveedorSeleccionado}
					onClose={cerrarModal}
				/>
			)}
		</div>
	);
}

export default NuevaCompra;
