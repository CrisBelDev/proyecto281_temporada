# 🛒 MÓDULO DE VENTAS - DOCUMENTACIÓN COMPLETA

## 📋 Descripción General

El módulo de ventas permite gestionar las ventas de productos a clientes, con **actualización automática de stock** y soporte completo para multi-tenant (SUPERUSER puede gestionar ventas de todas las empresas).

---

## ✨ Funcionalidades Implementadas

### ✅ Características Principales

1. **Actualización Automática de Stock**
   - Al crear una venta, el stock de los productos se descuenta automáticamente
   - Al anular una venta, el stock se devuelve a los productos
   - Validación de stock disponible antes de procesar la venta

2. **Notificaciones Inteligentes**
   - Notificación cuando un producto se agota (stock = 0)
   - Notificación cuando un producto llega al stock mínimo
   - Notificación de venta creada exitosamente
   - Notificación de venta anulada

3. **Soporte Multi-Tenant**
   - Usuarios normales solo ven/crean ventas de su empresa
   - SUPERUSER puede ver ventas de todas las empresas
   - SUPERUSER puede filtrar ventas por empresa específica
   - SUPERUSER puede crear ventas para cualquier empresa

4. **Numeración Automática**
   - Cada empresa tiene su propia secuencia de numeración
   - Formato: `V-000001`, `V-000002`, etc.
   - No hay conflictos entre empresas

5. **Gestión de Clientes**
   - Las ventas pueden asociarse a un cliente (opcional)
   - Validación de que el cliente pertenezca a la empresa

---

## 🔌 API Endpoints

### 1. Listar Ventas

**GET** `/api/ventas`

**Query Parameters:**

- `empresa_id` (opcional, solo SUPERUSER): ID de la empresa a filtrar

**Headers:**

```json
{
	"Authorization": "Bearer <token>"
}
```

**Respuesta Exitosa (200):**

```json
{
	"success": true,
	"data": [
		{
			"id_venta": 1,
			"numero_venta": "V-000001",
			"fecha_venta": "2026-01-22T10:30:00.000Z",
			"subtotal": 100.0,
			"descuento": 10.0,
			"total": 90.0,
			"metodo_pago": "EFECTIVO",
			"estado": "COMPLETADA",
			"observaciones": null,
			"cliente": {
				"id_cliente": 1,
				"nombre": "Juan Pérez",
				"telefono": "70123456"
			},
			"usuario": {
				"id_usuario": 2,
				"nombre": "María",
				"apellido": "López"
			},
			"empresa": {
				"id_empresa": 1,
				"nombre": "emapa",
				"slug": "emapa"
			},
			"detalles": [
				{
					"id_detalle_venta": 1,
					"cantidad": 2,
					"precio_unitario": 50.0,
					"subtotal": 100.0,
					"producto": {
						"id_producto": 1,
						"nombre": "Producto A",
						"codigo": "PROD-001"
					}
				}
			]
		}
	],
	"total": 1
}
```

---

### 2. Ver Detalle de Venta

**GET** `/api/ventas/:id`

**Headers:**

```json
{
	"Authorization": "Bearer <token>"
}
```

**Respuesta Exitosa (200):**

```json
{
	"success": true,
	"data": {
		"id_venta": 1,
		"numero_venta": "V-000001"
		// ... mismo formato que en listar
	}
}
```

**Errores:**

- `404`: Venta no encontrada

---

### 3. Crear Venta ⭐

**POST** `/api/ventas`

**Headers:**

```json
{
	"Authorization": "Bearer <token>",
	"Content-Type": "application/json"
}
```

**Body:**

```json
{
	"id_cliente": 1,
	"id_empresa": 1,
	"metodo_pago": "EFECTIVO",
	"descuento": 0,
	"observaciones": "Venta de prueba",
	"productos": [
		{
			"id_producto": 1,
			"cantidad": 2
		},
		{
			"id_producto": 2,
			"cantidad": 1
		}
	]
}
```

**Campos:**

