const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const User = require('../models/User');
const Activity = require('../models/Activity'); // Fixed typo in path
const Daily = require('../models/daily')
// Routes
router.get("/",authenticateToken , async (req, res) => {
    const user = await User.findById(req.user.userId);
    res.render("calculate",{user});
});

router.post("/log", authenticateToken, async (req, res) => { // Added async for asynchronous operations
    try {
        const { monthlyFootprint, transport, energy , food } = req.body; // Extract data from request body
        const userId = req.user.userId; // Ensure req.userId is populated by authenticateToken middleware
    // console.log(userId)
        // Find the user's activity or create a new one if none exists
        let activityy = await Activity.findOne({ userId });
        
        if (!activityy) {
            activityy = new Activity({ userId }); // Create a new activity document
        }
        // Update the co2 values
        activityy.co2 = monthlyFootprint;
        // Save the updated activity
        await activityy.save();

        const user = await User.findById(req.user.userId);
        

  // Find the daily activity document or create a new one if it doesn't exist
  let dailyAct = await Daily.findOne({ userId: user._id });
  if (!dailyAct) {
      dailyAct = new Daily({ userId: user._id });
  }

  // Update fields
  dailyAct.co2_transportation = transport;
  dailyAct.co2_diet = food;
  dailyAct.co2_energy=energy,


await dailyAct.save()


 const breakdown = await Daily.aggregate([
            { $match: { userId: userId } },
            {
                $project: {
                    _id: 0,
                    co2_transportation: 1,
                    co2_energy: 1,
                    co2_diet: 1,
                    co2_recycling: 1,
                    co2_travel: 1
                }
            }
        ]);
console.log(breakdown)
        // If data exists, return it; else return empty
        const activity = breakdown[0] || {};

        res.status(200).json({
            categories: [
                { label: 'Transportation', value: activity.co2_transportation || 0 },
                { label: 'Energy', value: activity.co2_energy || 0 },
                { label: 'Diet', value: activity.co2_diet || 0 },
                { label: 'Recycling', value: activity.co2_recycling || 0 },
                { label: 'Travel', value: activity.co2_travel || 0 }
            ]
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while logging activity." });
    }
});

module.exports = router;
