const Crane = require("../models/Crane");

// 1. List cranes owned by current admin
module.exports.listCranes = async (req, res) => {
    const cranes = await Crane.find({ owner: req.user._id });
    res.json({ cranes });  // frontend later
};

// 2. Show create form (placeholder)
module.exports.showCreateForm = (req, res) => {
    res.send("ADMIN ADD CRANE FORM - FRONTEND LATER");
};

// 3. Create crane
module.exports.createCrane = async (req, res) => {
    try {
        const crane = new Crane({
            ...req.body,
            owner: req.user._id,
            images: [],
            specs: req.body.specs || {},
            load_charts: [],
            tags: req.body.tags || []
        });

        await crane.save();
        res.json({ message: "Crane created", crane });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating crane" });
    }
};

// 4. Show edit form (placeholder)
module.exports.showEditForm = async (req, res) => {
    const crane = await Crane.findById(req.params.id);
    res.json({ crane }); // frontend later
};

// 5. Update crane
module.exports.updateCrane = async (req, res) => {
    try {
        const crane = await Crane.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ message: "Crane updated", crane });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating crane" });
    }
};

// 6. Delete crane
module.exports.deleteCrane = async (req, res) => {
    try {
        await Crane.findByIdAndDelete(req.params.id);
        res.json({ message: "Crane deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting crane" });
    }
};

// 7. Upload AR Model (backend placeholder, file handling later)
module.exports.uploadArModel = async (req, res) => {
    // AR upload handling after file upload system is added
    res.send("AR MODEL UPLOAD ENDPOINT - BACKEND LATER");
};

// 8. View Crane Details
module.exports.viewCraneDetails = async (req, res) => {
    try {
        const crane = await Crane.findById(req.params.id);
        res.json({ crane });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching crane details" });
    }
};