- `id_cliente` (opcional): ID del cliente
- `id_empresa` (opcional, solo SUPERUSER): ID de la empresa (si no se especifica, usa la empresa del usuario)
- `metodo_pago` (opcional): EFECTIVO, TARJETA, TRANSFERENCIA (default: EFECTIVO)
- `descuento` (opcional): Monto de descuento en Bs. (default: 0)
- `observaciones` (opcional): Notas adicionales
- **`productos` (requerido)**: Array de productos a vender
  - `id_producto` (requerido): ID del producto
  - `cantidad` (requerido): Cantidad a vender

**Respuesta Exitosa (201):**

```json
{
	"success": true,
	"mensaje": "Venta registrada exitosamente",
	"data": {
		"id_venta": 1,
		"numero_venta": "V-000001",
		"fecha_venta": "2026-01-22T10:30:00.000Z",
		"subtotal": 100.0,
		"descuento": 0.0,
		"total": 100.0,
		"metodo_pago": "EFECTIVO",
		"estado": "COMPLETADA"
		// ... incluye relaciones completas
	}
}
```

**Errores:**

- `400`: Debe incluir al menos un producto
- `400`: Stock insuficiente para el producto
- `400`: El producto no está activo
- `404`: Cliente no encontrado en esta empresa
- `404`: Producto no encontrado en esta empresa

**⚡ Acciones Automáticas:**

1. ✅ Descuenta el stock de cada producto vendido
2. ✅ Genera número de venta único por empresa
3. ✅ Calcula subtotales y total automáticamente
4. ✅ Crea notificación de venta
5. ✅ Crea notificación si algún producto queda sin stock
6. ✅ Crea notificación si algún producto queda con stock bajo

---

### 4. Anular Venta ⭐

**PUT** `/api/ventas/:id`

**Headers:**

```json
{
	"Authorization": "Bearer <token>"
}
```

**Respuesta Exitosa (200):**

```json
{
	"success": true,
	"mensaje": "Venta anulada exitosamente. Stock devuelto a los productos.",
	"data": {
		"id_venta": 1,
		"numero_venta": "V-000001",
		"estado": "ANULADA"
		// ... resto de datos
	}
}
```

**Errores:**

- `400`: La venta ya está anulada
- `404`: Venta no encontrada

**⚡ Acciones Automáticas:**

1. ✅ Devuelve el stock a todos los productos de la venta
2. ✅ Cambia el estado de la venta a "ANULADA"
3. ✅ Crea notificación de venta anulada

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Crear Venta Simple (Usuario Normal)

```bash
POST /api/ventas
Authorization: Bearer eyJhbGc...

{
  "id_cliente": 1,
  "metodo_pago": "EFECTIVO",
  "productos": [
    {
      "id_producto": 1,
      "cantidad": 2
    }
  ]
}
```

### Ejemplo 2: Crear Venta con Descuento (SUPERUSER)

```bash
POST /api/ventas
Authorization: Bearer eyJhbGc...

{
  "id_empresa": 1,
  "id_cliente": 2,
  "metodo_pago": "TARJETA",
  "descuento": 15.50,
  "observaciones": "Cliente frecuente - 10% descuento",
  "productos": [
    {
      "id_producto": 1,
      "cantidad": 5
    },
    {
      "id_producto": 3,
      "cantidad": 2
    }
  ]
}
```

### Ejemplo 3: Listar Ventas de una Empresa (SUPERUSER)

```bash
GET /api/ventas?empresa_id=1
Authorization: Bearer eyJhbGc...
```

### Ejemplo 4: Anular Venta

```bash
PUT /api/ventas/1
Authorization: Bearer eyJhbGc...
```

---

## 📊 Flujo de una Venta

```
1. Cliente solicita productos
   ↓
2. Usuario crea venta en el sistema (POST /api/ventas)
   ↓
3. Sistema valida:
   - Productos existen en la empresa
   - Productos están activos
   - Stock suficiente disponible
   ↓
4. Sistema procesa:
   - Genera número de venta (V-000001)
   - Calcula subtotales y total
   - Descuenta stock de productos
   - Crea venta en BD
   - Crea detalles de venta
   ↓
5. Sistema notifica:
   - Venta creada exitosamente
   - Stock bajo (si aplica)
   - Stock agotado (si aplica)
   ↓
6. Respuesta con venta completa
```

---

## 🔍 Validaciones Implementadas

