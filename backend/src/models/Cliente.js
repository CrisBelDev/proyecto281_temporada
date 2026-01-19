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
		paranoid: false, // Deshabilitado temporalmente hasta ejecutar migración
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		// deletedAt: "fecha_eliminacion", // Descomentar después de ejecutar migración
	},
);

module.exports = Cliente;
