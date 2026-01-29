import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/ventas_provider.dart';
import '../../providers/clientes_provider.dart';
import '../../models/cliente.dart';
import '../../config/theme.dart';

class NuevaVentaScreen extends StatefulWidget {
  const NuevaVentaScreen({super.key});

  @override
  State<NuevaVentaScreen> createState() => _NuevaVentaScreenState();
}

class _NuevaVentaScreenState extends State<NuevaVentaScreen> {
  int? _clienteSeleccionado;
  String? _nombreClienteSeleccionado;
  final _searchController = TextEditingController();
  bool _mostrarResultados = false;
  List<Cliente> _clientesFiltrados = [];

  @override
  void initState() {
    super.initState();
    _loadClientes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadClientes() async {
    final provider = Provider.of<ClientesProvider>(context, listen: false);
    await provider.cargarClientes();
  }

  void _filtrarClientes(String query) {
    final provider = Provider.of<ClientesProvider>(context, listen: false);
    setState(() {
      if (query.isEmpty) {
        _clientesFiltrados = provider.clientes;
        _mostrarResultados = false;
      } else {
        _clientesFiltrados = provider.buscarClientes(query);
        _mostrarResultados = true;
      }
    });
  }

  void _seleccionarCliente(Cliente cliente) {
    setState(() {
      _clienteSeleccionado = cliente.id;
      _nombreClienteSeleccionado = cliente.nombre;
      _searchController.text = cliente.nombre;
      _mostrarResultados = false;
    });
  }

  Future<void> _mostrarDialogoNuevoCliente() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => const _NuevoClienteDialog(),
    );

    if (result == true && mounted) {
      await _loadClientes();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cliente registrado exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
    }
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
              // Selector de cliente con búsqueda
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.grey[100],
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: InputDecoration(
                              labelText: 'Buscar o seleccionar cliente',
                              hintText: 'Escribe el nombre del cliente...',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear),
                                      onPressed: () {
                                        _searchController.clear();
                                        setState(() {
                                          _clienteSeleccionado = null;
                                          _nombreClienteSeleccionado = null;
                                          _mostrarResultados = false;
                                        });
                                      },
                                    )
                                  : null,
                            ),
                            onChanged: _filtrarClientes,
                            onTap: () {
                              if (_searchController.text.isEmpty) {
                                _filtrarClientes('');
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: _mostrarDialogoNuevoCliente,
                          icon: const Icon(Icons.person_add, size: 20),
                          label: const Text('Nuevo'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_mostrarResultados && _clientesFiltrados.isNotEmpty)
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _clientesFiltrados.length,
                          itemBuilder: (context, index) {
                            final cliente = _clientesFiltrados[index];
                            return ListTile(
                              leading: CircleAvatar(
                                child: Text(
                                  cliente.nombre[0].toUpperCase(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                              title: Text(cliente.nombre),
                              subtitle: Text(
                                cliente.documento ?? 'Sin documento',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              onTap: () => _seleccionarCliente(cliente),
                            );
                          },
                        ),
                      ),
                    if (_mostrarResultados && _clientesFiltrados.isEmpty)
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'No se encontraron clientes',
                              style: TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 8),
                            TextButton.icon(
                              onPressed: _mostrarDialogoNuevoCliente,
                              icon: const Icon(Icons.person_add),
                              label: const Text('Registrar nuevo cliente'),
                            ),
                          ],
                        ),
                      ),
                  ],
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
                                    currencyFormat
                                        .format(item.producto.precioVenta),
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
                        onPressed:
                            ventasProvider.isLoading ? null : _realizarVenta,
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

class _NuevoClienteDialog extends StatefulWidget {
  const _NuevoClienteDialog();

  @override
  State<_NuevoClienteDialog> createState() => _NuevoClienteDialogState();
}

class _NuevoClienteDialogState extends State<_NuevoClienteDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _documentoController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _emailController = TextEditingController();
  final _direccionController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nombreController.dispose();
    _documentoController.dispose();
    _telefonoController.dispose();
    _emailController.dispose();
    _direccionController.dispose();
    super.dispose();
  }

  Future<void> _guardarCliente() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final clientesProvider =
        Provider.of<ClientesProvider>(context, listen: false);

    final clienteData = {
      'nombre': _nombreController.text.trim(),
      'nit': _documentoController.text.trim().isEmpty
          ? null
          : _documentoController.text.trim(),
      'telefono': _telefonoController.text.trim().isEmpty
          ? null
          : _telefonoController.text.trim(),
      'email': _emailController.text.trim().isEmpty
          ? null
          : _emailController.text.trim(),
      'direccion': _direccionController.text.trim().isEmpty
          ? null
          : _direccionController.text.trim(),
    };

    final success = await clientesProvider.crearCliente(clienteData);

    if (mounted) {
      if (success) {
        Navigator.pop(context, true);
      } else {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              clientesProvider.error ?? 'Error al crear cliente',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Nuevo Cliente'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre *',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'El nombre es requerido';
                  }
                  return null;
                },
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _documentoController,
                decoration: const InputDecoration(
                  labelText: 'NIT / CI',
                  prefixIcon: Icon(Icons.badge),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _telefonoController,
                decoration: const InputDecoration(
                  labelText: 'Teléfono',
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value != null &&
                      value.isNotEmpty &&
                      !value.contains('@')) {
                    return 'Email inválido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección',
                  prefixIcon: Icon(Icons.location_on),
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context, false),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _guardarCliente,
          child: _isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Guardar'),
        ),
      ],
    );
  }
}
