const mongoose = require("mongoose");

const CraneSchema = new mongoose.Schema({
    model: { type: String, required: true },
    type: { type: String, required: true },
    max_load_capacity: { type: String, required: true },
    boom_length: { type: String, required: true },
    manufacturer: { type: String, required: true },
    price_range: { type: String },
    applications: { type: [String] },
    image: { type: String },  
    ar_link: { type: String },  
    images: [String],  
    specs: {
        reach_m: Number,
        weight_t: Number,
        engine_power_kw: Number,
        counterweight_t: Number,
        jib_length_m: Number,
        max_height_m: Number
    },
    load_charts: [String],  
    safety_notes: String,
    tags: [String],
    location: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Crane", CraneSchema);
