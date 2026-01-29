import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/notificaciones_provider.dart';
import '../../config/theme.dart';

class NotificacionesScreen extends StatefulWidget {
  const NotificacionesScreen({super.key});

  @override
  State<NotificacionesScreen> createState() => _NotificacionesScreenState();
}

class _NotificacionesScreenState extends State<NotificacionesScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final provider = Provider.of<NotificacionesProvider>(
      context,
      listen: false,
    );
    await provider.cargarNotificaciones();
  }

  IconData _getIconoNotificacion(String tipo) {
    switch (tipo) {
      case 'STOCK_BAJO':
        return Icons.warning;
      case 'STOCK_AGOTADO':
        return Icons.error;
      case 'VENTA':
        return Icons.shopping_cart;
      case 'COMPRA':
        return Icons.shopping_bag;
      case 'SISTEMA':
        return Icons.info;
      default:
        return Icons.notifications;
    }
  }

  Color _getColorNotificacion(String tipo) {
    switch (tipo) {
      case 'STOCK_BAJO':
        return AppTheme.warningColor;
      case 'STOCK_AGOTADO':
        return AppTheme.errorColor;
      case 'VENTA':
        return AppTheme.successColor;
      case 'COMPRA':
        return AppTheme.primaryColor;
      case 'SISTEMA':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          Consumer<NotificacionesProvider>(
            builder: (context, provider, _) {
              return provider.tieneNoLeidas
                  ? IconButton(
                      icon: const Icon(Icons.done_all),
                      tooltip: 'Marcar todas como leídas',
                      onPressed: () async {
                        await provider.marcarTodasComoLeidas();
                      },
                    )
                  : const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: Consumer<NotificacionesProvider>(
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

          if (provider.notificaciones.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: 100,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No tienes notificaciones',
                    style: TextStyle(fontSize: 18),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadData,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.notificaciones.length,
              itemBuilder: (context, index) {
                final notif = provider.notificaciones[index];
                final color = _getColorNotificacion(notif.tipo);

                return Dismissible(
                  key: Key(notif.id.toString()),
                  background: Container(
                    color: AppTheme.errorColor,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 16),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  direction: DismissDirection.endToStart,
                  onDismissed: (direction) {
                    provider.eliminarNotificacion(notif.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Notificación eliminada'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    color: notif.leida ? null : color.withOpacity(0.05),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: color,
                        child: Icon(
                          _getIconoNotificacion(notif.tipo),
                          color: Colors.white,
                        ),
                      ),
                      title: Text(
                        notif.titulo,
                        style: TextStyle(
                          fontWeight:
                              notif.leida ? FontWeight.normal : FontWeight.bold,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(notif.mensaje),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('dd/MM/yyyy HH:mm').format(notif.fecha),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                      trailing: !notif.leida
                          ? IconButton(
                              icon: const Icon(Icons.check),
                              tooltip: 'Marcar como leída',
                              onPressed: () {
                                provider.marcarComoLeida(notif.id);
                              },
                            )
                          : null,
                      isThreeLine: true,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
