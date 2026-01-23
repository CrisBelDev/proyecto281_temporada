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
			allowNull: true, // NULL para SUPERUSER que no está asociado a ninguna empresa específica
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
		email_verificado: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		token_verificacion: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		token_verificacion_expira: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		token_recuperacion: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		token_recuperacion_expira: {
			type: DataTypes.DATE,
			allowNull: true,
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

// Definir asociaciones
Usuario.associate = (models) => {
	// Un usuario pertenece a una empresa
	Usuario.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Un usuario pertenece a un rol
	Usuario.belongsTo(models.Rol, {
		foreignKey: "id_rol",
		as: "rol",
	});

	// Un usuario tiene muchas ventas
	Usuario.hasMany(models.Venta, {
		foreignKey: "id_usuario",
		as: "ventas",
	});

	// Un usuario tiene muchas compras
	Usuario.hasMany(models.Compra, {
		foreignKey: "id_usuario",
		as: "compras",
	});

	// Un usuario tiene muchas notificaciones
	Usuario.hasMany(models.Notificacion, {
		foreignKey: "id_usuario",
		as: "notificaciones",
	});
};

module.exports = Usuario;
