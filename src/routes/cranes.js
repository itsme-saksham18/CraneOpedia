const express = require("express");
const router = express.Router();
const craneController = require("../controllers/cranes.js");

// PUBLIC CRANE ROUTES
router.get("/", craneController.listCranes);
router.get("/:id", craneController.viewCrane);

// CONTACT OWNER
router.route("/:id/contact")
    .get(craneController.contactForm)
    .post(craneController.sendInquiry);

module.exports = router;
