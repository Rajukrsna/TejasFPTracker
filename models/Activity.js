const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: { 
        type: String,  // Use String instead of ObjectId
        ref: 'User',
        required: true
    },
    suggestions: { 
        type: String, 
        required: true,
        default: "Unknown Activity" // Default activity name
    },
    co2: { 
        type: Number, 
        required: true, 
        default: 0 // Default CO2 impact
    },
    reduction: { 
        type: Number ,
        required: true, 
        default: 0 }
        ,
    date: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model('Activity', activitySchema);