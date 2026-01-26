const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProveedorProducto = sequelize.define(
	"ProveedorProducto",
	{
		id_proveedor_producto: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_proveedor: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "proveedores",
				key: "id_proveedor",
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
		precio_compra_habitual: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "proveedores_productos",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
);

// Definir asociaciones
ProveedorProducto.associate = (models) => {
	ProveedorProducto.belongsTo(models.Proveedor, {
		foreignKey: "id_proveedor",
		as: "proveedor",
	});

	ProveedorProducto.belongsTo(models.Producto, {
		foreignKey: "id_producto",
		as: "producto",
	});
};

module.exports = ProveedorProducto;
