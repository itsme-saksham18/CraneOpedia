const bcrypt = require("bcryptjs");
const passport = require("passport");
const Admin = require("../models/Admin");
const Crane = require("../models/Crane");
const Inquiry = require("../models/Inquiry");


module.exports.getSignup = (req, res) => {
    res.render("admin/signup", {
        title: "Admin Signup",
        currentPage: "auth"
    });
};

module.exports.postSignup = async (req, res) => {
    const { name, email, password,  } = req.body;

    if (!name || !email || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/signup");
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
        req.flash("error", "Admin already exists.");
        return res.redirect("/admin/signup");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new Admin({
        name,
        email,
        passwordHash,
    });

    await admin.save();

    req.flash("success", "Account created! Login now.");
    res.redirect("/admin/login");
};

module.exports.getLogin = (req, res) => {
    res.render("admin/login", {
        title: "Admin Login",
        currentPage: "auth"
    });
};

module.exports.postLogin = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin/dashboard",
        failureRedirect: "/admin/login",
        failureFlash: true,
    })(req, res, next);
};

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Logged out!");
        res.redirect("/admin/login");
    });
};

module.exports.dashboard = async (req, res) => {
    const cranes = await Crane.find({ owner: req.user._id });

    const inquiryCount = await Inquiry.countDocuments({ admin: req.user._id });

    res.json({
        message: "Admin Dashboard",
        admin: req.user,
        cranes,
        stats: {
            totalCranes: cranes.length,
            totalInquiries: inquiryCount,
        }
    });
};

module.exports.listInquiries = async (req, res) => {
    const inquiries = await Inquiry.find({ admin: req.user._id })
        .populate("crane")
        .sort({ createdAt: -1 });

    res.json({ inquiries });
};

module.exports.viewInquiry = async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id)
        .populate("crane")
        .populate("admin");

    if (!inquiry) {
        req.flash("error", "Inquiry not found");
        return res.redirect("/admin/inquiries");
    }

    res.json({ inquiry });
};

