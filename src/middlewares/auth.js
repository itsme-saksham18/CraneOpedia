module.exports.ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash("error", "You must be logged in as Admin.");
    return res.redirect("/admin/login");
};
