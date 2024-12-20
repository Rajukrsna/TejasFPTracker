const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  field:{
    type:String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  what_to_do: {
    type: String,
    required: true
  },
  obj: {
    type: String,
    required: true
  },
  sub_process: {
    type: [String], // Array of strings
    required: true
  },
  scoring: {
    type: [String], // Array of strings
    required: true
  },
  verification_rules: {
    type: [String], // Array of strings
    required: true
  },
  completion_reward: {
    type: [String], // Array of strings
    required: true
  },
  timing: {
    type: Date,
    required: true
  },
  img: {
    type: String, // Path to the image
    required: true
  },
  registered_users: {
    type: [String], // Array of user IDs (could be emails or unique strings)
    default: []
  },
  category: {
    type: String,
    enum: ["upcoming", "live", "completed"], // Restricts category to these values
    required: true
  }
});

module.exports = mongoose.model("Contest", contestSchema);
