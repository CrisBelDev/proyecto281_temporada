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
      numeroFactura: json['numero_venta'] ?? json['numero_factura'] ?? '',
      fecha: DateTime.parse(json['fecha_venta'] ?? json['fecha']),
      total: double.parse(json['total'].toString()),
      estado: json['estado'] ?? 'COMPLETADA',
      idCliente: json['id_cliente'] ?? 0,
      idUsuario: json['id_usuario'] ?? 0,
      idEmpresa: json['id_empresa'] ?? 0,
      nombreCliente: json['cliente']?['nombre'] ??
          json['Cliente']?['nombre'] ??
          json['nombre_cliente'],
      nombreUsuario: json['usuario']?['nombre'] ??
          json['Usuario']?['nombre'] ??
          json['nombre_usuario'],
      detalles: json['detalles'] != null
          ? (json['detalles'] as List)
              .map((d) => DetalleVenta.fromJson(d))
              .toList()
          : json['DetalleVentas'] != null
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
      precioUnitario: double.parse(json['precio_unitario'].toString()),
      subtotal: double.parse(json['subtotal'].toString()),
      idProducto: json['id_producto'] ?? 0,
      nombreProducto: json['producto']?['nombre'] ??
          json['Producto']?['nombre'] ??
          json['nombre_producto'],
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
