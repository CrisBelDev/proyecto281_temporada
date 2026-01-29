const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Crear directorios si no existen
const uploadDir = path.join(__dirname, "../../uploads");
const productosDir = path.join(uploadDir, "productos");
const empresasDir = path.join(uploadDir, "empresas");

[uploadDir, productosDir, empresasDir].forEach((dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Determinar carpeta según el tipo
		let folder = uploadDir;
		if (req.baseUrl.includes("/productos")) {
			folder = productosDir;
		} else if (req.baseUrl.includes("/empresas")) {
			folder = empresasDir;
		}
		cb(null, folder);
	},
	filename: function (req, file, cb) {
		// Generar nombre único: timestamp + nombre original sanitizado
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const name = path
			.basename(file.originalname, ext)
			.replace(/[^a-zA-Z0-9]/g, "_");
		cb(null, name + "-" + uniqueSuffix + ext);
	},
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase(),
	);
	const mimetype = allowedTypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
	}
};

// Configuración de multer
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter: fileFilter,
});

module.exports = {
	uploadProducto: upload.single("imagen"),
	uploadEmpresa: upload.single("logo"),
	uploadMultiple: upload.array("imagenes", 10),
};
