class Venta {
  final int id;
  final String numeroFactura;
  final DateTime fecha;
  final double total;
  final String estado;
  final int idCliente;
  final int idUsuario;
  final int idEmpresa;
  final String? nombreCliente;
  final String? nombreUsuario;
  final List<DetalleVenta>? detalles;

  Venta({
    required this.id,
    required this.numeroFactura,
    required this.fecha,
    required this.total,
    required this.estado,
    required this.idCliente,
    required this.idUsuario,
    required this.idEmpresa,
    this.nombreCliente,
    this.nombreUsuario,
    this.detalles,
  });

  factory Venta.fromJson(Map<String, dynamic> json) {
    return Venta(
      id: json['id_venta'] ?? json['id'],
      numeroFactura: json['numero_factura'] ?? '',
      fecha: DateTime.parse(json['fecha']),
      total: (json['total'] ?? 0).toDouble(),
      estado: json['estado'] ?? 'COMPLETADA',
      idCliente: json['id_cliente'] ?? 0,
      idUsuario: json['id_usuario'] ?? 0,
      idEmpresa: json['id_empresa'] ?? 0,
      nombreCliente: json['Cliente']?['nombre'] ?? json['nombre_cliente'],
      nombreUsuario: json['Usuario']?['nombre'] ?? json['nombre_usuario'],
      detalles: json['DetalleVentas'] != null
          ? (json['DetalleVentas'] as List)
                .map((d) => DetalleVenta.fromJson(d))
                .toList()
          : null,
    );
  }

  bool get isAnulada => estado == 'ANULADA';
  bool get isEntregada => estado == 'ENTREGADA';
}

class DetalleVenta {
  final int id;
  final int cantidad;
  final double precioUnitario;
  final double subtotal;
  final int idProducto;
  final String? nombreProducto;

  DetalleVenta({
    required this.id,
    required this.cantidad,
    required this.precioUnitario,
    required this.subtotal,
    required this.idProducto,
    this.nombreProducto,
  });

  factory DetalleVenta.fromJson(Map<String, dynamic> json) {
    return DetalleVenta(
      id: json['id_detalle_venta'] ?? json['id'],
      cantidad: json['cantidad'] ?? 0,
      precioUnitario: (json['precio_unitario'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      idProducto: json['id_producto'] ?? 0,
      nombreProducto: json['Producto']?['nombre'] ?? json['nombre_producto'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_producto': idProducto,
      'cantidad': cantidad,
      'precio_unitario': precioUnitario,
    };
  }
}
