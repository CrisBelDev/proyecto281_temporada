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

module.exports = Venta;
