const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favorites.js");

router.get("/all", (req, res) => {
    res.render("favorites", {
        title: "Favorites",
        currentPage: "favorites",
        user: req.user || null
    });
});

// Add to favorites
router.post("/add/:id", favoritesController.addFavorite);

// Remove from favorites
router.post("/remove/:id", favoritesController.removeFavorite);

// View all favorites
router.get("/", favoritesController.getFavorites);

module.exports = router;
