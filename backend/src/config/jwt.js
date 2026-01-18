require("dotenv").config();

module.exports = {
	secret: process.env.JWT_SECRET || "tu_clave_secreta_super_segura",
	expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
