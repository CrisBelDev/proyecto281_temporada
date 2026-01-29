import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/clientes_provider.dart';
import '../../config/theme.dart';

class ClientesScreen extends StatefulWidget {
  const ClientesScreen({super.key});

  @override
  State<ClientesScreen> createState() => _ClientesScreenState();
}

class _ClientesScreenState extends State<ClientesScreen> {
  final _searchController = TextEditingController();

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
    final provider = Provider.of<ClientesProvider>(context, listen: false);
    await provider.cargarClientes();
  }

  void _mostrarFormularioCliente({int? clienteId}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _FormularioCliente(clienteId: clienteId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      body: Column(
        children: [
          // Búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Buscar clientes...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),

          // Lista de clientes
          Expanded(
            child: Consumer<ClientesProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final clientes = _searchController.text.isEmpty
                    ? provider.clientes
                    : provider.buscarClientes(_searchController.text);

                if (clientes.isEmpty) {
                  return const Center(
                    child: Text('No se encontraron clientes'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: clientes.length,
                    itemBuilder: (context, index) {
                      final cliente = clientes[index];

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppTheme.primaryColor,
                            child: Text(
                              cliente.nombre[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(
                            cliente.nombre,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (cliente.documento != null)
                                Text(
                                  '${cliente.tipoDocumento ?? "Doc"}: ${cliente.documento}',
                                ),
                              if (cliente.telefono != null)
                                Text('Tel: ${cliente.telefono}'),
                              if (cliente.email != null)
                                Text('Email: ${cliente.email}'),
                            ],
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.edit),
                            onPressed: () => _mostrarFormularioCliente(
                              clienteId: cliente.id,
                            ),
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _mostrarFormularioCliente(),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo Cliente'),
      ),
    );
  }
}

class _FormularioCliente extends StatefulWidget {
  final int? clienteId;

  const _FormularioCliente({this.clienteId});

  @override
  State<_FormularioCliente> createState() => _FormularioClienteState();
}

class _FormularioClienteState extends State<_FormularioCliente> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _emailController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _direccionController = TextEditingController();
  final _nitController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.clienteId != null) {
      _cargarDatosCliente();
    }
  }

  Future<void> _cargarDatosCliente() async {
    setState(() => _isLoading = true);
    final provider = Provider.of<ClientesProvider>(context, listen: false);
    final cliente = await provider.obtenerClientePorId(widget.clienteId!);

    if (cliente != null && mounted) {
      _nombreController.text = cliente.nombre;
      _emailController.text = cliente.email ?? '';
      _telefonoController.text = cliente.telefono ?? '';
      _direccionController.text = cliente.direccion ?? '';
      _nitController.text = cliente.documento ?? '';
      setState(() => _isLoading = false);
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _emailController.dispose();
    _telefonoController.dispose();
    _direccionController.dispose();
    _nitController.dispose();
    super.dispose();
  }

  Future<void> _guardarCliente() async {
    if (!_formKey.currentState!.validate()) return;

    final provider = Provider.of<ClientesProvider>(context, listen: false);

    final clienteData = {
      'nombre': _nombreController.text.trim(),
      'email': _emailController.text.trim().isEmpty
          ? null
          : _emailController.text.trim(),
      'telefono': _telefonoController.text.trim().isEmpty
          ? null
          : _telefonoController.text.trim(),
      'direccion': _direccionController.text.trim().isEmpty
          ? null
          : _direccionController.text.trim(),
      'nit': _nitController.text.trim().isEmpty
          ? null
          : _nitController.text.trim(),
    };

    bool success;
    if (widget.clienteId != null) {
      success = await provider.actualizarCliente(
        widget.clienteId!,
        clienteData,
      );
    } else {
      success = await provider.crearCliente(clienteData);
    }

    if (mounted) {
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.clienteId != null
                  ? 'Cliente actualizado'
                  : 'Cliente creado exitosamente',
            ),
            backgroundColor: AppTheme.successColor,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.error ?? 'Error al guardar cliente'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(50),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.clienteId != null ? 'Editar Cliente' : 'Nuevo Cliente',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
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
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nitController,
                decoration: const InputDecoration(
                  labelText: 'NIT',
                  prefixIcon: Icon(Icons.badge),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _telefonoController,
                decoration: const InputDecoration(
                  labelText: 'Teléfono',
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección',
                  prefixIcon: Icon(Icons.location_on),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _guardarCliente,
                      child: const Text('Guardar'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
