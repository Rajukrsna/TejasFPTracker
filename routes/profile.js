const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();
const multer = require("multer");
const fs = require("fs");



// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './public',
    filename: (req, file, cb) => {
        cb(null, 'profile-pic.jpg'); // Save the image with a fixed name for simplicity
    }
});
const upload = multer({ storage });
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.render('dashboard', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}); 


router.post('/upload-profile-pic', authenticateToken,upload.single('profileImage'), async (req, res) => {
    try {
        const user = await User.findOne({_id :req.user.userId});
        user.profileImage = 'public/profile-pic.jpg'; // Store the image path in the user model
        await user.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;