### Al Crear Venta:

1. **Productos:**
   - Debe incluir al menos un producto
   - El producto debe existir en la empresa
   - El producto debe estar activo
   - Debe haber stock suficiente

2. **Cliente:**
   - Si se especifica, debe existir en la empresa

3. **Empresa:**
   - Usuarios normales: Se usa su empresa automáticamente
   - SUPERUSER: Puede especificar cualquier empresa

### Al Anular Venta:

1. La venta debe existir
2. La venta no debe estar ya anulada
3. Usuarios normales solo pueden anular ventas de su empresa
4. SUPERUSER puede anular ventas de cualquier empresa

---

## 📈 Actualización de Stock

### Descuento de Stock (Crear Venta)

```javascript
// Antes de la venta
Producto "Camisa" → stock_actual: 10

// Se vende 3 unidades
POST /api/ventas
{
  "productos": [
    { "id_producto": 1, "cantidad": 3 }
  ]
}

// Después de la venta
Producto "Camisa" → stock_actual: 7

// Log en consola del servidor:
📦 Producto "Camisa": Stock 10 → 7 (vendidos: 3)
```

### Devolución de Stock (Anular Venta)

```javascript
// Antes de anular
Producto "Camisa" → stock_actual: 7

// Se anula venta de 3 unidades
PUT /api/ventas/1

// Después de anular
Producto "Camisa" → stock_actual: 10

// Log en consola del servidor:
📦 Stock devuelto - Producto "Camisa": 7 → 10 (+3)
```

---

## 🔔 Notificaciones Generadas

### 1. Venta Creada

```json
{
	"tipo": "VENTA",
	"titulo": "Nueva venta registrada",
	"mensaje": "Venta V-000001 completada por un total de Bs. 150.00"
}
```

### 2. Stock Agotado

```json
{
	"tipo": "STOCK_AGOTADO",
	"titulo": "Producto sin stock",
	"mensaje": "El producto \"Camisa Azul\" se agotó tras una venta. Stock actual: 0"
}
```

### 3. Stock Bajo

```json
{
	"tipo": "STOCK_BAJO",
	"titulo": "Stock bajo",
	"mensaje": "El producto \"Camisa Azul\" tiene stock bajo (3 unidades, mínimo: 5)"
}
```

### 4. Venta Anulada

```json
{
	"tipo": "VENTA",
	"titulo": "Venta anulada",
	"mensaje": "La venta V-000001 fue anulada. Stock devuelto a los productos."
}
```

---

## 🛡️ Seguridad

- **Autenticación requerida**: Todos los endpoints requieren token JWT válido
- **Autorización por empresa**: Los usuarios solo pueden acceder a ventas de su empresa
- **SUPERUSER**: Puede acceder a ventas de todas las empresas
- **Transacciones**: Todas las operaciones usan transacciones de BD para garantizar consistencia

---

## 🎯 Estados de Venta

- `COMPLETADA`: Venta procesada exitosamente
- `ANULADA`: Venta anulada (stock devuelto)

---

## 📝 Notas Importantes

1. **Stock en Tiempo Real**: El stock se actualiza inmediatamente al crear/anular ventas
2. **Numeración Independiente**: Cada empresa tiene su propia secuencia de números de venta
3. **Transacciones Atómicas**: Si falla alguna parte del proceso, todo se revierte (rollback)
4. **Logs en Consola**: El servidor muestra logs de cambios de stock para facilitar debugging
5. **Cliente Opcional**: Las ventas pueden crearse sin asociar a un cliente específico

---

## 🧪 Testing

Para probar el módulo de ventas, ejecutar:

```bash
node verificar-modulo-ventas.js
```

Este script muestra:

- ✅ Empresas disponibles
- ✅ Productos con stock
- ✅ Clientes registrados
- ✅ Últimas ventas
- ✅ Endpoints disponibles
- ✅ Ejemplo de payload

---

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Reportes de ventas por período
- [ ] Métricas y estadísticas
- [ ] Exportar ventas a PDF
- [ ] Historial de cambios de stock
- [ ] Ventas a crédito
- [ ] Devoluciones parciales

---

**✅ Módulo de Ventas Completo y Funcional**
