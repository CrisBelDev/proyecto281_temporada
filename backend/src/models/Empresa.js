const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Empresa = sequelize.define(
	"Empresa",
	{
		id_empresa: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		nit: {
			type: DataTypes.STRING(50),
			unique: true,
		},
		telefono: {
			type: DataTypes.STRING(20),
		},
		direccion: {
			type: DataTypes.STRING(300),
		},
		email: {
			type: DataTypes.STRING(100),
			unique: true,
		},
		logo: {
			type: DataTypes.STRING(500),
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "empresas",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
	},
);

module.exports = Empresa;
