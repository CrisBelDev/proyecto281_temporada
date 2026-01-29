import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../providers/productos_provider.dart';
import '../../models/producto.dart';
import '../../utils/image_helper.dart';

class ProductoFormScreen extends StatefulWidget {
  final String? productoId;

  const ProductoFormScreen({super.key, this.productoId});

  @override
  State<ProductoFormScreen> createState() => _ProductoFormScreenState();
}

class _ProductoFormScreenState extends State<ProductoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codigoController = TextEditingController();
  final _nombreController = TextEditingController();
  final _descripcionController = TextEditingController();
  final _precioCompraController = TextEditingController();
  final _precioVentaController = TextEditingController();
  final _stockActualController = TextEditingController();
  final _stockMinimoController = TextEditingController();

  bool _isLoading = false;
  File? _imagenSeleccionada;
  String? _imagenActual;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    if (widget.productoId != null) {
      _cargarProducto();
    }
  }

  @override
  void dispose() {
    _codigoController.dispose();
    _nombreController.dispose();
    _descripcionController.dispose();
    _precioCompraController.dispose();
    _precioVentaController.dispose();
    _stockActualController.dispose();
    _stockMinimoController.dispose();
    super.dispose();
  }

  Future<void> _cargarProducto() async {
    setState(() => _isLoading = true);
    final provider = Provider.of<ProductosProvider>(context, listen: false);
    final producto =
        await provider.obtenerProductoPorId(int.parse(widget.productoId!));

    if (producto != null && mounted) {
      setState(() {
        _codigoController.text = producto.codigo;
        _nombreController.text = producto.nombre;
        _descripcionController.text = producto.descripcion ?? '';
        _precioCompraController.text = producto.precioCompra.toString();
        _precioVentaController.text = producto.precioVenta.toString();
        _stockActualController.text = producto.stock.toString();
        _stockMinimoController.text = producto.stockMinimo.toString();
        _imagenActual = producto.imagen;
        _isLoading = false;
      });
    }
  }

  Future<void> _seleccionarImagen() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _imagenSeleccionada = File(image.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al seleccionar imagen: $e')),
        );
      }
    }
  }

  Future<void> _tomarFoto() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _imagenSeleccionada = File(image.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al tomar foto: $e')),
        );
      }
    }
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final provider = Provider.of<ProductosProvider>(context, listen: false);

      final datos = {
        'codigo': _codigoController.text,
        'nombre': _nombreController.text,
        'descripcion': _descripcionController.text,
        'precio_compra': double.parse(_precioCompraController.text),
        'precio_venta': double.parse(_precioVentaController.text),
        'stock_actual': int.parse(_stockActualController.text),
        'stock_minimo': int.parse(_stockMinimoController.text),
      };

      if (widget.productoId == null) {
        await provider.crearProducto(datos, imagen: _imagenSeleccionada);
      } else {
        await provider.actualizarProducto(
          int.parse(widget.productoId!),
          datos,
          imagen: _imagenSeleccionada,
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.productoId == null
                ? 'Producto creado exitosamente'
                : 'Producto actualizado exitosamente'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildImagenPreview() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(12),
      ),
      child: _imagenSeleccionada != null
          ? ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                _imagenSeleccionada!,
                fit: BoxFit.cover,
              ),
            )
          : _imagenActual != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    ImageHelper.getImageUrl(_imagenActual)!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => ImageHelper.getPlaceholder(),
                  ),
                )
              : ImageHelper.getPlaceholder(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
            widget.productoId == null ? 'Nuevo Producto' : 'Editar Producto'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Imagen
                    _buildImagenPreview(),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _seleccionarImagen,
                            icon: const Icon(Icons.photo_library),
                            label: const Text('Galería'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _tomarFoto,
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Cámara'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Código
                    TextFormField(
                      controller: _codigoController,
                      decoration: const InputDecoration(
                        labelText: 'Código *',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El código es requerido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Nombre
                    TextFormField(
                      controller: _nombreController,
                      decoration: const InputDecoration(
                        labelText: 'Nombre *',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El nombre es requerido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Descripción
                    TextFormField(
                      controller: _descripcionController,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),

                    // Precio Compra
                    TextFormField(
                      controller: _precioCompraController,
                      decoration: const InputDecoration(
                        labelText: 'Precio Compra *',
                        border: OutlineInputBorder(),
                        prefixText: 'Bs. ',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El precio de compra es requerido';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Ingrese un precio válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Precio Venta
                    TextFormField(
                      controller: _precioVentaController,
                      decoration: const InputDecoration(
                        labelText: 'Precio Venta *',
                        border: OutlineInputBorder(),
                        prefixText: 'Bs. ',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El precio de venta es requerido';
                        }
                        if (double.tryParse(value) == null) {
                          return 'Ingrese un precio válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Stock Actual
                    TextFormField(
                      controller: _stockActualController,
                      decoration: const InputDecoration(
                        labelText: 'Stock Actual *',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El stock actual es requerido';
                        }
                        if (int.tryParse(value) == null) {
                          return 'Ingrese un stock válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Stock Mínimo
                    TextFormField(
                      controller: _stockMinimoController,
                      decoration: const InputDecoration(
                        labelText: 'Stock Mínimo *',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'El stock mínimo es requerido';
                        }
                        if (int.tryParse(value) == null) {
                          return 'Ingrese un stock válido';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Botón Guardar
                    ElevatedButton(
                      onPressed: _isLoading ? null : _guardar,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(widget.productoId == null
                              ? 'Crear Producto'
                              : 'Actualizar'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
