const Crane = require("../models/Crane");
const Inquiry = require("../models/Inquiry");
const Admin = require("../models/Admin");

// 1. List all cranes (with search)
module.exports.listCranes = async (req, res) => {
    try {
        const cranes = await Crane.find().sort({ model: 1 });
        const favorites = req.session.favorites || [];
        
        res.render('cranes', {
            title: 'CraneOpedia - Cranes Catalog',
            currentPage: 'cranes',
            cranes,
            favorites,
            pageTitle: 'Crane Catalog',
            currentPage: 'cranes'
        });
    } catch (error) {
        console.error('Error fetching cranes:', error);
        res.status(500).render('error', { error: 'Failed to load cranes' });
    }

};


// 2. View single crane detail
module.exports.viewCrane = async (req, res) => {
    const crane = await Crane.findById(req.params.id).populate("owner");

    if (!crane) {
        return res.status(404).json({ error: "Crane not found" });
    }

    res.json({ crane });
};


module.exports.viewCranePage = async (req, res) => {
    try {
        const craneId = req.params.id;
        const crane = await Crane.findById(craneId);
        
        if (!crane) {
            // Set flash message for error
            req.flash('error', 'Crane not found');
            req.flash('message', 'The requested crane does not exist.');
            
            // Redirect to cranes listing page
            return res.redirect('/cranes');
        }
        
        // Get related cranes (same type)
        const relatedCranes = await Crane.find({
            _id: { $ne: craneId },
            type: crane.type
        }).limit(3);
        
        // Get user favorites
        const favorites = req.session.favorites || [];
        console.log(crane.applications, typeof crane.applications);

        res.render('craneDetails', {
            crane,
            relatedCranes,
            favorites,
            title: 'CraneOpedia - ' + crane.model,
            currentPage: 'craneDetails',
        });
        
    } catch (error) {
        console.error('Error fetching crane details:', error);
        res.status(500).render('error', {
            error: 'Server Error',
            message: 'Failed to load crane details. Please try again.'
        });
    }
};

// 3. Contact form page (placeholder for now)
module.exports.contactForm = async (req, res) => {
    const crane = await Crane.findById(req.params.id).populate("owner");

    if (!crane) {
        return res.status(404).json({ error: "Crane not found" });
    }

    res.json({
        message: "Contact owner page — frontend later",
        crane,
        owner: crane.owner
    });
};

// 4. Send inquiry
module.exports.sendInquiry = async (req, res) => {
    const crane = await Crane.findById(req.params.id);

    if (!crane) {
        return res.status(404).json({ error: "Crane not found" });
    }

    const admin = crane.owner;

    const { userName, userPhone, message } = req.body;

    if (!userName || !userPhone || !message) {
        return res.status(400).json({ error: "All fields required" });
    }

    const inquiry = new Inquiry({
        crane: crane._id,
        admin: admin,
        userName,
        userPhone,
        message
    });

    await inquiry.save();

    res.json({ message: "Inquiry sent successfully!", inquiry });
};
