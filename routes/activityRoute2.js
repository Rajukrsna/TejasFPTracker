const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authenticateToken = require('../middlewares/auth');
const dotenv = require('dotenv');
const axios = require('axios');
const mongoose = require('mongoose');
const Daily = require('../models/daily');
const User = require('../models/User');

dotenv.config();
const LAMBDA_API_URL =process.env.URILAMA;

router.get('/' ,(req,res)=>
{
    res.render('logactivity2');

})

router.post('/log',authenticateToken, async (req, res) => {
  const userInput = req.body; // Collect input from the user
  console.log(userInput)
    try {
      //call the AI model for the response
      const response = await axios.post(
        LAMBDA_API_URL,
        { prompt: `Given the following user data: ${userInput}, suggest activities to reduce carbon footprint.`
      
         },
          
         // Send input as a JSON object
        {
            headers: {
                'Content-Type': 'text/plain', // Set Content-Type to application/json
                'Accept': 'application/json'
            }
        }
    );

    // Parse Lambda response
    if (response.data && response.data.body) {
        const lambdaBody = JSON.parse(response.data.body);  // Parse JSON string in `body`
        suggestions = lambdaBody.reply || 'Unexpected response format from Lambda.';
    } else {
        suggestions = 'Unexpected response format from Lambda.';
    }

    const userId = req.user.userId;
    
        // Save activity to database
        const newActivity = new Activity({
          userId:userId,
          suggestions:suggestions,
          co2:0,
          reduction:0,
        
       // Positive for net emission
         
          date: new Date()
      });

    await newActivity.save();

     
    
  res.redirect('/dashboard');
      console.log("db valuses asaved")
    } catch (err) {
        res.status(500).send('Error generating suggestions');
    }
});



router.get('/category-breakdown', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const breakdown = await Activity.aggregate([
            { $match: { userId: userId } }, // Filter by user
            {
                $group: {
                    _id: null, // No need to group by type, but keep both values
                    totalEmission: { $sum: '$co2' }, // Sum total CO2 emissions
                    totalReduction: { $sum: '$reduction' } // Sum total CO2 reductions
                }
            }
        ]);

        // Prepare data in the format required for the chart
        const response = [
            { _id: 'Emission', totalCo2: breakdown[0]?.totalEmission || 0 },
            { _id: 'Reduction', totalCo2: breakdown[0]?.totalReduction || 0 }
        ];

        res.json(response);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching category breakdown');
    }
});

router.get('/activity-breakdown', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Fetch CO₂ breakdown data by category for the user
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
        res.status(500).json({ message: 'Error fetching data.', error });
    }
});





module.exports = router;
