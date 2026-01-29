import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/ventas_provider.dart';
import '../../config/theme.dart';

class VentasScreen extends StatefulWidget {
  const VentasScreen({super.key});

  @override
  State<VentasScreen> createState() => _VentasScreenState();
}

class _VentasScreenState extends State<VentasScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final provider = Provider.of<VentasProvider>(context, listen: false);
    await provider.cargarVentas();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Ventas')),
      body: Consumer<VentasProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error: ${provider.error}',
                    style: TextStyle(color: AppTheme.errorColor),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadData,
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            );
          }

          if (provider.ventas.isEmpty) {
            return const Center(child: Text('No hay ventas registradas'));
          }

          return RefreshIndicator(
            onRefresh: _loadData,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.ventas.length,
              itemBuilder: (context, index) {
                final venta = provider.ventas[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: venta.isAnulada
                          ? AppTheme.errorColor
                          : AppTheme.successColor,
                      child: Icon(
                        venta.isAnulada ? Icons.cancel : Icons.check_circle,
                        color: Colors.white,
                      ),
                    ),
                    title: Text(
                      'Factura: ${venta.numeroFactura}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Cliente: ${venta.nombreCliente ?? "N/A"}'),
                        Text(
                          DateFormat('dd/MM/yyyy HH:mm').format(venta.fecha),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    trailing: Text(
                      currencyFormat.format(venta.total),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: venta.isAnulada
                            ? AppTheme.errorColor
                            : AppTheme.successColor,
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/catalogo'),
        icon: const Icon(Icons.add_shopping_cart),
        label: const Text('Nueva Venta'),
      ),
    );
  }
}
