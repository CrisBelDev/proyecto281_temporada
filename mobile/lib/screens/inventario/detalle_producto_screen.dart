import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/productos_provider.dart';
import '../../models/producto.dart';
import '../../config/theme.dart';

class DetalleProductoScreen extends StatefulWidget {
  final String productoId;

  const DetalleProductoScreen({super.key, required this.productoId});

  @override
  State<DetalleProductoScreen> createState() => _DetalleProductoScreenState();
}

class _DetalleProductoScreenState extends State<DetalleProductoScreen> {
  Producto? _producto;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProducto();
  }

  Future<void> _loadProducto() async {
    setState(() => _isLoading = true);
    final provider = Provider.of<ProductosProvider>(context, listen: false);
    final producto =
        await provider.obtenerProductoPorId(int.parse(widget.productoId));
    setState(() {
      _producto = producto;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat =
        NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del Producto'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Navegar a editar producto
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _producto == null
              ? const Center(child: Text('Producto no encontrado'))
              : RefreshIndicator(
                  onRefresh: _loadProducto,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Imagen del producto
                        Container(
                          width: double.infinity,
                          height: 250,
                          color: Colors.grey[200],
                          child: _producto!.imagen != null
                              ? Image.network(
                                  _producto!.imagen!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Icon(
                                    Icons.inventory_2,
                                    size: 100,
                                    color: Colors.grey[400],
                                  ),
                                )
                              : Icon(
                                  Icons.inventory_2,
                                  size: 100,
                                  color: Colors.grey[400],
                                ),
                        ),

                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Nombre y código
                              Text(
                                _producto!.nombre,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.qr_code,
                                      size: 16, color: Colors.grey[600]),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Código: ${_producto!.codigo}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),

                              // Categoría
                              if (_producto!.nombreCategoria != null)
                                Chip(
                                  avatar: const Icon(Icons.category, size: 18),
                                  label: Text(_producto!.nombreCategoria!),
                                ),

                              const SizedBox(height: 16),
                              const Divider(),

                              // Descripción
                              if (_producto!.descripcion != null &&
                                  _producto!.descripcion!.isNotEmpty) ...[
                                const SizedBox(height: 16),
                                const Text(
                                  'Descripción',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _producto!.descripcion!,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[700],
                                  ),
                                ),
                                const SizedBox(height: 16),
                                const Divider(),
                              ],

                              // Precios y Margen
                              const SizedBox(height: 16),
                              const Text(
                                'Precios y Rentabilidad',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildPreciosCard(currencyFormat),

                              const SizedBox(height: 16),
                              const Divider(),

                              // Inventario
                              const SizedBox(height: 16),
                              const Text(
                                'Inventario',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildInventarioCard(currencyFormat),

                              const SizedBox(height: 16),
                              const Divider(),

                              // Información adicional
                              const SizedBox(height: 16),
                              const Text(
                                'Información Adicional',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),

                              _buildInfoRow(
                                'Estado',
                                _producto!.activo ? 'Activo' : 'Inactivo',
                                color: _producto!.activo
                                    ? AppTheme.successColor
                                    : Colors.grey,
                              ),

                              if (_producto!.fechaCreacion != null)
                                _buildInfoRow(
                                  'Creado',
                                  dateFormat.format(_producto!.fechaCreacion!),
                                ),

                              if (_producto!.fechaActualizacion != null)
                                _buildInfoRow(
                                  'Última actualización',
                                  dateFormat
                                      .format(_producto!.fechaActualizacion!),
                                ),

                              const SizedBox(height: 24),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildPreciosCard(NumberFormat currencyFormat) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Precio de Compra',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currencyFormat.format(_producto!.precioCompra),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Precio de Venta',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currencyFormat.format(_producto!.precioVenta),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.successColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ganancia por Unidad',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currencyFormat.format(_producto!.gananciaPorUnidad),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _producto!.gananciaPorUnidad > 0
                            ? AppTheme.successColor
                            : AppTheme.errorColor,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Margen de Ganancia',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_producto!.margenGanancia.toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _producto!.margenGanancia > 0
                            ? AppTheme.successColor
                            : AppTheme.errorColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInventarioCard(NumberFormat currencyFormat) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStockIndicator(
                  'Stock Actual',
                  _producto!.stock,
                  _producto!.sinStock
                      ? AppTheme.errorColor
                      : _producto!.stockBajo
                          ? AppTheme.warningColor
                          : AppTheme.successColor,
                ),
                _buildStockIndicator(
                  'Stock Mínimo',
                  _producto!.stockMinimo,
                  Colors.grey,
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _buildInfoRow(
              'Valor del Inventario',
              currencyFormat.format(_producto!.valorInventario),
              isBold: true,
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              'Ganancia Potencial',
              currencyFormat.format(_producto!.gananciaPotencial),
              color: _producto!.gananciaPotencial > 0
                  ? AppTheme.successColor
                  : Colors.grey,
              isBold: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStockIndicator(String label, int cantidad, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '$cantidad',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value,
      {Color? color, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: color ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
