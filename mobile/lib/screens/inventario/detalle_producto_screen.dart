import 'package:flutter/material.dart';

class DetalleProductoScreen extends StatelessWidget {
  final String productoId;

  const DetalleProductoScreen({super.key, required this.productoId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle Producto')),
      body: Center(child: Text('Producto ID: $productoId')),
    );
  }
}
