const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema({
    crane: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Crane",
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Inquiry", InquirySchema);
