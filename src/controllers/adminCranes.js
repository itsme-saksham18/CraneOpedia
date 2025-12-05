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

// 9. Upload Images
module.exports.uploadImages = async (req, res) => {
    try {
        const crane = await Crane.findById(req.params.id);

        req.files.forEach(file => {
            crane.images.push(file.path); // cloudinary URL
        });

        await crane.save();

        res.json({ message: "Images uploaded", images: crane.images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error uploading images" });
    }
};

// 10. Upload Load Charts
module.exports.uploadCharts = async (req, res) => {
    try {
        const crane = await Crane.findById(req.params.id);

        req.files.forEach(file => {
            crane.load_charts.push(file.path);
        });

        await crane.save();

        res.json({ message: "Load charts uploaded", charts: crane.load_charts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
};

// 11. Upload AR Model
module.exports.uploadArModel = async (req, res) => {
    try {
        const crane = await Crane.findById(req.params.id);

        crane.ar_link = req.file.path; // cloudinary URL

        await crane.save();

        res.json({ message: "AR model uploaded", ar_link: crane.ar_link });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AR model upload failed" });
    }
};
