const mongoose = require('mongoose');

const earnedBadgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Use a string to store the UUID

    username: { type: String, required: true, unique: true },

    email: { type: String, required: true, unique: true },
    profileImage:{
     type:String,
     default:""
    },
    points: { type: Number, default: 0 },
    multiplier:{type:Number, default:1},
    contestPoints:{type:Number, default:0},
    earned_badges: { type: [earnedBadgeSchema], default: [] }
});

module.exports = mongoose.model('User', userSchema);
