const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const port =3000;
const User= require('./models/User')
const { sendSMS } = require('./snsService');


//const pasconstsport = require('passport');
//require('./middlewares/passport'); // Make sure this path is correct and loaded early
//const session = require('express-session');
// Load environment variables
dotenv.config();

// Log JWT_SECRET to verify it is set correctly
//console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`); 
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middlewar
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies before using them

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }   // Set to true in production with HTTPS
}));


//app.use(passport.initialize());
//app.use(passport.session());



app.set('view engine', 'ejs');
app.set('layout', 'layout'); 
// Database connection
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000}, )
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));


app.use('/activityRoutes', require('./routes/activityRoutes')); // Protect activity routes
app.use('/dashboard', require('./routes/dashboard'));
app.use('/leaderboard', require('./routes/leaderBoard')); // Protect leaderboard routes
app.use('/activityRoute2',require('./routes/activityRoute2'));
app.use('/photoProofRoutes',require('./routes/photoProofRoutes'));
app.use('/chat', require('./routes/chat'));
app.use('/calculate', require('./routes/calculate'));
app.use('/ocrDedect', require('./routes/ocrDedect'))
app.use('/contest', require('./routes/contest'));
app.use('/badgesRedeem', require('./routes/badgesRedeem'))
app.use('/profile', require('./routes/profile'));
// Root route

//authentication using aws cognito


// Initialize OpenID Client
let client;
async function initializeClient() {
    const issuer = await Issuer.discover(process.env.COGNITO_ISSUER_URL);
    client = new issuer.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [process.env.REDIRECT_URI],
        response_types: ['code']
    });
}
initializeClient().catch(console.error);

// Middleware to check authentication status
const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        
        req.isAuthenticated = true;
    }
    next();
};

app.get('/', checkAuth, (req, res) => {
   // console.log("1", req.isAuthenticated)
  // console.log(req.session.userInfo)
    if (req.isAuthenticated) {
        // If user is authenticated, redirect to dashboard
        res.redirect('/dashboard');
    } else {
    -
        // If user is not authenticated, render the login page
        res.render('login');
    }
});

app.get('/login', (req, res) => {
    //console.log("Attempting login");
    // Generate new nonce and state
  // (console.log(req.session.userInfo))
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;  // Set the nonce in session
    req.session.state = state;  // Set the state in session

    // Redirect to Cognito login page
    const authUrl = client.authorizationUrl({
        scope: 'openid email profile',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);  // Ensure redirection happens here
});

app.get('/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            process.env.REDIRECT_URI,
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        // Debugging: Check the userInfo content
      //  console.log('UserInfo:', userInfo);

        const user = req.session.userInfo;
        
        // Check if user.sub is valid
        if (!user.sub) {
            throw new Error('User sub (ID) is missing in userInfo');
        }

        // Find the user by _id (user.sub)
        let user1 = await User.findOne({ _id: user.sub });

        if (!user1) {
            // If user does not exist, create a new user
            const newUser = new User({ 
                _id: user.sub,
                username: user.username, 
                email: user.email, 
            });
            
            await newUser.save();
            const message = `New user registered on your TejasAI Application: ${user.username} (${user.email})`;
            await sendSMS(message, process.env.ADMIN_PHONE_NUMBER);
            //console.log('New user created:', newUser);
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.sub }, process.env.JWT_SECRET, { expiresIn: '5h' });

        // Set token as a cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/login');
    }
});

// Logout Route
app.get('/logout', (req, res) => {
  
    req.session.destroy();
// Clear cookies if you're using authentication tokens in cookies
res.clearCookie('authToken');
        const logoutUrl = `https://us-east-1he7ntouvo.auth.us-east-1.amazoncognito.com/logout?client_id=70ibnsqdu15kbhcksmjg64n94d&logout_uri=${process.env.LOGOUT_URI}`;
        res.redirect(logoutUrl);
        // Redirect to login page after logout
    });

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});