const mongoose = require('mongoose');




const dailySchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    
    co2_transportation: {
        type: Number,
        default:0
    },
    co2_energy: {
        type: Number,
        default:0
    },
    co2_diet: {
        type: Number,
        default:0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Daily', dailySchema);
