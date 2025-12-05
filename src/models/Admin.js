const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    passwordHash: {
        type: String,
        required: true
    },

    // Non required feilds - details contact k liye
    phoneNumber: String,
    whatsappLink: String,
    websiteUrl: String,
    linkedinUrl: String,
    instagramUrl: String,
    companyName: String,
    address: String,
    workingHours: String,
    servicesOffered: [String], 
    about: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Admin", AdminSchema);
