const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DetalleVenta = sequelize.define(
	"DetalleVenta",
	{
		id_detalle_venta: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_venta: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "ventas",
				key: "id_venta",
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
		tableName: "detalle_ventas",
		timestamps: false,
	},
);

// Definir asociaciones
DetalleVenta.associate = (models) => {
	// Un detalle de venta pertenece a una venta
	DetalleVenta.belongsTo(models.Venta, {
		foreignKey: "id_venta",
		as: "venta",
	});

	// Un detalle de venta pertenece a un producto
	DetalleVenta.belongsTo(models.Producto, {
		foreignKey: "id_producto",
		as: "producto",
	});
};

module.exports = DetalleVenta;
