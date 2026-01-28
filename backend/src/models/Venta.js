const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Venta = sequelize.define(
	"Venta",
	{
		id_venta: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_empresa: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "empresas",
				key: "id_empresa",
			},
		},
		id_usuario: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "usuarios",
				key: "id_usuario",
			},
		},
		id_cliente: {
			type: DataTypes.INTEGER,
			references: {
				model: "clientes",
				key: "id_cliente",
			},
		},
		numero_venta: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		fecha_venta: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		subtotal: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		descuento: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		total: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		metodo_pago: {
			type: DataTypes.ENUM("EFECTIVO", "QR", "TARJETA"),
			defaultValue: "EFECTIVO",
		},
		estado: {
			type: DataTypes.ENUM("COMPLETADA", "ANULADA"),
			defaultValue: "COMPLETADA",
		},
		estado_entrega: {
			type: DataTypes.ENUM("PENDIENTE", "ENTREGADO"),
			defaultValue: "PENDIENTE",
		},
		observaciones: {
			type: DataTypes.TEXT,
		},
	},
	{
		tableName: "ventas",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		indexes: [
			{
				unique: true,
				fields: ["id_empresa", "numero_venta"],
			},
		],
	},
);

// Definir asociaciones
Venta.associate = (models) => {
	// Una venta pertenece a una empresa
	Venta.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Una venta pertenece a un usuario
	Venta.belongsTo(models.Usuario, {
		foreignKey: "id_usuario",
		as: "usuario",
	});

	// Una venta pertenece a un cliente
	Venta.belongsTo(models.Cliente, {
		foreignKey: "id_cliente",
		as: "cliente",
	});

	// Una venta tiene muchos detalles
	Venta.hasMany(models.DetalleVenta, {
		foreignKey: "id_venta",
		as: "detalles",
	});
};

module.exports = Venta;
