const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String , ref: 'User', required: true },

    username: { type: String, required: true },
    pointsAwarded: { type: Number, default:0},
    pointsReduced:{ type:Number, default:0},
    timestamp: { type: Date, default: Date.now }, // Time of the transaction
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
