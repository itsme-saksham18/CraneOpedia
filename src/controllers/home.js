const Crane = require("../models/Crane");

// HOME PAGE
module.exports.home = (req, res) => {
    res.json({
        message: "HOME PAGE — Backend ready, frontend later"
    });
};

// GET UNIQUE TYPES
module.exports.getTypes = async (req, res) => {
    const types = await Crane.distinct("type");
    res.json({ types });
};

// GET MANUFACTURERS FOR SELECTED TYPE
module.exports.getManufacturers = async (req, res) => {
    const { type } = req.params;

    const manufacturers = await Crane.find({ type }).distinct("manufacturer");

    res.json({ manufacturers });
};

// GET MODELS FOR TYPE + MANUFACTURER
module.exports.getModels = async (req, res) => {
    const { type, manufacturer } = req.params;

    const models = await Crane.find({ type, manufacturer }).distinct("model");

    res.json({ models });
};

// Add crane to comparison
module.exports.addToComparison = (req, res) => {
    const id = req.params.id;

    if (!req.session.comparison) {
        req.session.comparison = [];
    }

    // Already added?
    if (req.session.comparison.includes(id)) {
        return res.json({
            duplicate: true,
            message: "This crane is already in comparison"
        });
    }

    // Limit 5 cranes
    if (req.session.comparison.length >= 5) {
        return res.json({
            limitReached: true,
            message: "Maximum 5 cranes allowed in comparison"
        });
    }

    req.session.comparison.push(id);

    res.json({
        added: true,
        comparison: req.session.comparison
    });
};

// Remove crane from comparison
module.exports.removeFromComparison = (req, res) => {
    const id = req.params.id;

    req.session.comparison = (req.session.comparison || []).filter(
        craneId => craneId !== id
    );

    res.json({
        removed: true,
        comparison: req.session.comparison
    });
};

// Get comparison data (full crane objects)
module.exports.getComparison = async (req, res) => {
    const ids = req.session.comparison || [];

    const cranes = await Crane.find({ _id: { $in: ids } });

    res.json({ cranes });
};

module.exports.calculateLoadAnalysis = (req, res) => {
    const { loadWeight, boomLength, radius, terrain, wind } = req.body;

    // Simple dummy formulas (will refine later)
    const counterweight = loadWeight * 0.25; // demo formula
    const groundPressure = (loadWeight * 9.8) / (radius + 5); 
    const padSize = Math.ceil(groundPressure / 10); 

    const warnings = [];

    if (wind > 40) warnings.push("High wind! Reduce boom length.");
    if (terrain === "soft") warnings.push("Soft terrain — use support mats.");

    res.json({
        loadWeight,
        boomLength,
        radius,
        terrain,
        wind,
        counterweight,
        groundPressure,
        padSize,
        warnings,
        diagramData: {
            boomAngle: Math.atan(boomLength / radius) * (180 / Math.PI),
            loadVector: loadWeight * 9.8
        }
    });
};
