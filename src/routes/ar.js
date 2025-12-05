const express = require("express");
const router = express.Router();
const arController = require("../controllers/ar.js");

router.get("/", arController.getARSupportedCranes);
router.get("/model/:id", arController.getARModel);
router.get("/qr/:id", arController.generateQR);

module.exports = router;
