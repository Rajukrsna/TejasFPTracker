// models/PhotoProof.js
const mongoose = require('mongoose');

const photoProofSchema = new mongoose.Schema({
    userId: { type: String , ref: 'User', required: true },
    photoUrl: { type: String, required: true },
    activityRecognized: { type: String },
    pointsAwarded: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PhotoProof', photoProofSchema);
