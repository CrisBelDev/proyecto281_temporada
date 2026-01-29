import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/productos_provider.dart';
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

  void _verDetalleProducto(Producto producto) {
    context.push('/productos/${producto.id}');
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
                          onTap: () => _verDetalleProducto(producto),
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
