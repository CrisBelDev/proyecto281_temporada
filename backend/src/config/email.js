const nodemailer = require("nodemailer");

// Configuración de Mailtrap
const transport = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "228cd41586ed8c",
		pass: "74f42b745cb1ff",
	},
});

module.exports = transport;
