import 'package:flutter/material.dart';

class DetalleClienteScreen extends StatelessWidget {
  final String clienteId;

  const DetalleClienteScreen({super.key, required this.clienteId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle Cliente')),
      body: Center(child: Text('Cliente ID: $clienteId')),
    );
  }
}
