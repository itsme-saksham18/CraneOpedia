const multer = require("multer");
const cloudinary = require("./cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

// IMAGE STORAGE
const imageStorage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "craneopedia/images",
    allowedFormats: ["jpg", "jpeg", "png", "webp"]
});

// AR MODEL STORAGE
const modelStorage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "craneopedia/models",
    allowedFormats: ["glb", "gltf"]
});

// LOAD CHART STORAGE
const chartStorage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "craneopedia/charts",
    allowedFormats: ["jpg", "png", "pdf"]
});

module.exports = {
    uploadImages: multer({ storage: imageStorage }),
    uploadAR: multer({ storage: modelStorage }),
    uploadCharts: multer({ storage: chartStorage })
};
