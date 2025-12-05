const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();
const passportConfig = require("./config/passport");
const cors = require("cors");


const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

passportConfig(passport);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global flash vars
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


//Routers import honge yaha
const adminRoutes = require('./routes/admin');
const adminCranesRoutes = require('./routes/adminCranes');
const craneRoutes = require('./routes/cranes');
const homeRoutes = require('./routes/home');
const aiRoutes = require('./routes/aiRoutes');
const favoriteRoutes = require('./routes/favorites');


// DB Connection
require("./config/db")();




//Request Route Kari jayegi yaha
app.use('/', homeRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/cranes', adminCranesRoutes);
app.use('/cranes', craneRoutes);
app.use('/ai', aiRoutes);
app.use('/favorites', favoriteRoutes);
app.get("/debug/session", (req, res) => {
    res.json(req.session);
});


// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
