class Cliente {
  final int id;
  final String nombre;
  final String? email;
  final String? telefono;
  final String? direccion;
  final String? documento;
  final String? tipoDocumento;
  final bool activo;
  final int idEmpresa;

  Cliente({
    required this.id,
    required this.nombre,
    this.email,
    this.telefono,
    this.direccion,
    this.documento,
    this.tipoDocumento,
    required this.activo,
    required this.idEmpresa,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) {
    return Cliente(
      id: json['id_cliente'] ?? json['id'],
      nombre: json['nombre'] ?? '',
      email: json['email'],
      telefono: json['telefono'],
      direccion: json['direccion'],
      documento: json['nit'] ?? json['documento'],
      tipoDocumento: json['tipo_documento'],
      activo: json['activo'] ?? true,
      idEmpresa: json['id_empresa'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre': nombre,
      'email': email,
      'telefono': telefono,
      'direccion': direccion,
      'documento': documento,
      'tipo_documento': tipoDocumento,
      'activo': activo,
    };
  }
}
