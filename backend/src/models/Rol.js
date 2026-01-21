const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rol = sequelize.define(
	"Rol",
	{
		id_rol: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		nombre: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
		},
		descripcion: {
			type: DataTypes.STRING(200),
		},
	},
	{
		tableName: "roles",
		timestamps: false,
	},
);

// Definir asociaciones
Rol.associate = (models) => {
	// Un rol tiene muchos usuarios
	Rol.hasMany(models.Usuario, {
		foreignKey: "id_rol",
		as: "usuarios",
	});
};

module.exports = Rol;
