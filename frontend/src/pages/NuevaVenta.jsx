import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productosService, ventasService } from "../services";
import "../styles/NuevaVenta.css";

function NuevaVenta() {
	const navigate = useNavigate();
	const [productos, setProductos] = useState([]);
	const [carrito, setCarrito] = useState([]);
	const [formData, setFormData] = useState({
		metodo_pago: "EFECTIVO",
		descuento: 0,
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		cargarProductos();
	}, []);

	const cargarProductos = async () => {
		try {
			const response = await productosService.obtenerTodos();
			if (response.success) {
				setProductos(
					response.data.filter((p) => p.activo && p.stock_actual > 0),
				);
			}
		} catch (error) {
			console.error("Error al cargar productos:", error);
		}
	};

	const agregarAlCarrito = (producto) => {
		const existe = carrito.find(
			(item) => item.id_producto === producto.id_producto,
		);
		if (existe) {
			if (existe.cantidad < producto.stock_actual) {
				setCarrito(
					carrito.map((item) =>
						item.id_producto === producto.id_producto
							? { ...item, cantidad: item.cantidad + 1 }
							: item,
					),
				);
			} else {
				alert("No hay suficiente stock");
			}
		} else {
			setCarrito([
				...carrito,
				{
					id_producto: producto.id_producto,
					nombre: producto.nombre,
					precio: producto.precio_venta,
					cantidad: 1,
					stock_max: producto.stock_actual,
				},
			]);
		}
	};

	const actualizarCantidad = (id_producto, cantidad) => {
		const item = carrito.find((i) => i.id_producto === id_producto);
		if (cantidad > item.stock_max) {
			alert("No hay suficiente stock");
			return;
		}
		if (cantidad <= 0) {
			eliminarDelCarrito(id_producto);
			return;
		}
		setCarrito(
			carrito.map((item) =>
				item.id_producto === id_producto ? { ...item, cantidad } : item,
			),
		);
	};

	const eliminarDelCarrito = (id_producto) => {
		setCarrito(carrito.filter((item) => item.id_producto !== id_producto));
	};

	const calcularSubtotal = () => {
		return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
	};

	const calcularTotal = () => {
		return calcularSubtotal() - parseFloat(formData.descuento || 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (carrito.length === 0) {
			alert("Debe agregar al menos un producto");
			return;
		}

		setLoading(true);
		try {
			const data = {
				metodo_pago: formData.metodo_pago,
				descuento: parseFloat(formData.descuento || 0),
				productos: carrito.map((item) => ({
					id_producto: item.id_producto,
					cantidad: item.cantidad,
				})),
			};

			const response = await ventasService.crear(data);
			if (response.success) {
				alert("Venta registrada exitosamente");
				navigate("/ventas");
			}
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al registrar venta");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="nueva-venta-page">
			<div className="page-header">
				<h1>Nueva Venta</h1>
				<button
					onClick={() => navigate("/ventas")}
					className="btn btn-secondary"
				>
					Volver
				</button>
			</div>

			<div className="venta-container">
				<div className="productos-seleccion">
					<h3>Seleccionar Productos</h3>
					<div className="productos-grid">
						{productos.map((producto) => (
							<div
								key={producto.id_producto}
								className="producto-card"
								onClick={() => agregarAlCarrito(producto)}
							>
								<h4>{producto.nombre}</h4>
								<p className="producto-codigo">{producto.codigo}</p>
								<p className="producto-precio">
									Bs. {parseFloat(producto.precio_venta).toFixed(2)}
								</p>
								<p className="producto-stock">Stock: {producto.stock_actual}</p>
							</div>
						))}
					</div>
				</div>

				<div className="carrito-venta">
					<h3>Carrito de Venta</h3>

					{carrito.length === 0 ? (
						<p className="carrito-vacio">No hay productos en el carrito</p>
					) : (
						<>
							<div className="carrito-items">
								{carrito.map((item) => (
									<div key={item.id_producto} className="carrito-item">
										<div className="item-info">
											<strong>{item.nombre}</strong>
											<p>Bs. {parseFloat(item.precio).toFixed(2)}</p>
										</div>
										<div className="item-cantidad">
											<button
												onClick={() =>
													actualizarCantidad(
														item.id_producto,
														item.cantidad - 1,
													)
												}
											>
												-
											</button>
											<input
												type="number"
												value={item.cantidad}
												onChange={(e) =>
													actualizarCantidad(
														item.id_producto,
														parseInt(e.target.value),
													)
												}
												min="1"
												max={item.stock_max}
											/>
											<button
												onClick={() =>
													actualizarCantidad(
														item.id_producto,
														item.cantidad + 1,
													)
												}
											>
												+
											</button>
										</div>
										<div className="item-subtotal">
											Bs. {(item.precio * item.cantidad).toFixed(2)}
										</div>
										<button
											className="btn-eliminar"
											onClick={() => eliminarDelCarrito(item.id_producto)}
										>
											🗑️
										</button>
									</div>
								))}
							</div>

							<form onSubmit={handleSubmit} className="venta-form">
								<div className="form-group">
									<label>Método de Pago</label>
									<select
										value={formData.metodo_pago}
										onChange={(e) =>
											setFormData({ ...formData, metodo_pago: e.target.value })
										}
									>
										<option value="EFECTIVO">Efectivo</option>
										<option value="QR">QR</option>
										<option value="TARJETA">Tarjeta</option>
									</select>
								</div>

								<div className="form-group">
									<label>Descuento (Bs.)</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={formData.descuento}
										onChange={(e) =>
											setFormData({ ...formData, descuento: e.target.value })
										}
									/>
								</div>

								<div className="venta-totales">
									<div className="total-row">
										<span>Subtotal:</span>
										<strong>Bs. {calcularSubtotal().toFixed(2)}</strong>
									</div>
									<div className="total-row">
										<span>Descuento:</span>
										<strong>
											Bs. {parseFloat(formData.descuento || 0).toFixed(2)}
										</strong>
									</div>
									<div className="total-row total-final">
										<span>TOTAL:</span>
										<strong>Bs. {calcularTotal().toFixed(2)}</strong>
									</div>
								</div>

								<button
									type="submit"
									className="btn btn-primary btn-block"
									disabled={loading}
								>
									{loading ? "Procesando..." : "Registrar Venta"}
								</button>
							</form>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default NuevaVenta;
