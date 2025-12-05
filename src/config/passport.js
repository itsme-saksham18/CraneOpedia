const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const admin = await Admin.findOne({ email });

                    if (!admin) {
                        return done(null, false, { message: "Admin not found" });
                    }

                    const isMatch = await bcrypt.compare(password, admin.passwordHash);

                    if (!isMatch) {
                        return done(null, false, { message: "Incorrect password" });
                    }

                    return done(null, admin);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((admin, done) => {
        done(null, admin.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const admin = await Admin.findById(id);
            done(null, admin);
        } catch (err) {
            done(err);
        }
    });
};
