import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productosService, ventasService, clientesService } from "../services";
import "../styles/NuevaVenta.css";

function NuevaVenta() {
	const navigate = useNavigate();
	const [productos, setProductos] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [carrito, setCarrito] = useState([]);
	const [busquedaProducto, setBusquedaProducto] = useState("");
	const [formData, setFormData] = useState({
		id_cliente: "",
		metodo_pago: "EFECTIVO",
		descuento: 0,
		observaciones: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		cargarProductos();
		cargarClientes();
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

	const cargarClientes = async () => {
		try {
			const response = await clientesService.obtenerTodos();
			if (response.success) {
				setClientes(response.data);
			}
		} catch (error) {
			console.error("Error al cargar clientes:", error);
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
		const item = carrito.find((i) => i.id_producto === id_producto);
		if (confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
			setCarrito(carrito.filter((item) => item.id_producto !== id_producto));
		}
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
				id_cliente: formData.id_cliente || undefined,
				metodo_pago: formData.metodo_pago,
				descuento: parseFloat(formData.descuento || 0),
				observaciones: formData.observaciones || undefined,
				productos: carrito.map((item) => ({
					id_producto: item.id_producto,
					cantidad: item.cantidad,
				})),
			};

			const response = await ventasService.crear(data);
			if (response.success) {
				alert("✅ Venta registrada exitosamente");
				navigate("/admin/ventas");
			}
		} catch (error) {
			alert(error.response?.data?.mensaje || "Error al registrar venta");
		} finally {
			setLoading(false);
		}
	};

	const productosFiltrados = productos.filter(
		(p) =>
			p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
			p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()),
	);

	return (
		<div className="nueva-venta-page">
			<div className="page-header">
				<div>
					<h1>🛒 Nueva Venta</h1>
					<p className="page-subtitle">
						Selecciona productos y completa la venta
					</p>
				</div>
				<button
					onClick={() => navigate("/admin/ventas")}
					className="btn btn-secondary"
				>
					← Volver
				</button>
			</div>

			<div className="venta-container">
				{/* Panel izquierdo - Productos */}
				<div className="productos-panel">
					<div className="panel-header">
						<h3>📦 Productos Disponibles</h3>
						<div className="busqueda-productos">
							<input
								type="text"
								placeholder="🔍 Buscar producto..."
								value={busquedaProducto}
								onChange={(e) => setBusquedaProducto(e.target.value)}
								className="input-busqueda"
							/>
						</div>
					</div>
					<div className="productos-grid">
						{productosFiltrados.length === 0 ? (
							<p className="no-productos">No hay productos disponibles</p>
						) : (
							productosFiltrados.map((producto) => (
								<div
									key={producto.id_producto}
									className="producto-card"
									onClick={() => agregarAlCarrito(producto)}
								>
									<div className="producto-header">
										<h4>{producto.nombre}</h4>
										<span className="producto-codigo">{producto.codigo}</span>
									</div>
									<div className="producto-body">
										<div className="producto-precio">
											<span className="precio-label">Precio:</span>
											<span className="precio-valor">
												Bs. {parseFloat(producto.precio_venta).toFixed(2)}
											</span>
										</div>
										<div className="producto-stock">
											<span className="stock-icon">📊</span>
											<span>Stock: {producto.stock_actual}</span>
										</div>
									</div>
									<div className="producto-footer">
										<button className="btn-agregar">+ Agregar</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Panel derecho - Carrito y Resumen */}
				<div className="carrito-panel">
					<div className="carrito-header">
						<h3>🛍️ Carrito de Compra</h3>
						{carrito.length > 0 && (
							<span className="items-count">{carrito.length} items</span>
						)}
					</div>

					{carrito.length === 0 ? (
						<div className="carrito-vacio">
							<div className="vacio-icon">🛒</div>
							<p>No hay productos en el carrito</p>
							<small>Selecciona productos de la izquierda</small>
						</div>
					) : (
						<>
							<div className="carrito-resumen-header">
								<h4>📋 Detalle del Pedido</h4>
								<button
									type="button"
									className="btn-vaciar-carrito"
									onClick={() => {
										if (confirm("¿Vaciar todo el carrito?")) {
											setCarrito([]);
										}
									}}
									title="Vaciar carrito"
								>
									🗑️ Vaciar
								</button>
							</div>

							<div className="carrito-items">
								{carrito.map((item, index) => (
									<div key={item.id_producto} className="carrito-item">
										<div className="item-header">
											<div className="item-numero">#{index + 1}</div>
											<button
												type="button"
												className="btn-eliminar"
												onClick={() => eliminarDelCarrito(item.id_producto)}
												title="Eliminar del carrito"
											>
												✕
											</button>
										</div>

										<div className="item-info">
											<strong className="item-nombre">{item.nombre}</strong>
											<div className="item-detalles">
												<span className="item-precio-unitario">
													Bs. {parseFloat(item.precio).toFixed(2)} c/u
												</span>
												<span className="item-stock-info">
													📦 Stock: {item.stock_max}
												</span>
											</div>
										</div>

										<div className="item-controles">
											<div className="cantidad-control">
												<label>Cantidad:</label>
												<div className="item-cantidad">
													<button
														type="button"
														onClick={() =>
															actualizarCantidad(
																item.id_producto,
																item.cantidad - 1,
															)
														}
														className="btn-cantidad"
														disabled={item.cantidad <= 1}
													>
														−
													</button>
													<input
														type="number"
														value={item.cantidad}
														onChange={(e) =>
															actualizarCantidad(
																item.id_producto,
																parseInt(e.target.value) || 1,
															)
														}
														min="1"
														max={item.stock_max}
														className="input-cantidad"
													/>
													<button
														type="button"
														onClick={() =>
															actualizarCantidad(
																item.id_producto,
																item.cantidad + 1,
															)
														}
														className="btn-cantidad"
														disabled={item.cantidad >= item.stock_max}
													>
														+
													</button>
												</div>
											</div>

											<div className="item-subtotal-box">
												<span className="subtotal-label">Subtotal:</span>
												<span className="subtotal-valor">
													Bs. {(item.precio * item.cantidad).toFixed(2)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>

							<form onSubmit={handleSubmit} className="venta-form">
								{/* Información del Cliente */}
								<div className="form-section">
									<h4>👤 Información del Cliente</h4>
									<div className="form-group">
										<label>Cliente (Opcional)</label>
										<select
											value={formData.id_cliente}
											onChange={(e) =>
												setFormData({ ...formData, id_cliente: e.target.value })
											}
										>
											<option value="">Venta sin cliente registrado</option>
											{clientes.map((cliente) => (
												<option
													key={cliente.id_cliente}
													value={cliente.id_cliente}
												>
													{cliente.nombre} {cliente.apellido}{" "}
													{cliente.ci ? `- CI: ${cliente.ci}` : ""}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Detalles de Pago */}
								<div className="form-section">
									<h4>💳 Detalles de Pago</h4>
									<div className="form-group">
										<label>Método de Pago</label>
										<select
											value={formData.metodo_pago}
											onChange={(e) =>
												setFormData({
													...formData,
													metodo_pago: e.target.value,
												})
											}
										>
											<option value="EFECTIVO">💵 Efectivo</option>
											<option value="QR">📱 QR</option>
											<option value="TARJETA">💳 Tarjeta</option>
											<option value="TRANSFERENCIA">🏦 Transferencia</option>
										</select>
									</div>

									<div className="form-group">
										<label>Descuento (Bs.)</label>
										<input
											type="number"
											step="0.01"
											min="0"
											max={calcularSubtotal()}
											value={formData.descuento}
											onChange={(e) =>
												setFormData({ ...formData, descuento: e.target.value })
											}
											placeholder="0.00"
										/>
									</div>

									<div className="form-group">
										<label>Observaciones</label>
										<textarea
											value={formData.observaciones}
											onChange={(e) =>
												setFormData({
													...formData,
													observaciones: e.target.value,
												})
											}
											placeholder="Notas adicionales sobre la venta..."
											rows="2"
										/>
									</div>
								</div>

								{/* Resumen de Totales */}
								<div className="venta-totales">
									<div className="total-row">
										<span>Subtotal:</span>
										<strong>Bs. {calcularSubtotal().toFixed(2)}</strong>
									</div>
									{parseFloat(formData.descuento || 0) > 0 && (
										<div className="total-row descuento-row">
											<span>Descuento:</span>
											<strong className="descuento">
												- Bs. {parseFloat(formData.descuento || 0).toFixed(2)}
											</strong>
										</div>
									)}
									<div className="total-row total-final">
										<span>TOTAL A PAGAR:</span>
										<strong className="total-amount">
											Bs. {calcularTotal().toFixed(2)}
										</strong>
									</div>
								</div>

								<button
									type="submit"
									className="btn btn-primary btn-block btn-finalizar"
									disabled={loading}
								>
									{loading ? "Procesando..." : "✅ Finalizar Venta"}
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
