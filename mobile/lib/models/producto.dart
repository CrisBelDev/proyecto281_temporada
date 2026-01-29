class Producto {
  final int id;
  final String nombre;
  final String? descripcion;
  final String codigo;
  final double precioVenta;
  final double precioCompra;
  final int stock;
  final int stockMinimo;
  final String? imagen;
  final bool activo;
  final int idCategoria;
  final int idEmpresa;
  final String? nombreCategoria;
  final DateTime? fechaCreacion;
  final DateTime? fechaActualizacion;

  Producto({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.codigo,
    required this.precioVenta,
    required this.precioCompra,
    required this.stock,
    required this.stockMinimo,
    this.imagen,
    required this.activo,
    required this.idCategoria,
    required this.idEmpresa,
    this.nombreCategoria,
    this.fechaCreacion,
    this.fechaActualizacion,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id_producto'] ?? json['id'],
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      codigo: json['codigo'] ?? '',
      precioVenta: double.parse(
          (json['precio_venta'] ?? json['precio'] ?? 0).toString()),
      precioCompra: double.parse((json['precio_compra'] ?? 0).toString()),
      stock: int.parse((json['stock_actual'] ?? json['stock'] ?? 0).toString()),
      stockMinimo: int.parse((json['stock_minimo'] ?? 0).toString()),
      imagen: json['imagen'],
      activo: json['activo'] == 1 || json['activo'] == true,
      idCategoria: int.parse((json['id_categoria'] ?? 0).toString()),
      idEmpresa: int.parse((json['id_empresa'] ?? 0).toString()),
      nombreCategoria: json['Categoria']?['nombre'] ?? json['nombre_categoria'],
      fechaCreacion: json['fecha_creacion'] != null
          ? DateTime.parse(json['fecha_creacion'])
          : null,
      fechaActualizacion: json['fecha_actualizacion'] != null
          ? DateTime.parse(json['fecha_actualizacion'])
          : null,
    );
  }

  bool get stockBajo => stock <= stockMinimo;
  bool get sinStock => stock == 0;

  // Margen de ganancia en porcentaje
  double get margenGanancia {
    if (precioCompra == 0) return 0;
    return ((precioVenta - precioCompra) / precioCompra) * 100;
  }

  // Ganancia por unidad
  double get gananciaPorUnidad => precioVenta - precioCompra;

  // Valor total del inventario (stock * precio compra)
  double get valorInventario => stock * precioCompra;

  // Ganancia potencial (stock * ganancia por unidad)
  double get gananciaPotencial => stock * gananciaPorUnidad;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'descripcion': descripcion,
      'codigo': codigo,
      'precio_venta': precioVenta,
      'precio_compra': precioCompra,
      'stock': stock,
      'stock_minimo': stockMinimo,
      'imagen': imagen,
      'activo': activo,
      'id_categoria': idCategoria,
    };
  }
}
