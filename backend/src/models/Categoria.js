const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Categoria = sequelize.define(
	"Categoria",
	{
		id_categoria: {
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
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		descripcion: {
			type: DataTypes.STRING(300),
		},
	},
	{
		tableName: "categorias",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
	},
);

module.exports = Categoria;
