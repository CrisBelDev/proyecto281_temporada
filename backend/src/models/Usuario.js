const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const Usuario = sequelize.define(
	"Usuario",
	{
		id_usuario: {
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
		id_rol: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "roles",
				key: "id_rol",
			},
		},
		nombre: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		apellido: {
			type: DataTypes.STRING(100),
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		telefono: {
			type: DataTypes.STRING(20),
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		tableName: "usuarios",
		timestamps: true,
		createdAt: "fecha_creacion",
		updatedAt: "fecha_actualizacion",
		hooks: {
			beforeCreate: async (usuario) => {
				if (usuario.password) {
					const salt = await bcrypt.genSalt(10);
					usuario.password = await bcrypt.hash(usuario.password, salt);
				}
			},
			beforeUpdate: async (usuario) => {
				if (usuario.changed("password")) {
					const salt = await bcrypt.genSalt(10);
					usuario.password = await bcrypt.hash(usuario.password, salt);
				}
			},
		},
	},
);

// Método para comparar contraseñas
Usuario.prototype.compararPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;
