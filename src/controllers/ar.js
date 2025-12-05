const Crane = require("../models/Crane");
const QRCode = require("qrcode");

module.exports.getARSupportedCranes = async (req, res) => {
    const cranes = await Crane.find({
        ar_link: { $exists: true, $ne: "" }
    });

    res.json({ cranes });
};

module.exports.getARModel = async (req, res) => {
    const crane = await Crane.findById(req.params.id);

    if (!crane) {
        return res.status(404).json({ error: "Crane not found" });
    }

    if (!crane.ar_link) {
        return res.status(400).json({ error: "AR model not available" });
    }

    res.json({
        modelUrl: crane.ar_link
    });
};

module.exports.generateQR = async (req, res) => {
    const crane = await Crane.findById(req.params.id);

    if (!crane || !crane.ar_link) {
        return res.status(404).json({ error: "AR model not found" });
    }

    try {
        const qrDataUrl = await QRCode.toDataURL(crane.ar_link);
        res.json({
            qr: qrDataUrl,
            ar_link: crane.ar_link
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "QR generation failed" });
    }
};
