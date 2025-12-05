const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// IMAGE STORAGE
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "craneopedia/images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

// AR MODEL STORAGE (GLB / GLTF)
const modelStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "craneopedia/models",
        allowed_formats: ["glb", "gltf"]
    }
});

// LOAD CHART STORAGE (optional)
const chartStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "craneopedia/charts",
        allowed_formats: ["jpg", "png", "pdf"]
    }
});

module.exports = {
    uploadImages: multer({ storage: imageStorage }),
    uploadAR: multer({ storage: modelStorage }),
    uploadCharts: multer({ storage: chartStorage })
};
