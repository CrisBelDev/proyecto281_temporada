import { useState, useEffect } from "react";
import { productosService, ventasService, clientesService } from "../services";
import "../styles/ModalNuevaVenta.css";

function ModalNuevaVenta({ isOpen, onClose, onVentaCreada }) {
	const [productos, setProductos] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [carrito, setCarrito] = useState([]);
	const [busquedaProducto, setBusquedaProducto] = useState("");
	const [productoSeleccionado, setProductoSeleccionado] = useState(null);
	const [cantidadAgregar, setCantidadAgregar] = useState(1);
	const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
	const [formData, setFormData] = useState({
		id_cliente: "",
		metodo_pago: "EFECTIVO",
		descuento: 0,
		observaciones: "",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			cargarProductos();
			cargarClientes();
		}
	}, [isOpen]);

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

	const agregarAlCarrito = (producto, cantidad = 1) => {
		if (!producto) return;

		const existe = carrito.find(
			(item) => item.id_producto === producto.id_producto,
		);

		if (existe) {
			const nuevaCantidad = existe.cantidad + cantidad;
			if (nuevaCantidad <= producto.stock_actual) {
				setCarrito(
					carrito.map((item) =>
						item.id_producto === producto.id_producto
							? { ...item, cantidad: nuevaCantidad }
							: item,
					),
				);
			} else {
				alert(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
				return;
			}
		} else {
			if (cantidad > producto.stock_actual) {
				alert(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
				return;
			}
			setCarrito([
				...carrito,
				{
					id_producto: producto.id_producto,
					nombre: producto.nombre,
					precio: producto.precio_venta,
					cantidad: cantidad,
					stock_max: producto.stock_actual,
				},
			]);
		}

		// Resetear búsqueda
		setBusquedaProducto("");
		setProductoSeleccionado(null);
		setCantidadAgregar(1);
		setMostrarSugerencias(false);
	};

	const seleccionarProducto = (producto) => {
		setProductoSeleccionado(producto);
		setBusquedaProducto(producto.nombre);
		setMostrarSugerencias(false);
	};

	const handleAgregarProducto = () => {
		if (productoSeleccionado && cantidadAgregar > 0) {
			agregarAlCarrito(productoSeleccionado, cantidadAgregar);
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
				// Resetear formulario
				setCarrito([]);
				setFormData({
					id_cliente: "",
					metodo_pago: "EFECTIVO",
					descuento: 0,
					observaciones: "",
				});
				setBusquedaProducto("");
				onVentaCreada();
				onClose();
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

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content-venta" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>🛒 Nueva Venta</h2>
					<button className="btn-close-modal" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="modal-body">
					<div className="venta-container-modal">
						{/* Buscador de Productos */}
						<div className="buscador-productos-section">
							<h3>🔍 Buscar y Agregar Producto</h3>

							<div className="buscador-wrapper">
								<div className="busqueda-grupo">
									<label>Producto:</label>
									<div className="autocomplete-container">
										<input
											type="text"
											placeholder="Escribe el nombre del producto..."
											value={busquedaProducto}
											onChange={(e) => {
												setBusquedaProducto(e.target.value);
												setMostrarSugerencias(true);
												setProductoSeleccionado(null);
											}}
											onFocus={() => setMostrarSugerencias(true)}
											className="input-busqueda-principal"
										/>

										{mostrarSugerencias && busquedaProducto && (
											<div className="sugerencias-dropdown">
												{productosFiltrados.length > 0 ? (
													productosFiltrados.slice(0, 8).map((producto) => (
														<div
															key={producto.id_producto}
															className="sugerencia-item"
															onClick={() => seleccionarProducto(producto)}
														>
															<div className="sugerencia-info">
																<strong>{producto.nombre}</strong>
																<span className="sugerencia-codigo">
																	{producto.codigo}
																</span>
															</div>
															<div className="sugerencia-detalles">
																<span className="sugerencia-precio">
																	Bs.{" "}
																	{parseFloat(producto.precio_venta).toFixed(2)}
																</span>
																<span className="sugerencia-stock">
																	Stock: {producto.stock_actual}
																</span>
															</div>
														</div>
													))
												) : (
													<div className="sugerencia-vacia">
														No se encontraron productos
													</div>
												)}
											</div>
										)}
									</div>
								</div>

								{productoSeleccionado && (
									<div className="producto-seleccionado-info">
										<div className="info-producto-card">
											<div className="info-row">
												<span className="info-label">Producto:</span>
												<span className="info-valor">
													{productoSeleccionado.nombre}
												</span>
											</div>
											<div className="info-row">
												<span className="info-label">Precio:</span>
												<span className="info-valor precio">
													Bs.{" "}
													{parseFloat(
														productoSeleccionado.precio_venta,
													).toFixed(2)}
												</span>
											</div>
											<div className="info-row">
												<span className="info-label">Disponible:</span>
												<span className="info-valor stock">
													{productoSeleccionado.stock_actual} unidades
												</span>
											</div>
										</div>

										<div className="cantidad-grupo">
											<label>Cantidad:</label>
											<div className="cantidad-input-wrapper">
												<button
													type="button"
													onClick={() =>
														setCantidadAgregar(Math.max(1, cantidadAgregar - 1))
													}
													className="btn-cantidad-input"
												>
													−
												</button>
												<input
													type="number"
													value={cantidadAgregar}
													onChange={(e) =>
														setCantidadAgregar(
															Math.max(1, parseInt(e.target.value) || 1),
														)
													}
													min="1"
													max={productoSeleccionado.stock_actual}
													className="input-cantidad-agregar"
												/>
												<button
													type="button"
													onClick={() =>
														setCantidadAgregar(
															Math.min(
																productoSeleccionado.stock_actual,
																cantidadAgregar + 1,
															),
														)
													}
													className="btn-cantidad-input"
												>
													+
												</button>
											</div>
										</div>

										<button
											type="button"
											onClick={handleAgregarProducto}
											className="btn btn-primary btn-agregar-carrito"
										>
											➕ Agregar al Carrito
										</button>
									</div>
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
									<div className="carrito-items">
										{carrito.map((item) => (
											<div key={item.id_producto} className="carrito-item">
												<div className="item-info">
													<strong>{item.nombre}</strong>
													<p className="item-precio">
														Bs. {parseFloat(item.precio).toFixed(2)} c/u
													</p>
												</div>
												<div className="item-controles">
													<div className="cantidad-wrapper">
														<label className="cantidad-label">Cantidad:</label>
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
															>
																+
															</button>
														</div>
														<small className="stock-disponible">
															Disponible: {item.stock_max}
														</small>
													</div>
													<div className="item-subtotal">
														Bs. {(item.precio * item.cantidad).toFixed(2)}
													</div>
													<button
														type="button"
														className="btn-eliminar"
														onClick={() => eliminarDelCarrito(item.id_producto)}
														title="Eliminar producto"
													>
														🗑️
													</button>
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
														setFormData({
															...formData,
															id_cliente: e.target.value,
														})
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
													<option value="TRANSFERENCIA">
														🏦 Transferencia
													</option>
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
														setFormData({
															...formData,
															descuento: e.target.value,
														})
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
														- Bs.{" "}
														{parseFloat(formData.descuento || 0).toFixed(2)}
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
			</div>
		</div>
	);
}

export default ModalNuevaVenta;
