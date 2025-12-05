const Crane = require("../models/Crane");
const Inquiry = require("../models/Inquiry");
const Admin = require("../models/Admin");

// 1. List all cranes (with search)
module.exports.listCranes = async (req, res) => {
    const search = req.query.search || "";

    const query = search
        ? {
              $or: [
                  { model: new RegExp(search, "i") },
                  { manufacturer: new RegExp(search, "i") },
                  { type: new RegExp(search, "i") }
              ]
          }
        : {};

    const cranes = await Crane.find(query);

    res.json({ cranes });
};

// 2. View single crane detail
module.exports.viewCrane = async (req, res) => {
    const crane = await Crane.findById(req.params.id).populate("owner");

    if (!crane) {
        return res.status(404).json({ error: "Crane not found" });
    }

    res.json({ crane });
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
