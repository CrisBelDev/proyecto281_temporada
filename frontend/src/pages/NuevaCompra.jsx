import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productosService, comprasService } from "../services";
import "../styles/NuevaCompra.css";

function NuevaCompra() {
	const navigate = useNavigate();
	const [productos, setProductos] = useState([]);
	const [productosSeleccionados, setProductosSeleccionados] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		cargarProductos();
	}, []);

	const cargarProductos = async () => {
		try {
			const response = await productosService.obtenerTodos();
			if (response.success) {
				setProductos(response.data.filter((p) => p.activo));
			}
		} catch (error) {
			console.error("Error al cargar productos:", error);
		}
	};

	const agregarProducto = () => {
		setProductosSeleccionados([
			...productosSeleccionados,
			{
				id_producto: "",
				cantidad: 1,
				precio_unitario: 0,
			},
		]);
	};

	const eliminarProducto = (index) => {
		setProductosSeleccionados(
			productosSeleccionados.filter((_, i) => i !== index),
		);
	};

	const actualizarProducto = (index, campo, valor) => {
		const nuevos = [...productosSeleccionados];
		nuevos[index][campo] = valor;

		if (campo === "id_producto") {
			const producto = productos.find((p) => p.id_producto === parseInt(valor));
			if (producto) {
				nuevos[index].precio_unitario = producto.precio_compra || 0;
			}
		}

		setProductosSeleccionados(nuevos);
	};

	const calcularTotal = () => {
		return productosSeleccionados.reduce((sum, item) => {
			return sum + item.cantidad * item.precio_unitario;
		}, 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (productosSeleccionados.length === 0) {
			alert("Debe agregar al menos un producto");
			return;
		}

		const productosValidos = productosSeleccionados.filter(
			(p) => p.id_producto && p.cantidad > 0,
		);
		if (productosValidos.length === 0) {
			alert("Debe completar los datos de los productos");
			return;
		}

		setLoading(true);
		try {
			const data = {
				productos: productosValidos.map((item) => ({
					id_producto: parseInt(item.id_producto),
					cantidad: parseInt(item.cantidad),
					precio_unitario: parseFloat(item.precio_unitario),
				})),
			};

			const response = await comprasService.crear(data);
			if (response.success) {
				alert("Compra registrada exitosamente");
				navigate("/compras");
			}
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al registrar compra");
		} finally {
			setLoading(false);
		}
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

			<form onSubmit={handleSubmit} className="compra-form">
				<div className="productos-compra">
					<div className="section-header">
						<h3>Productos</h3>
						<button
							type="button"
							onClick={agregarProducto}
							className="btn btn-secondary"
						>
							+ Agregar Producto
						</button>
					</div>

					{productosSeleccionados.length === 0 ? (
						<p className="lista-vacia">No hay productos agregados</p>
					) : (
						<table className="table">
							<thead>
								<tr>
									<th>Producto</th>
									<th>Cantidad</th>
									<th>Precio Unitario</th>
									<th>Subtotal</th>
									<th>Acción</th>
								</tr>
							</thead>
							<tbody>
								{productosSeleccionados.map((item, index) => (
									<tr key={index}>
										<td>
											<select
												value={item.id_producto}
												onChange={(e) =>
													actualizarProducto(
														index,
														"id_producto",
														e.target.value,
													)
												}
												required
											>
												<option value="">Seleccionar...</option>
												{productos.map((p) => (
													<option key={p.id_producto} value={p.id_producto}>
														{p.nombre} ({p.codigo})
													</option>
												))}
											</select>
										</td>
										<td>
											<input
												type="number"
												min="1"
												value={item.cantidad}
												onChange={(e) =>
													actualizarProducto(index, "cantidad", e.target.value)
												}
												required
											/>
										</td>
										<td>
											<input
												type="number"
												step="0.01"
												min="0"
												value={item.precio_unitario}
												onChange={(e) =>
													actualizarProducto(
														index,
														"precio_unitario",
														e.target.value,
													)
												}
												required
											/>
										</td>
										<td>
											Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}
										</td>
										<td>
											<button
												type="button"
												onClick={() => eliminarProducto(index)}
												className="btn-icon"
												title="Eliminar"
											>
												🗑️
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				<div className="compra-totales">
					<div className="total-row">
						<span>TOTAL:</span>
						<strong>Bs. {calcularTotal().toFixed(2)}</strong>
					</div>
				</div>

				<div className="form-actions">
					<button
						type="button"
						onClick={() => navigate("/compras")}
						className="btn btn-secondary"
					>
						Cancelar
					</button>
					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? "Procesando..." : "Registrar Compra"}
					</button>
				</div>
			</form>
		</div>
	);
}

export default NuevaCompra;
