class Notificacion {
  final int id;
  final String tipo;
  final String titulo;
  final String mensaje;
  final bool leida;
  final DateTime fecha;
  final Map<String, dynamic>? datos;

  Notificacion({
    required this.id,
    required this.tipo,
    required this.titulo,
    required this.mensaje,
    required this.leida,
    required this.fecha,
    this.datos,
  });

  factory Notificacion.fromJson(Map<String, dynamic> json) {
    return Notificacion(
      id: json['id_notificacion'] ?? json['id'],
      tipo: json['tipo'] ?? '',
      titulo: json['titulo'] ?? '',
      mensaje: json['mensaje'] ?? '',
      leida: json['leida'] == 1 || json['leida'] == true,
      fecha: DateTime.parse(json['fecha_creacion'] ?? json['fecha']),
      datos: json['datos'],
    );
  }

  // Tipos de notificación según la base de datos
  bool get isStockBajo => tipo == 'STOCK_BAJO';
  bool get isStockAgotado => tipo == 'STOCK_AGOTADO';
  bool get isVenta => tipo == 'VENTA';
  bool get isCompra => tipo == 'COMPRA';
  bool get isSistema => tipo == 'SISTEMA';
}
