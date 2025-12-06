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
// Add crane to comparison
module.exports.addToComparison = async (req, res) => {
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

    // THIS WAS MISSING — fetch crane object
    const crane = await Crane.findById(id).lean();

    res.json({
        added: true,
        comparison: req.session.comparison,
        crane   // ← RETURN THE CRANE OBJECT HERE
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

// Add crane to comparison from request body
module.exports.addToComparisonFromBody = (req, res) => {
    const { craneId } = req.body; // Get from request body, not params
    const id = craneId; // Use the ID from body

    if (!req.session.comparison) {
        req.session.comparison = [];
    }

    // Already added?
    if (req.session.comparison.includes(id)) {
        return res.status(400).json({ // Return 400 status for client errors
            success: false,
            error: "This crane is already in comparison"
        });
    }

    // Limit 5 cranes
    if (req.session.comparison.length >= 5) {
        return res.status(400).json({
            success: false,
            error: "Maximum 5 cranes allowed in comparison"
        });
    }

    req.session.comparison.push(id);

    // Also fetch and return the crane data for frontend display
    Crane.findById(id).lean()
        .then(crane => {
            res.json({
                success: true,
                message: "Crane added to comparison",
                comparison: req.session.comparison,
                crane: crane // Return crane data for frontend
            });
        })
        .catch(error => {
            console.error('Error fetching crane:', error);
            res.status(500).json({
                success: false,
                error: "Error adding crane to comparison"
            });
        });
};