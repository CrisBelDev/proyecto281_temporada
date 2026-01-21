const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Producto = sequelize.define(
	"Producto",
	{
		id_producto: {
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
		id_categoria: {
			type: DataTypes.INTEGER,
			references: {
				model: "categorias",
				key: "id_categoria",
			},
		},
		codigo: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		nombre: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		descripcion: {
			type: DataTypes.TEXT,
		},
		precio_compra: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		precio_venta: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		stock_actual: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		stock_minimo: {
			type: DataTypes.INTEGER,
			defaultValue: 5,
		},
		imagen: {
			type: DataTypes.STRING(500),
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "productos",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		indexes: [
			{
				unique: true,
				fields: ["id_empresa", "codigo"],
			},
		],
	},
);

// Definir asociaciones
Producto.associate = (models) => {
	// Un producto pertenece a una empresa
	Producto.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Un producto pertenece a una categoría
	Producto.belongsTo(models.Categoria, {
		foreignKey: "id_categoria",
		as: "categoria",
	});

	// Un producto tiene muchos detalles de venta
	Producto.hasMany(models.DetalleVenta, {
		foreignKey: "id_producto",
		as: "detalle_ventas",
	});

	// Un producto tiene muchos detalles de compra
	Producto.hasMany(models.DetalleCompra, {
		foreignKey: "id_producto",
		as: "detalle_compras",
	});
};

module.exports = Producto;
