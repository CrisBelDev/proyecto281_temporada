const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DetalleCompra = sequelize.define(
	"DetalleCompra",
	{
		id_detalle_compra: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_compra: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "compras",
				key: "id_compra",
			},
		},
		id_producto: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "productos",
				key: "id_producto",
			},
		},
		cantidad: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		precio_unitario: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		subtotal: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
	},
	{
		tableName: "detalle_compras",
		timestamps: false,
	},
);

module.exports = DetalleCompra;
