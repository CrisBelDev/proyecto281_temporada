import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/ventas_provider.dart';
import '../../providers/clientes_provider.dart';
import '../../config/theme.dart';

class NuevaVentaScreen extends StatefulWidget {
  const NuevaVentaScreen({super.key});

  @override
  State<NuevaVentaScreen> createState() => _NuevaVentaScreenState();
}

class _NuevaVentaScreenState extends State<NuevaVentaScreen> {
  int? _clienteSeleccionado;

  @override
  void initState() {
    super.initState();
    _loadClientes();
  }

  Future<void> _loadClientes() async {
    final provider = Provider.of<ClientesProvider>(context, listen: false);
    await provider.cargarClientes();
  }

  Future<void> _realizarVenta() async {
    if (_clienteSeleccionado == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Selecciona un cliente'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final ventasProvider = Provider.of<VentasProvider>(context, listen: false);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Venta'),
        content: Text(
          '¿Deseas registrar esta venta por ${NumberFormat.currency(symbol: '\$', decimalDigits: 2).format(ventasProvider.totalCarrito)}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await ventasProvider.realizarVenta(_clienteSeleccionado!);

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Venta registrada exitosamente'),
              backgroundColor: Colors.green,
            ),
          );
          context.go('/ventas');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                ventasProvider.error ?? 'Error al registrar la venta',
              ),
              backgroundColor: AppTheme.errorColor,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Nueva Venta')),
      body: Consumer<VentasProvider>(
        builder: (context, ventasProvider, _) {
          if (ventasProvider.carrito.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 100,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'El carrito está vacío',
                    style: TextStyle(fontSize: 18),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.go('/catalogo'),
                    child: const Text('Ver Catálogo'),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Selector de cliente
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.grey[100],
                child: Consumer<ClientesProvider>(
                  builder: (context, clientesProvider, _) {
                    return DropdownButtonFormField<int>(
                      value: _clienteSeleccionado,
                      decoration: const InputDecoration(
                        labelText: 'Cliente',
                        prefixIcon: Icon(Icons.person),
                      ),
                      items: clientesProvider.clientes
                          .map(
                            (cliente) => DropdownMenuItem(
                              value: cliente.id,
                              child: Text(cliente.nombre),
                            ),
                          )
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _clienteSeleccionado = value;
                        });
                      },
                    );
                  },
                ),
              ),

              // Lista de productos en carrito
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: ventasProvider.carrito.length,
                  itemBuilder: (context, index) {
                    final item = ventasProvider.carrito[index];

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.producto.nombre,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    currencyFormat.format(item.producto.precio),
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),

                            // Control de cantidad
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline),
                                  onPressed: () {
                                    ventasProvider.actualizarCantidad(
                                      item.producto.id,
                                      item.cantidad - 1,
                                    );
                                  },
                                ),
                                Text(
                                  '${item.cantidad}',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline),
                                  onPressed: item.cantidad < item.producto.stock
                                      ? () {
                                          ventasProvider.actualizarCantidad(
                                            item.producto.id,
                                            item.cantidad + 1,
                                          );
                                        }
                                      : null,
                                ),
                              ],
                            ),

                            // Subtotal y eliminar
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  currencyFormat.format(item.subtotal),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.delete,
                                    color: Colors.red,
                                  ),
                                  onPressed: () {
                                    ventasProvider.eliminarDelCarrito(
                                      item.producto.id,
                                    );
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Total y botón de venta
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total:',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          currencyFormat.format(ventasProvider.totalCarrito),
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: ventasProvider.isLoading
                            ? null
                            : _realizarVenta,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: ventasProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Realizar Venta',
                                style: TextStyle(fontSize: 18),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
