class Producto {
  final int id;
  final String nombre;
  final String? descripcion;
  final double precio;
  final int stock;
  final int stockMinimo;
  final String? codigoBarras;
  final String? imagen;
  final bool activo;
  final int idCategoria;
  final int idEmpresa;
  final String? nombreCategoria;

  Producto({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.precio,
    required this.stock,
    required this.stockMinimo,
    this.codigoBarras,
    this.imagen,
    required this.activo,
    required this.idCategoria,
    required this.idEmpresa,
    this.nombreCategoria,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id_producto'] ?? json['id'],
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      precio: (json['precio'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      stockMinimo: json['stock_minimo'] ?? 0,
      codigoBarras: json['codigo_barras'],
      imagen: json['imagen'],
      activo: json['activo'] ?? true,
      idCategoria: json['id_categoria'] ?? 0,
      idEmpresa: json['id_empresa'] ?? 0,
      nombreCategoria: json['Categoria']?['nombre'] ?? json['nombre_categoria'],
    );
  }

  bool get stockBajo => stock <= stockMinimo;
  bool get sinStock => stock == 0;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'descripcion': descripcion,
      'precio': precio,
      'stock': stock,
      'stock_minimo': stockMinimo,
      'codigo_barras': codigoBarras,
      'imagen': imagen,
      'activo': activo,
      'id_categoria': idCategoria,
    };
  }
}
