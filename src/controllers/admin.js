const bcrypt = require("bcryptjs");
const passport = require("passport");
const Admin = require("../models/Admin");

module.exports.getSignup = (req, res) => {
    res.send("ADMIN SIGNUP - FRONTEND LATER");
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
    res.send("ADMIN LOGIN - FRONTEND LATER");
};

module.exports.postLogin = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin",
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
    res.send("ADMIN DASHBOARD - FRONTEND AFTER BACKEND");
};
