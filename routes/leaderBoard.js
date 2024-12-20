// routes/leaderboardRoutes.js
const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken ,async (req, res) => {
    try {
     
        const users = await User.find().sort({ points: -1 }).limit(10)
        const user = await User.findById(req.user.userId);
        //console.log(JSON.stringify(users, null, 2));
      
       




        res.render('leaderboard', { user :user, users });
    } catch (err) {
        res.status(500).send('Error fetching leaderboard');
    }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Fetch user data
        const user = await User.findById(req.user.userId).select('earned_badges');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ earned_badges: user.earned_badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
