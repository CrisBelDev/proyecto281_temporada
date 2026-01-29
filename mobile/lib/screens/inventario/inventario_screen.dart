import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/productos_provider.dart';
import '../../config/theme.dart';

class InventarioScreen extends StatefulWidget {
  const InventarioScreen({super.key});

  @override
  State<InventarioScreen> createState() => _InventarioScreenState();
}

class _InventarioScreenState extends State<InventarioScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final provider = Provider.of<ProductosProvider>(context, listen: false);
    await Future.wait([
      provider.cargarProductos(),
      provider.cargarProductosStockBajo(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventario'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Todos'),
            Tab(text: 'Stock Bajo'),
            Tab(text: 'Sin Stock'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Buscar productos...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),

          // TabBarView
          Expanded(
            child: Consumer<ProductosProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                return TabBarView(
                  controller: _tabController,
                  children: [
                    // Todos los productos
                    _buildListaProductos(
                      _searchController.text.isEmpty
                          ? provider.productos
                          : provider.buscarProductos(_searchController.text),
                      currencyFormat,
                    ),

                    // Stock bajo
                    _buildListaProductos(
                      provider.productosStockBajo,
                      currencyFormat,
                      stockBajo: true,
                    ),

                    // Sin stock
                    _buildListaProductos(
                      provider.productos.where((p) => p.sinStock).toList(),
                      currencyFormat,
                      sinStock: true,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListaProductos(
    List productos,
    NumberFormat currencyFormat, {
    bool stockBajo = false,
    bool sinStock = false,
  }) {
    if (productos.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2, size: 80, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              sinStock
                  ? 'No hay productos sin stock'
                  : stockBajo
                  ? 'No hay productos con stock bajo'
                  : 'No se encontraron productos',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: productos.length,
        itemBuilder: (context, index) {
          final producto = productos[index];

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: producto.imagen != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          producto.imagen!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Icon(Icons.inventory_2, color: Colors.grey[400]),
                        ),
                      )
                    : Icon(Icons.inventory_2, color: Colors.grey[400]),
              ),
              title: Text(
                producto.nombre,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(currencyFormat.format(producto.precio)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.category, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        producto.nombreCategoria ?? 'Sin categoría',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ],
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: producto.sinStock
                      ? AppTheme.errorColor.withOpacity(0.1)
                      : producto.stockBajo
                      ? AppTheme.warningColor.withOpacity(0.1)
                      : AppTheme.successColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${producto.stock}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: producto.sinStock
                            ? AppTheme.errorColor
                            : producto.stockBajo
                            ? AppTheme.warningColor
                            : AppTheme.successColor,
                      ),
                    ),
                    Text(
                      'Stock',
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
