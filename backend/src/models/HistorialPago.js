const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HistorialPago = sequelize.define(
	"HistorialPago",
	{
		id_pago: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_empresa: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		id_usuario: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		plan_anterior: {
			type: DataTypes.ENUM("BASICO", "PREMIUM", "EMPRESARIAL"),
			allowNull: true,
		},
		plan_nuevo: {
			type: DataTypes.ENUM("BASICO", "PREMIUM", "EMPRESARIAL"),
			allowNull: false,
		},
		monto: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		metodo_pago: {
			type: DataTypes.ENUM("EFECTIVO", "QR", "TARJETA", "TRANSFERENCIA"),
			defaultValue: "QR",
		},
		estado_pago: {
			type: DataTypes.ENUM("PENDIENTE", "COMPLETADO", "RECHAZADO"),
			defaultValue: "COMPLETADO",
		},
		descripcion: {
			type: DataTypes.STRING(500),
			allowNull: true,
		},
		fecha_pago: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		fecha_vencimiento: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		fecha_creacion: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "historial_pagos",
		timestamps: false,
	},
);

// Definir asociaciones
HistorialPago.associate = (models) => {
	// Un pago pertenece a una empresa
	HistorialPago.belongsTo(models.Empresa, {
		foreignKey: "id_empresa",
		as: "empresa",
	});

	// Un pago fue realizado por un usuario
	HistorialPago.belongsTo(models.Usuario, {
		foreignKey: "id_usuario",
		as: "usuario",
	});
};

module.exports = HistorialPago;
