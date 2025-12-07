const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const modelUrl = req.query.model;

    if (!modelUrl) {
        return res.status(400).send("Model URL required");
    }

    res.render("ar-viewer", { modelUrl ,layout: false });
});

module.exports = router;
