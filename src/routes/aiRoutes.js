const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.js");

// Chat page backend (placeholder for now)

router.get("/", (req, res) => {
    res.render("ai", {
        title: "AI Assistance",
        currentPage: "ai",
        user: req.user || null
    });
});

router.get("/start", aiController.aiHome);

// Send user message (question answered)
router.post("/message", aiController.processMessage);

// Reset AI session
router.get("/reset", aiController.resetAI);

module.exports = router;
