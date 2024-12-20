const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const User = require('../models/User');



router.get('/',authenticateToken ,async (req,res)=>
    {
        const user = await User.findById(req.user.userId);
        res.render('logactivity',{user});
    
    })
    
    module.exports = router;