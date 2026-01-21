const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notificacion = sequelize.define(
	"Notificacion",
	{
		id_notificacion: {
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
			references: {
				model: "usuarios",
				key: "id_usuario",
			},
		},
		tipo: {
			type: DataTypes.ENUM(
				"STOCK_BAJO",
				"STOCK_AGOTADO",
				"VENTA",
				"COMPRA",
				"SISTEMA",
			),
			allowNull: false,
		},
		titulo: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		mensaje: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		leida: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		fecha_creacion: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "notificaciones",
		timestamps: false,
	},
);

// Definir asociaciones
Notificacion.associate = (models) => {
	// Una notificación pertenece a una empresa
	Notificacion.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Una notificación pertenece a un usuario
	Notificacion.belongsTo(models.Usuario, {
		foreignKey: "id_usuario",
		as: "usuario",
	});
};

module.exports = Notificacion;
