const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cliente = sequelize.define(
	"Cliente",
	{
		id_cliente: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
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
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "clientes",
		timestamps: true,
		paranoid: true, // ✅ ACTIVADO: Soft delete
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		deletedAt: "fecha_eliminacion", // ✅ ACTIVADO
	},
);

// Definir asociaciones
Cliente.associate = (models) => {
	// Un cliente pertenece a una empresa
	Cliente.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Un cliente tiene muchas ventas
	Cliente.hasMany(models.Venta, {
		foreignKey: "id_cliente",
		as: "ventas",
	});
};

module.exports = Cliente;
