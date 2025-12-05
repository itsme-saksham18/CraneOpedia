const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const { ensureAdmin } = require("../middlewares/auth");

// Login / Signup
router.route("/login")
    .get(adminController.getLogin)
    .post(adminController.postLogin);

router.route("/signup")
    .get(adminController.getSignup)
    .post(adminController.postSignup);

router.get("/logout", adminController.logout);

// Dashboard
router.get("/dashboard", ensureAdmin, adminController.dashboard);
router.get("/inquiries", ensureAdmin, adminController.listInquiries);
router.get("/inquiries/:id", ensureAdmin, adminController.viewInquiry);


module.exports = router;
