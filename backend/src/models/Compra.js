const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Compra = sequelize.define(
	"Compra",
	{
		id_compra: {
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
		id_proveedor: {
			type: DataTypes.INTEGER,
			references: {
				model: "proveedores",
				key: "id_proveedor",
			},
		},
		numero_compra: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		fecha_compra: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		total: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
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
		tableName: "compras",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		indexes: [
			{
				unique: true,
				fields: ["id_empresa", "numero_compra"],
			},
		],
	},
);

// Definir asociaciones
Compra.associate = (models) => {
	// Una compra pertenece a una empresa
	Compra.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Una compra pertenece a un usuario
	Compra.belongsTo(models.Usuario, {
		foreignKey: "id_usuario",
		as: "usuario",
	});

	// Una compra pertenece a un proveedor
	Compra.belongsTo(models.Proveedor, {
		foreignKey: "id_proveedor",
		as: "proveedor",
	});

	// Una compra tiene muchos detalles
	Compra.hasMany(models.DetalleCompra, {
		foreignKey: "id_compra",
		as: "detalles",
	});
};

module.exports = Compra;
