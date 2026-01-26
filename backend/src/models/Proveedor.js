const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Proveedor = sequelize.define(
	"Proveedor",
	{
		id_proveedor: {
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
		nombre: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		nit: {
			type: DataTypes.STRING(50),
		},
		telefono: {
			type: DataTypes.STRING(20),
		},
		email: {
			type: DataTypes.STRING(100),
		},
		direccion: {
			type: DataTypes.STRING(300),
		},
		contacto_nombre: {
			type: DataTypes.STRING(200),
			allowNull: true,
		},
		contacto_telefono: {
			type: DataTypes.STRING(20),
			allowNull: true,
		},
		datos_pago: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: "JSON con información de pago (banco, cuenta, etc.)",
		},
		observaciones: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "proveedores",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
	},
);

// Definir asociaciones
Proveedor.associate = (models) => {
	// Un proveedor pertenece a una empresa
	Proveedor.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Un proveedor tiene muchas compras
	Proveedor.hasMany(models.Compra, {
		foreignKey: "id_proveedor",
		as: "compras",
	});

	// Relación con productos a través de ProveedorProducto
	Proveedor.hasMany(models.ProveedorProducto, {
		foreignKey: "id_proveedor",
		as: "productos_suministrados",
	});
};

module.exports = Proveedor;
