# Sistema Multi-Tenant - Gestión de Clientes

## Concepto de Multi-Tenancy (id_tenant)

- **id_tenant = id_empresa**: Identificador único de cada microempresa/tenant
- **En tabla empresas**: `id_empresa` es PRIMARY KEY (PK)
- **En tabla clientes**: `id_empresa` es FOREIGN KEY (FK)
- **Aislamiento de datos**: Cada empresa solo ve sus propios clientes

## Configuración del Modelo

```javascript
// backend/src/models/Cliente.js
const Cliente = sequelize.define(
	"Cliente",
	{
		id_empresa: {
			// id_tenant - FK hacia empresas
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "empresas",
				key: "id_empresa",
			},
			comment: "ID Tenant - Referencia a la microempresa/empresa",
		},
		// ... otros campos
	},
	{
		paranoid: true, // Habilita soft delete
		deletedAt: "fecha_eliminacion",
	},
);
```

## Los 5 Puntos Solicitados

### PUNTO 1: Registrar cliente con datos "abc" y "111"

**Request:**

```http
POST /api/clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "abc",
  "nit": "111"
}
```

**Response:**

```json
{
	"success": true,
	"mensaje": "Cliente creado exitosamente",
	"data": {
		"id_cliente": 1,
		"id_empresa": 1,
		"id_tenant": 1, // ← Muestra explícitamente el id_tenant
		"nombre": "abc",
		"nit": "111",
		"activo": true,
		"fecha_creacion": "2026-01-18T10:00:00.000Z",
		"fecha_actualizacion": "2026-01-18T10:00:00.000Z"
	}
}
```

**Código del controlador:**

```javascript
exports.crear = async (req, res) => {
	const { nombre, nit } = req.body;
	// ID_TENANT: Se obtiene del usuario autenticado
	const id_tenant = req.usuario.id_empresa;

	const nuevoCliente = await Cliente.create({
		id_empresa: id_tenant, // FK hacia empresas
		nombre,
		nit,
		activo: true,
	});

	return res.json({
		success: true,
		data: {
			...nuevoCliente.toJSON(),
			id_tenant: nuevoCliente.id_empresa, // Mostrar id_tenant
		},
	});
};
```

---

### PUNTO 2: Modificar datos del cliente "abc" por "taller"

**Request:**

```http
PUT /api/clientes/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "taller"
}
```

**Response:**

```json
{
	"success": true,
	"mensaje": "Cliente actualizado exitosamente",
	"data": {
		"id_cliente": 1,
		"id_tenant": 1,
		"nombre": "taller", // ← Actualizado de "abc" a "taller"
		"nit": "111",
		"fecha_actualizacion": "2026-01-18T10:05:00.000Z"
	}
}
```

**Código del controlador:**

```javascript
exports.actualizar = async (req, res) => {
	const { id } = req.params;
	const { nombre } = req.body;
	const id_tenant = req.usuario.id_empresa;

	// Buscar SOLO en el contexto del tenant
	const cliente = await Cliente.findOne({
		where: {
			id_cliente: id,
			id_empresa: id_tenant, // Filtro por tenant
		},
	});

	await cliente.update({ nombre });

	return res.json({
		success: true,
		data: {
			...cliente.toJSON(),
			id_tenant: cliente.id_empresa,
		},
	});
};
```

---

### PUNTO 3: Buscar todos los clientes de la microempresa "sistoys"

**Request:**

```http
GET /api/clientes
Authorization: Bearer {token_de_usuario_sistoys}
```

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id_cliente": 1,
			"id_tenant": 5,
			"nombre": "taller",
			"nit": "111",
			"empresa": {
				"id_empresa": 5,
				"nombre": "sistoys"
			}
		},
		{
			"id_cliente": 2,
			"id_tenant": 5,
			"nombre": "Cliente 2",
			"nit": "222",
			"empresa": {
				"id_empresa": 5,
				"nombre": "sistoys"
			}
		}
	],
	"tenant_info": {
		"id_tenant": 5,
		"mensaje": "Clientes filtrados por empresa/tenant"
	}
}
```

**Código del controlador:**

```javascript
exports.obtenerTodos = async (req, res) => {
	// ID_TENANT: Se obtiene automáticamente del JWT
	const id_tenant = req.usuario.id_empresa;

	const clientes = await Cliente.findAll({
		where: { id_empresa: id_tenant }, // Filtro automático por tenant
		include: [
			{
				model: Empresa,
				as: "empresa",
				attributes: ["id_empresa", "nombre"],
			},
		],
		order: [["fecha_creacion", "DESC"]],
	});

	return res.json({
		success: true,
		data: clientes.map((c) => ({
			...c.toJSON(),
			id_tenant: c.id_empresa,
		})),
		tenant_info: {
			id_tenant: id_tenant,
			mensaje: "Clientes filtrados por empresa/tenant",
		},
	});
};
```

**Diagrama del aislamiento:**

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Empresa 1      │      │  Empresa 2      │      │  Empresa 5      │
│  (id_tenant=1)  │      │  (id_tenant=2)  │      │  (id_tenant=5)  │
│  "Mi Empresa"   │      │  "Otra SA"      │      │  "sistoys"      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼─────┐            ┌────▼─────┐            ┌────▼─────┐
    │ Cliente A│            │ Cliente X│            │ taller   │
    │ (id=1)   │            │ (id=2)   │            │ (id=1)   │
    └──────────┘            └──────────┘            └──────────┘
    ┌──────────┐            ┌──────────┐            ┌──────────┐
    │ Cliente B│            │ Cliente Y│            │ Cliente 2│
    │ (id=3)   │            │ (id=4)   │            │ (id=2)   │
    └──────────┘            └──────────┘            └──────────┘

Cada tenant solo ve sus propios clientes
```

