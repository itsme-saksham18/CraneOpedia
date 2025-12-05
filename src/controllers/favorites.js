const Crane = require("../models/Crane");

// Initialize favorites array if not present
function initFavorites(req) {
    if (!req.session.favorites) {
        req.session.favorites = [];
    }
}

// Add a crane to favorites
module.exports.addFavorite = (req, res) => {
    initFavorites(req);

    const craneId = req.params.id;

    if (!req.session.favorites.includes(craneId)) {
        req.session.favorites.push(craneId);
        return res.json({ added: true, favorites: req.session.favorites });
    }

    res.json({ added: false, message: "Already in favorites" });
};

// Remove a crane
module.exports.removeFavorite = (req, res) => {
    initFavorites(req);

    const craneId = req.params.id;

    req.session.favorites = req.session.favorites.filter(id => id !== craneId);

    res.json({
        removed: true,
        favorites: req.session.favorites
    });
};

// List all favorites (return full crane data)
module.exports.getFavorites = async (req, res) => {
    initFavorites(req);

    const cranes = await Crane.find({ _id: { $in: req.session.favorites || [] } });

    res.json({ cranes });
};
