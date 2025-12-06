const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.js");


// Home main route (placeholder)
router.get("/", homeController.home);

// Dynamic dropdowns
router.get("/types", homeController.getTypes);
router.get("/manufacturers/:type", homeController.getManufacturers);
router.get("/models/:type/:manufacturer", homeController.getModels);


router.post("/load-analysis", homeController.calculateLoadAnalysis);


module.exports = router;