---

### PUNTO 4: Eliminar cliente creado en el punto 1

**Request:**

```http
DELETE /api/clientes/1
Authorization: Bearer {token}
```

**Response:**

```json
{
	"success": true,
	"mensaje": "Cliente eliminado exitosamente (soft delete)",
	"data": {
		"id_cliente": 1,
		"nombre": "taller",
		"id_tenant": 1,
		"tipo_eliminacion": "soft_delete"
	}
}
```

**Código del controlador:**

```javascript
exports.eliminar = async (req, res) => {
	const { id } = req.params;
	const id_tenant = req.usuario.id_empresa;

	const cliente = await Cliente.findOne({
		where: { id_cliente: id, id_empresa: id_tenant },
	});

	// Soft delete: establece fecha_eliminacion sin borrar físicamente
	await cliente.destroy();

	return res.json({
		success: true,
		mensaje: "Cliente eliminado exitosamente (soft delete)",
		data: {
			id_cliente: cliente.id_cliente,
			nombre: cliente.nombre,
			id_tenant: cliente.id_empresa,
			tipo_eliminacion: "soft_delete",
		},
	});
};
```

**Estado en la base de datos:**

```sql
-- Antes del DELETE
SELECT id_cliente, nombre, activo, fecha_eliminacion
FROM clientes WHERE id_cliente = 1;
-- Resultado: 1, 'taller', 1, NULL

-- Después del DELETE (soft delete)
SELECT id_cliente, nombre, activo, fecha_eliminacion
FROM clientes WHERE id_cliente = 1;
-- Resultado: 1, 'taller', 1, '2026-01-18 10:10:00'
--                               ↑ Tiene fecha de eliminación
```

---

### PUNTO 5: Mostrar los eliminados de la tabla clientes

**Request:**

```http
GET /api/clientes/eliminados
Authorization: Bearer {token}
```

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"id_cliente": 1,
			"id_tenant": 1,
			"nombre": "taller",
			"nit": "111",
			"fecha_eliminacion": "2026-01-18T10:10:00.000Z",
			"empresa": {
				"id_empresa": 1,
				"nombre": "Mi Empresa"
			}
		},
		{
			"id_cliente": 5,
			"id_tenant": 1,
			"nombre": "Cliente Viejo",
			"nit": "999",
			"fecha_eliminacion": "2026-01-15T14:30:00.000Z",
			"empresa": {
				"id_empresa": 1,
				"nombre": "Mi Empresa"
			}
		}
	],
	"total_eliminados": 2,
	"tenant_info": {
		"id_tenant": 1,
		"mensaje": "Clientes eliminados (soft delete) de esta empresa"
	}
}
```

**Código del controlador:**

```javascript
exports.obtenerEliminados = async (req, res) => {
	const id_tenant = req.usuario.id_empresa;

	// paranoid: false permite ver registros con fecha_eliminacion
	const clientesEliminados = await Cliente.findAll({
		where: { id_empresa: id_tenant },
		include: [
			{
				model: Empresa,
				as: "empresa",
				attributes: ["id_empresa", "nombre"],
			},
		],
		paranoid: false, // Incluye registros eliminados
		order: [["fecha_eliminacion", "DESC"]],
	});

	// Filtrar solo los que tienen fecha_eliminacion
	const soloEliminados = clientesEliminados.filter(
		(c) => c.fecha_eliminacion !== null,
	);

	return res.json({
		success: true,
		data: soloEliminados.map((c) => ({
			...c.toJSON(),
			id_tenant: c.id_empresa,
		})),
		total_eliminados: soloEliminados.length,
		tenant_info: {
			id_tenant: id_tenant,
			mensaje: "Clientes eliminados (soft delete) de esta empresa",
		},
	});
};
```

---

## Resumen de Rutas

| Método | Ruta                          | Descripción             | Punto |
| ------ | ----------------------------- | ----------------------- | ----- |
| POST   | `/api/clientes`               | Crear cliente           | 1     |
| PUT    | `/api/clientes/:id`           | Actualizar cliente      | 2     |
| GET    | `/api/clientes`               | Listar clientes activos | 3     |
| DELETE | `/api/clientes/:id`           | Eliminar (soft delete)  | 4     |
| GET    | `/api/clientes/eliminados`    | Ver eliminados          | 5     |
| PATCH  | `/api/clientes/:id/restaurar` | Restaurar eliminado     | BONUS |

## Ventajas del Multi-Tenancy

1. **Aislamiento de datos**: Cada empresa solo ve sus clientes
2. **Seguridad**: Filtro automático por id_tenant
3. **Escalabilidad**: Una sola base de datos para múltiples empresas
4. **Soft Delete**: Recuperación de datos eliminados por error
5. **Auditoría**: Historial completo de eliminaciones

## SQL de Ejemplo

```sql
-- Ver todos los clientes por tenant
SELECT
    e.nombre as empresa,
    c.nombre as cliente,
    c.nit,
    CASE
        WHEN c.fecha_eliminacion IS NULL THEN 'ACTIVO'
        ELSE 'ELIMINADO'
    END as estado
FROM clientes c
INNER JOIN empresas e ON c.id_empresa = e.id_empresa
WHERE e.id_empresa = 1  -- id_tenant
ORDER BY c.fecha_eliminacion DESC, c.fecha_creacion DESC;
```
