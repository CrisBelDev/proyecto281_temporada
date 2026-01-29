import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/productos_provider.dart';
import '../../providers/ventas_provider.dart';
import '../../models/producto.dart';
import '../../config/theme.dart';

class CatalogoScreen extends StatefulWidget {
  const CatalogoScreen({super.key});

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  final _searchController = TextEditingController();
  List<Producto> _productosFiltrados = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final provider = Provider.of<ProductosProvider>(context, listen: false);
    await provider.cargarProductos();
    setState(() {
      _productosFiltrados = provider.productos;
    });
  }

  void _filtrarProductos(String query) {
    final provider = Provider.of<ProductosProvider>(context, listen: false);
    setState(() {
      if (query.isEmpty) {
        _productosFiltrados = provider.productos;
      } else {
        _productosFiltrados = provider.buscarProductos(query);
      }
    });
  }

  void _agregarAlCarrito(Producto producto) {
    showDialog(
      context: context,
      builder: (context) => _CantidadDialog(producto: producto),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Catálogo de Productos'),
        actions: [
          Consumer<VentasProvider>(
            builder: (context, ventasProvider, _) {
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart),
                    onPressed: () => context.push('/nueva-venta'),
                  ),
                  if (ventasProvider.totalItemsCarrito > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppTheme.errorColor,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${ventasProvider.totalItemsCarrito}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar productos...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _filtrarProductos('');
                        },
                      )
                    : null,
              ),
              onChanged: _filtrarProductos,
            ),
          ),

          // Lista de productos
          Expanded(
            child: Consumer<ProductosProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (_productosFiltrados.isEmpty) {
                  return const Center(
                    child: Text('No se encontraron productos'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _loadData,
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: _productosFiltrados.length,
                    itemBuilder: (context, index) {
                      final producto = _productosFiltrados[index];

                      return Card(
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: () => _agregarAlCarrito(producto),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Imagen
                              Container(
                                height: 120,
                                width: double.infinity,
                                color: Colors.grey[200],
                                child: producto.imagen != null
                                    ? Image.network(
                                        producto.imagen!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            _buildPlaceholder(),
                                      )
                                    : _buildPlaceholder(),
                              ),

                              Padding(
                                padding: const EdgeInsets.all(8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      producto.nombre,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      currencyFormat
                                          .format(producto.precioVenta),
                                      style: TextStyle(
                                        color: AppTheme.primaryColor,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.inventory_2,
                                          size: 14,
                                          color: producto.sinStock
                                              ? AppTheme.errorColor
                                              : producto.stockBajo
                                                  ? AppTheme.warningColor
                                                  : AppTheme.successColor,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Stock: ${producto.stock}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: producto.sinStock
                                                ? AppTheme.errorColor
                                                : Colors.grey[600],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Icon(Icons.inventory_2, size: 60, color: Colors.grey[400]);
  }
}

class _CantidadDialog extends StatefulWidget {
  final Producto producto;

  const _CantidadDialog({required this.producto});

  @override
  State<_CantidadDialog> createState() => _CantidadDialogState();
}

class _CantidadDialogState extends State<_CantidadDialog> {
  int _cantidad = 1;

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );

    return AlertDialog(
      title: Text(widget.producto.nombre),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Precio: ${currencyFormat.format(widget.producto.precioVenta)}'),
          Text('Stock disponible: ${widget.producto.stock}'),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle),
                onPressed:
                    _cantidad > 1 ? () => setState(() => _cantidad--) : null,
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$_cantidad',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle),
                onPressed: _cantidad < widget.producto.stock
                    ? () => setState(() => _cantidad++)
                    : null,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Total: ${currencyFormat.format(widget.producto.precioVenta * _cantidad)}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () {
            final ventasProvider = Provider.of<VentasProvider>(
              context,
              listen: false,
            );
            ventasProvider.agregarAlCarrito(widget.producto, _cantidad);
            Navigator.pop(context);

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${widget.producto.nombre} agregado al carrito'),
                duration: const Duration(seconds: 2),
                action: SnackBarAction(
                  label: 'Ver carrito',
                  onPressed: () => context.push('/nueva-venta'),
                ),
              ),
            );
          },
          child: const Text('Agregar'),
        ),
      ],
    );
  }
}
