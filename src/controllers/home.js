const Crane = require("../models/Crane");

// HOME PAGE
module.exports.home = async (req, res) => {
    try {
        // Get distinct crane types
        const types = await Crane.distinct("type");
        
        // Get comparison data if session has comparison IDs
        const comparisonData = await Crane.find({
            _id: { $in: req.session.comparison || [] }
        }).lean();
        
        // Get counts for stats
        const craneCount = await Crane.countDocuments();
        const manufacturerCount = await Crane.distinct("manufacturer").then(arr => arr.length);
        
        // Get recent cranes
        const recentCranes = await Crane.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        res.render("home", {
            title: 'CraneOpedia - Home',
            currentPage: 'home',
            types,
            comparisonData,
            craneCount,
            manufacturerCount,
            recentCranes
        });
    } catch (error) {
        console.error('Home controller error:', error);
        req.flash('error', 'Error loading home page');
        res.redirect('/');
    }
};


// GET UNIQUE TYPES
module.exports.getTypes = async (req, res) => {
    const types = await Crane.distinct("type");
    res.json({ types });
};

// GET MANUFACTURERS FOR SELECTED TYPE
module.exports.getManufacturers = async (req, res) => {
    try {
        const type = req.params.type;
        const manufacturers = await Crane.distinct("manufacturer", { type: type });
        
        // Transform array of strings to array of objects
        const manufacturersData = manufacturers.map(mfg => ({
            _id: mfg, // Use manufacturer name as ID since you don't have separate IDs
            name: mfg
        }));
        
        res.json(manufacturersData); // Send array, not object with manufacturers key
    } catch (error) {
        console.error('Manufacturers API error:', error);
        res.json([]);
    }
};

// GET MODELS FOR TYPE + MANUFACTURER
module.exports.getModels = async (req, res) => {
    try {
        const { type, manufacturer } = req.params;
        
        // Find cranes that match type and manufacturer
        const models = await Crane.find({ 
            type: type, 
            manufacturer: manufacturer 
        })
        .select('_id model max_load_capacity boom_length manufacturer type image')
        .lean();
        
        res.json(models); // Return array of objects
    } catch (error) {
        console.error('Models API error:', error);
        res.json([]);
    }
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
