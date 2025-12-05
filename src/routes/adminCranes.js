const express = require("express");
const router = express.Router();
const craneController = require("../controllers/adminCranes.js");
const { ensureAdmin } = require("../middlewares/auth");

// List all cranes for admin
router.route("/")
    .get(ensureAdmin, craneController.listCranes)
    .post(ensureAdmin, craneController.createCrane);


// Create Crane
router.get("/new", ensureAdmin, craneController.showCreateForm);

// Edit Crane
router.get("/:id/edit", ensureAdmin, craneController.showEditForm);

router.route("/:id")
    .get(ensureAdmin, craneController.viewCraneDetails)
    .put(ensureAdmin, craneController.updateCrane)
    .delete(ensureAdmin, craneController.deleteCrane);

// Upload AR model
router.post("/:id/ar", ensureAdmin, craneController.uploadArModel);

module.exports = router;
