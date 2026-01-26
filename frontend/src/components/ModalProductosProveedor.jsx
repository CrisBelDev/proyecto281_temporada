import { useState, useEffect } from "react";
import {
	proveedoresService,
	productosService,
	comprasService,
	categoriasService,
} from "../services";
import "./ModalProductosProveedor.css";

const ModalProductosProveedor = ({ proveedor, onClose }) => {
	const [productosDisponibles, setProductosDisponibles] = useState([]);
	const [productosAsignados, setProductosAsignados] = useState([]);
	const [busqueda, setBusqueda] = useState("");
	const [loading, setLoading] = useState(false);
	const [precioCompra, setPrecioCompra] = useState("");
	const [productoSeleccionado, setProductoSeleccionado] = useState("");
	const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
	const [carritoPedido, setCarritoPedido] = useState([]);
	const [proveedorCompleto, setProveedorCompleto] = useState(null);
	const [mostrarFormNuevoProducto, setMostrarFormNuevoProducto] =
		useState(false);
	const [categorias, setCategorias] = useState([]);
	const [nuevoProducto, setNuevoProducto] = useState({
		codigo: "",
		nombre: "",
		descripcion: "",
		precio_venta: "",
		precio_compra: "",
		stock_minimo: "",
		id_categoria: "",
	});

	useEffect(() => {
		if (proveedor) {
			cargarDatos();
			cargarCategorias();
		}
	}, [proveedor]);

	const cargarCategorias = async () => {
		try {
			const response = await categoriasService.obtenerTodas();
			// Manejar diferentes estructuras de respuesta
			const categoriasData = response?.data || response || [];
			console.log("Categorías cargadas:", categoriasData);
			setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
		} catch (error) {
			console.error("Error al cargar categorías:", error);
			console.error(
				"Detalles del error:",
				error.response?.data || error.message,
			);
			setCategorias([]);
		}
	};

	const cargarDatos = async () => {
		try {
			setLoading(true);
			console.log("Proveedor inicial:", proveedor);

			// Cargar proveedor completo con sus productos
			const proveedorData = await proveedoresService.obtenerPorId(
				proveedor.id_proveedor,
			);
			console.log("Proveedor completo cargado:", proveedorData);
			setProveedorCompleto(proveedorData);

			// Cargar productos disponibles de la empresa del proveedor
			const empresaId = proveedorData.id_empresa || proveedor.id_empresa;
			if (empresaId) {
				const productosResponse =
					await productosService.obtenerTodos(empresaId);
				// Manejar diferentes estructuras de respuesta
				const productos = productosResponse?.data || productosResponse || [];
				console.log("Productos disponibles:", productos);
				setProductosDisponibles(Array.isArray(productos) ? productos : []);
			} else {
				console.warn("No se pudo determinar el id_empresa");
				setProductosDisponibles([]);
			}

			// Productos ya asignados al proveedor
			const asignados = proveedorData.productos_suministrados || [];
			console.log("Productos asignados al proveedor:", asignados);
			setProductosAsignados(Array.isArray(asignados) ? asignados : []);
		} catch (error) {
			console.error("Error al cargar datos:", error);
			console.error(
				"Detalles del error:",
				error.response?.data || error.message,
			);
			setProductosDisponibles([]);
			setProductosAsignados([]);
		} finally {
			setLoading(false);
		}
	};

	const handleAgregarProducto = async (e) => {
		e.preventDefault();

		if (!productoSeleccionado) {
			alert("Seleccione un producto");
			return;
		}

		console.log("Agregando producto:", {
			id_proveedor: proveedor.id_proveedor,
			id_producto: parseInt(productoSeleccionado),
			precio_compra_habitual: precioCompra ? parseFloat(precioCompra) : null,
		});

		try {
			const resultado = await proveedoresService.agregarProducto(
				proveedor.id_proveedor,
				{
					id_producto: parseInt(productoSeleccionado),
					precio_compra_habitual: precioCompra
						? parseFloat(precioCompra)
						: null,
				},
			);

			console.log("Producto agregado:", resultado);
			alert("Producto agregado exitosamente");
			setPrecioCompra("");
			setProductoSeleccionado("");

			// Recargar datos completos
			await cargarDatos();
		} catch (error) {
			console.error("Error al agregar producto:", error);
			console.error("Respuesta del error:", error.response);
			alert(
				error.response?.data?.mensaje ||
					error.message ||
					"Error al agregar producto",
			);
		}
	};

	const handleToggleProducto = async (idProducto, activo) => {
		if (
			!confirm(
				`¿Desea ${activo ? "desactivar" : "activar"} este producto del proveedor?`,
			)
		) {
			return;
		}

		try {
			await proveedoresService.toggleProducto(
				proveedor.id_proveedor,
				idProducto,
			);

			// Recargar datos completos
			await cargarDatos();

			alert(`Producto ${activo ? "desactivado" : "activado"} exitosamente`);
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			alert("Error al cambiar estado del producto");
		}
	};

	const productosNoAsignados = productosDisponibles.filter(
		(p) => !productosAsignados.some((pa) => pa.id_producto === p.id_producto),
	);

	const productosFiltrados = productosAsignados.filter((pp) => {
		if (!pp || !pp.producto) return false;
		const nombre = pp.producto.nombre || "";
		const codigo = pp.producto.codigo || "";
		const busquedaLower = busqueda.toLowerCase();
		return (
			nombre.toLowerCase().includes(busquedaLower) ||
			codigo.toLowerCase().includes(busquedaLower)
		);
	});

	const abrirModalPedido = () => {
		setMostrarModalPedido(true);
		setCarritoPedido([]);
	};

	const cerrarModalPedido = () => {
		setMostrarModalPedido(false);
		setCarritoPedido([]);
	};

	const agregarAlCarrito = (producto) => {
		const yaExiste = carritoPedido.find(
			(item) => item.id_producto === producto.id_producto,
		);

		if (yaExiste) {
			alert("Este producto ya está en el carrito");
			return;
		}

		setCarritoPedido([
			...carritoPedido,
			{
				id_producto: producto.id_producto,
				nombre: producto.producto?.nombre,
				codigo: producto.producto?.codigo,
				precio_unitario: producto.precio_compra_habitual || 0,
				cantidad: 1,
			},
		]);
	};

	const actualizarCantidad = (idProducto, nuevaCantidad) => {
		if (nuevaCantidad <= 0) {
			eliminarDelCarrito(idProducto);
			return;
		}

		setCarritoPedido(
			carritoPedido.map((item) =>
				item.id_producto === idProducto
					? { ...item, cantidad: parseInt(nuevaCantidad) }
					: item,
			),
		);
	};

	const actualizarPrecio = (idProducto, nuevoPrecio) => {
		setCarritoPedido(
			carritoPedido.map((item) =>
				item.id_producto === idProducto
					? { ...item, precio_unitario: parseFloat(nuevoPrecio) || 0 }
					: item,
			),
		);
	};

	const eliminarDelCarrito = (idProducto) => {
		setCarritoPedido(
			carritoPedido.filter((item) => item.id_producto !== idProducto),
		);
	};

	const calcularTotal = () => {
		return carritoPedido.reduce(
			(total, item) => total + item.cantidad * item.precio_unitario,
			0,
		);
	};

	const toggleFormNuevoProducto = () => {
		console.log(
			"Toggle form nuevo producto. Estado actual:",
			mostrarFormNuevoProducto,
		);
		console.log("Categorías disponibles:", categorias);

		try {
			setMostrarFormNuevoProducto(!mostrarFormNuevoProducto);
			if (!mostrarFormNuevoProducto) {
				// Resetear formulario
				setNuevoProducto({
					codigo: "",
					nombre: "",
					descripcion: "",
					precio_venta: "",
					precio_compra: "",
					stock_minimo: "",
					id_categoria: "",
				});
			}
		} catch (error) {
			console.error("Error al hacer toggle del formulario:", error);
		}
	};

	const handleNuevoProductoChange = (e) => {
		const { name, value } = e.target;
		setNuevoProducto((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCrearProducto = async (e) => {
		e.preventDefault();

		try {
			const productoData = {
				codigo: nuevoProducto.codigo,
				nombre: nuevoProducto.nombre,
				descripcion: nuevoProducto.descripcion,
				precio_venta: parseFloat(nuevoProducto.precio_venta),
				precio_compra: parseFloat(nuevoProducto.precio_compra) || 0,
				stock_actual: 0,
				stock_minimo: parseInt(nuevoProducto.stock_minimo) || 5,
				id_categoria: parseInt(nuevoProducto.id_categoria),
			};

			console.log("Creando producto:", productoData);

			const productoCreado = await productosService.crear(productoData);
			console.log("Producto creado:", productoCreado);

			// Asignar automáticamente el producto recién creado al proveedor
			const productoId =
				productoCreado.data?.id_producto || productoCreado.id_producto;

			if (productoId) {
				await proveedoresService.agregarProducto(proveedor.id_proveedor, {
					id_producto: productoId,
					precio_compra_habitual:
						parseFloat(nuevoProducto.precio_compra) || null,
				});
			}

			alert("Producto creado y asignado al proveedor exitosamente");
			toggleFormNuevoProducto();
			await cargarDatos();
		} catch (error) {
			console.error("Error al crear producto:", error);
			alert(
				error.response?.data?.mensaje ||
					error.message ||
					"Error al crear producto",
			);
		}
	};

	const realizarPedido = async () => {
		if (carritoPedido.length === 0) {
			alert("Agregue productos al carrito");
			return;
		}

		const productosInvalidos = carritoPedido.filter(
			(item) => item.cantidad <= 0 || item.precio_unitario <= 0,
		);

		if (productosInvalidos.length > 0) {
			alert("Todos los productos deben tener cantidad y precio válidos");
			return;
		}

		if (!confirm("¿Confirmar pedido de compra?")) {
			return;
		}

		try {
			await comprasService.crear({
				id_proveedor: proveedor.id_proveedor,
				productos: carritoPedido.map((item) => ({
					id_producto: item.id_producto,
					cantidad: item.cantidad,
					precio_unitario: item.precio_unitario,
				})),
				observaciones: `Pedido desde gestión de proveedor: ${proveedor.nombre}`,
			});

			alert("Pedido registrado exitosamente");
			cerrarModalPedido();
			// Actualizar la lista de productos
			cargarDatos();
		} catch (error) {
			console.error("Error al realizar pedido:", error);
			alert(
				error.response?.data?.mensaje ||
					"Error al realizar pedido. Verifique que todos los productos estén disponibles.",
			);
		}
	};

	// Validación temprana
	if (!proveedor) {
		return null;
	}

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content-productos-proveedor"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>📦 Productos de {proveedor.nombre}</h2>
					<button className="btn-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="modal-body-productos">
					{/* Botón para abrir modal de pedido */}
					<div className="accion-rapida-section">
						<button
							className="btn-pedir-productos"
							onClick={abrirModalPedido}
							disabled={productosAsignados.length === 0}
						>
							🛒 Pedir Productos
						</button>
					</div>
					{/* Formulario para agregar productos */}
					<div className="agregar-producto-section">
						<div className="section-header-with-action">
							<h3>➕ Agregar Producto</h3>
							<button
								type="button"
								className="btn-nuevo-producto-toggle"
								onClick={toggleFormNuevoProducto}
							>
								{mostrarFormNuevoProducto
									? "✕ Cancelar"
									: "+ Crear Nuevo Producto"}
							</button>
						</div>

						{mostrarFormNuevoProducto ? (
							loading ? (
								<div className="loading">Cargando formulario...</div>
							) : (
								<form
									onSubmit={handleCrearProducto}
									className="form-nuevo-producto"
								>
									<div className="form-row">
										<div className="form-group">
											<label>Código *</label>
											<input
												type="text"
												name="codigo"
												value={nuevoProducto.codigo}
												onChange={handleNuevoProductoChange}
												required
												placeholder="Ej: PROD001"
											/>
										</div>
										<div className="form-group">
											<label>Nombre *</label>
											<input
												type="text"
												name="nombre"
												value={nuevoProducto.nombre}
												onChange={handleNuevoProductoChange}
												required
												placeholder="Nombre del producto"
											/>
										</div>
									</div>

									<div className="form-group">
										<label>Descripción</label>
										<textarea
											name="descripcion"
											value={nuevoProducto.descripcion}
											onChange={handleNuevoProductoChange}
											placeholder="Descripción del producto"
											rows="2"
										/>
									</div>

									<div className="form-row">
										<div className="form-group">
											<label>Categoría *</label>
											<select
												name="id_categoria"
												value={nuevoProducto.id_categoria}
												onChange={handleNuevoProductoChange}
												required
											>
												<option value="">Seleccione categoría...</option>
												{Array.isArray(categorias) &&
													categorias.map((cat) => (
														<option
															key={cat.id_categoria}
															value={cat.id_categoria}
														>
															{cat.nombre}
														</option>
													))}
											</select>
											{categorias.length === 0 && (
												<small style={{ color: "#f44336", fontSize: "0.8rem" }}>
													⚠️ Debe crear al menos una categoría primero
												</small>
											)}
										</div>
										<div className="form-group">
											<label>Stock Mínimo *</label>
											<input
												type="number"
												name="stock_minimo"
												value={nuevoProducto.stock_minimo}
												onChange={handleNuevoProductoChange}
												required
												min="0"
												placeholder="5"
											/>
										</div>
									</div>

									<div className="form-row">
										<div className="form-group">
											<label>Precio de Compra *</label>
											<input
												type="number"
												name="precio_compra"
												value={nuevoProducto.precio_compra}
												onChange={handleNuevoProductoChange}
												required
												step="0.01"
												min="0"
												placeholder="0.00"
											/>
										</div>
										<div className="form-group">
											<label>Precio de Venta *</label>
											<input
												type="number"
												name="precio_venta"
												value={nuevoProducto.precio_venta}
												onChange={handleNuevoProductoChange}
												required
												step="0.01"
												min="0"
												placeholder="0.00"
											/>
										</div>
									</div>

									<button
										type="submit"
										className="btn-crear-producto"
										disabled={categorias.length === 0}
									>
										✓ Crear y Asignar Producto
									</button>
								</form>
							)
						) : productosNoAsignados.length === 0 ? (
							<div className="info-message">
								{productosDisponibles.length === 0 ? (
									<>
										⚠️ No hay productos disponibles.{" "}
										<strong>Cree un nuevo producto arriba.</strong>
									</>
								) : (
									<>
										✓ Todos los productos disponibles ya están asignados a este
										proveedor.{" "}
										<strong>Puede crear un nuevo producto arriba.</strong>
									</>
								)}
							</div>
						) : (
							<form
								onSubmit={handleAgregarProducto}
								className="form-agregar-producto"
							>
								<div className="form-group">
									<label>Producto</label>
									<select
										value={productoSeleccionado}
										onChange={(e) => setProductoSeleccionado(e.target.value)}
										required
									>
										<option value="">Seleccione un producto...</option>
										{productosNoAsignados.map((p) => (
											<option key={p.id_producto} value={p.id_producto}>
												{p.codigo} - {p.nombre}
											</option>
										))}
									</select>
								</div>

								<div className="form-group">
									<label>Precio Compra Habitual (Opcional)</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={precioCompra}
										onChange={(e) => setPrecioCompra(e.target.value)}
										placeholder="0.00"
									/>
								</div>

								<button type="submit" className="btn-agregar">
									Agregar Producto
								</button>
							</form>
						)}
					</div>

					{/* Lista de productos asignados */}
					<div className="productos-asignados-section">
						<div className="section-header">
							<h3>📋 Productos Asignados ({productosAsignados.length})</h3>
							<input
								type="text"
								placeholder="🔍 Buscar..."
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								className="search-input"
							/>
						</div>

						{loading ? (
							<div className="loading">Cargando...</div>
						) : productosFiltrados.length === 0 ? (
							<div className="no-data">
								{productosAsignados.length === 0
									? "No hay productos asignados"
									: "No se encontraron productos"}
							</div>
						) : (
							<div className="productos-list">
								{productosFiltrados.map((pp) => (
									<div
										key={pp.id_proveedor_producto}
										className={`producto-item ${!pp.activo ? "inactivo" : ""}`}
									>
										<div className="producto-info">
											<div className="producto-nombre">
												<strong>{pp.producto?.codigo}</strong> -{" "}
												{pp.producto?.nombre}
											</div>
											{pp.precio_compra_habitual && (
												<div className="producto-precio">
													💰 Precio habitual: $
													{parseFloat(pp.precio_compra_habitual).toFixed(2)}
												</div>
											)}
											<span
												className={`badge ${pp.activo ? "activo" : "inactivo"}`}
											>
												{pp.activo ? "Activo" : "Inactivo"}
											</span>
										</div>
										<div className="producto-actions">
											<button
												className={`btn-toggle ${pp.activo ? "desactivar" : "activar"}`}
												onClick={() =>
													handleToggleProducto(pp.id_producto, pp.activo)
												}
											>
												{pp.activo ? "🔴 Desactivar" : "🟢 Activar"}
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="modal-footer">
					<button className="btn-cerrar" onClick={onClose}>
						Cerrar
					</button>
				</div>
			</div>

			{/* Modal de Pedido */}
			{mostrarModalPedido && (
				<div
					className="modal-overlay modal-pedido-overlay"
					onClick={cerrarModalPedido}
				>
					<div
						className="modal-content-pedido"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-header">
							<h2>🛒 Realizar Pedido - {proveedor.nombre}</h2>
							<button className="btn-close" onClick={cerrarModalPedido}>
								✕
							</button>
						</div>

						<div className="modal-body-pedido">
							{/* Lista de productos disponibles para agregar */}
							<div className="productos-disponibles">
								<h3>Productos Disponibles</h3>
								<div className="productos-scroll">
									{productosAsignados
										.filter((pp) => pp && pp.activo && pp.producto)
										.map((pp) => {
											const enCarrito = carritoPedido.find(
												(item) => item.id_producto === pp.id_producto,
											);
											return (
												<div
													key={pp.id_proveedor_producto}
													className="producto-disponible-item"
												>
													<div className="producto-info-mini">
														<strong>{pp.producto?.codigo || "N/A"}</strong>
														<span>{pp.producto?.nombre || "Sin nombre"}</span>
														{pp.precio_compra_habitual && (
															<span className="precio-habitual">
																$
																{parseFloat(pp.precio_compra_habitual).toFixed(
																	2,
																)}
															</span>
														)}
													</div>
													<button
														className="btn-add-carrito"
														onClick={() => agregarAlCarrito(pp)}
														disabled={enCarrito}
													>
														{enCarrito ? "✓ En carrito" : "+ Agregar"}
													</button>
												</div>
											);
										})}
								</div>
							</div>

							{/* Carrito de pedido */}
							<div className="carrito-pedido">
								<h3>Carrito ({carritoPedido.length} productos)</h3>
								{carritoPedido.length === 0 ? (
									<div className="carrito-vacio">
										Agregue productos al carrito para realizar el pedido
									</div>
								) : (
									<div className="carrito-items">
										{carritoPedido.map((item) => (
											<div key={item.id_producto} className="carrito-item">
												<div className="item-info">
													<strong>{item.codigo}</strong>
													<span>{item.nombre}</span>
												</div>
												<div className="item-controles">
													<div className="control-group">
														<label>Cantidad:</label>
														<input
															type="number"
															min="1"
															value={item.cantidad}
															onChange={(e) =>
																actualizarCantidad(
																	item.id_producto,
																	e.target.value,
																)
															}
															className="input-cantidad"
														/>
													</div>
													<div className="control-group">
														<label>Precio Unit.:</label>
														<input
															type="number"
															step="0.01"
															min="0"
															value={item.precio_unitario}
															onChange={(e) =>
																actualizarPrecio(
																	item.id_producto,
																	e.target.value,
																)
															}
															className="input-precio"
														/>
													</div>
													<div className="item-subtotal">
														Subtotal: $
														{(item.cantidad * item.precio_unitario).toFixed(2)}
													</div>
													<button
														className="btn-eliminar-item"
														onClick={() => eliminarDelCarrito(item.id_producto)}
														title="Eliminar"
													>
														🗑️
													</button>
												</div>
											</div>
										))}

										<div className="carrito-total">
											<strong>TOTAL:</strong>
											<span className="total-monto">
												${calcularTotal().toFixed(2)}
											</span>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="modal-footer-pedido">
							<button
								className="btn-cancelar-pedido"
								onClick={cerrarModalPedido}
							>
								Cancelar
							</button>
							<button
								className="btn-confirmar-pedido"
								onClick={realizarPedido}
								disabled={carritoPedido.length === 0}
							>
								✓ Confirmar Pedido
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ModalProductosProveedor;
