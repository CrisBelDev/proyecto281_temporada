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
		slug: {
			type: DataTypes.STRING(100),
			unique: true,
			allowNull: true,
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

// Definir asociaciones
Empresa.associate = (models) => {
	// Una empresa tiene muchos usuarios
	Empresa.hasMany(models.Usuario, {
		foreignKey: "id_empresa",
		as: "usuarios",
	});

	// Una empresa tiene muchos clientes
	Empresa.hasMany(models.Cliente, {
		foreignKey: "id_empresa",
		as: "clientes",
	});

	// Una empresa tiene muchos productos
	Empresa.hasMany(models.Producto, {
		foreignKey: "id_empresa",
		as: "productos",
	});

	// Una empresa tiene muchas categorías
	Empresa.hasMany(models.Categoria, {
		foreignKey: "id_empresa",
		as: "categorias",
	});

	// Una empresa tiene muchos proveedores
	Empresa.hasMany(models.Proveedor, {
		foreignKey: "id_empresa",
		as: "proveedores",
	});

	// Una empresa tiene muchas ventas
	Empresa.hasMany(models.Venta, {
		foreignKey: "id_empresa",
		as: "ventas",
	});

	// Una empresa tiene muchas compras
	Empresa.hasMany(models.Compra, {
		foreignKey: "id_empresa",
		as: "compras",
	});

	// Una empresa tiene muchas notificaciones
	Empresa.hasMany(models.Notificacion, {
		foreignKey: "id_empresa",
		as: "notificaciones",
	});
};

module.exports = Empresa;
