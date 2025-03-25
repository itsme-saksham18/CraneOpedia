const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const craneSchema = new Schema({
    model: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    max_load_capacity: {
        type: String,
        required: true
    },
    boom_length: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    price_range: {
        type: String
    },
    applications: {
        type: [String]
    },
    image: {
        type: String
    },
    ar_link:{
        type: String
    }
});

const Crane = mongoose.model('Crane', craneSchema);
module.exports = Crane;