const express = require('express');

const router = express.Router();
const User = require('../models/User');
const Transaction= require('../models/Transactions');
const authenticateToken = require('../middlewares/auth')


// Home route to render the redemption page
router.get('/',authenticateToken, async(req, res) => {
    const user = await User.findById(req.user.userId);

    res.render('redump', { user, message: null });
});

// Handle redemption requests
router.post('/redeem',authenticateToken, async(req, res) => {
    const reward = req.body.reward;
    let message = '';
    let msg=0;
    const user = await User.findById(req.user.userId);

    switch (reward) {
        case 'tree':
            if (user.points >= 20) {
                user.points -= 20;
                user.multiplier = 2;
                msg=20;
                message = 'Reward successfully redeemed: Tree! Your future points will be doubled.';
            } else {
                message = 'Insufficient points to redeem a tree.';
              
            }
            break;

        case 'cycle':
            if (user.points >= 30) {
                user.points -= 30;
                user.multiplier=3
                message = 'Reward successfully redeemed: Bicycle!';
                msg=30;
            } else {
                message = 'Insufficient points to redeem a bicycle.';
            }
            break;

        case 'scooter':
            if (user.points >= 40) {
                user.points -= 40;
                user.multiplier=4;
                message = 'Reward successfully redeemed: Electric Scooter!';
                msg=40;
            } else {
                message = 'Insufficient points to redeem an electric scooter.';
            }
            break;

        default:
            message = 'Invalid reward selected.';
    }
await user.save();
if(msg!=0)
{
const Trans= new Transaction({
  username: user.username,
  pointsReduced: msg,
});
await Trans.save();
}
    res.render('redump', { user, message });
});

module.exports= router;