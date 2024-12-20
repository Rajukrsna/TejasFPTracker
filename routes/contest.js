const express = require('express');
const router = express.Router();
// Assuming you have a Contest model for MongoDB
const User= require('../models/User')
const Contest = require("../models/Contest");
const authenticateToken= require('../middlewares/auth')
// Sample data (In real applications, fetch from the database)
const contests = [
  {
    id: 1,
    title: "Plant & Prove",
    what_to_do: "Upload proof of planting trees.",
    obj: "Planting trees is one of the most effective ways to combat climate change, as trees act as natural carbon sinks, absorbing CO2 from the atmosphere. By engaging users in tree planting, this contest helps reduce greenhouse gas levels while also improving biodiversity, preventing soil erosion, and providing habitats for wildlife. Participating in this contest not only benefits the environment but also fosters a personal connection to nature, inspiring long-term sustainable behavior.",
    sub_process: [
      "Upload clear pictures showing the tree you planted and yourself with it.",
      "Submissions should include a timestamp or geolocation to verify the activity.",
    ],
    scoring: [
      "5 points per verified tree planted.",
      "Submit 10 unique pictures of planted trees to successfully complete the contest.",
      "Points will be awarded only for unique entries (no repeat submissions of the same tree).",
    ],
    verification_rules: [
      "A moderator or AI system will verify submissions for authenticity.",
      "Fake or duplicate submissions (e.g., using stock photos or recycling previous images) will result in a deduction of 10 points per violation.",
    ],
    completion_reward: [
      "Earn a badge of 'Eco-Tree Champion'.",
      "Your name will be featured on the app’s leaderboard, and top performers may receive eco-friendly rewards like seed kits or tree-planting certificates.",
    ],
    timing: "2024-11-12T00:00:00.000Z",
    img: "/public/img21.avif",
    registered_users :[],
    category: "upcoming",
  },
  {
    id:2,
    title: "Zero-Waste Challenge",
    what_to_do:
      "Show your efforts to reduce waste (e.g., composting, recycling, or reusing items).",
    obj: "Waste generation significantly contributes to pollution and greenhouse gas emissions, especially methane from landfills. This contest encourages users to adopt zero-waste practices, which help reduce the volume of waste sent to landfills, conserve resources, and minimize environmental pollution. Through actions like composting, recycling, and reusing, participants can lower their ecological footprint and inspire others to live more sustainably.",
    sub_process: [
      "Upload images or short videos showing zero-waste activities, such as setting up a compost bin, repurposing old items, or recycling waste materials.",
      "Provide a short description of your action to explain how it reduces waste.",
    ],
    scoring: [
      "3 points per verified submission.",
      "Complete the contest by submitting 15 unique entries showcasing different zero-waste activities.",
      "Submissions showing the same activity repeatedly (e.g., composting the same pile) will not count towards the total.",
    ],
    verification_rules: [
      "All submissions will be reviewed for originality and legitimacy.",
      "Any fake or plagiarized entries will result in a loss of 5 points per infraction.",
    ],
    completion_reward: [
      "Earn a 'Zero-Waste Warrior' badge.",
      "Receive bonus 20 points for completing the challenge and a chance to be featured on the app’s homepage.",
    ],
    timing: "2024-12-15T00:00:00.000Z",
    img: "/public/Zeor.jpg",
    category: "upcoming",
    registered_users :[],
  },
  {
    id:3,
    title: "Bike for the Planet",
    what_to_do: "Show proof of biking instead of driving a car.",
    obj: "Transportation is one of the largest contributors to carbon emissions globally. By promoting cycling, this contest aims to reduce reliance on fossil fuels, lower CO2 emissions, and improve air quality. Biking is also a great way to improve personal health and reduce urban congestion, creating a win-win for individuals and the planet. By participating, users actively contribute to mitigating climate change and spreading awareness about eco-friendly transportation options.",
    sub_process: [
      "Submit geotagged photos of you biking to work, school, or any location.",
      "Alternatively, share screenshots from fitness or tracking apps (e.g., Strava, Google Fit) showing your biking distance and route.",
      "Add a description mentioning the purpose of the ride and distance covered.",
    ],
    scoring: [
      "1 point for every 2 km biked, with a daily cap of 10 points.",
      "Accumulate 100 km of biking to complete the contest.",
    ],
    verification_rules: [
      "Submissions will be cross-checked for authenticity using timestamps and tracking data.",
      "Falsified or tampered GPS data will lead to a reduction of 20 points and possible disqualification.",
    ],
    completion_reward: [
      "Unlock a 'Planet-Friendly Commuter' badge.",
      "Top participants can win eco-friendly biking gear or vouchers for bike maintenance services.",
    ],
    timing: "2024-12-15T00:00:00.000Z",
    category: "live",
    img: "/public/img54.jpeg",
    category: "live",
    registered_users :[],
  },
  {
    id:4,
    title: "Eco-Cooking Superstar",
    what_to_do:
      "Share your eco-friendly meals (plant-based or zero-waste cooking).",
    obj: "The food system is responsible for a significant portion of global greenhouse gas emissions, with meat and dairy production being especially impactful. This contest encourages users to adopt plant-based or zero-waste cooking practices, which can drastically reduce their environmental impact. By sharing recipes and sustainable cooking habits, participants not only lower their own carbon footprint but also inspire others to make mindful food choices, fostering a collective impact on the planet.",
    sub_process: [
      "Upload high-quality images or videos of your meals.",
      "Include a brief description of the recipe and explain how it supports eco-friendliness (e.g., using plant-based ingredients or minimizing food waste).",
    ],
    scoring: [
      "5 points per verified submission.",
      "Submit 8 unique recipes or meals to complete the contest.",
    ],
    verification_rules: [
      "Submissions will be checked for originality; plagiarized recipes or reused images will result in a deduction of 15 points.",
    ],
    completion_reward: [
      "Unlock the 'Sustainable Chef' badge.",
      "Your recipes may be featured in a special eco-cooking section of the app, and top participants can win eco-friendly cooking kits or reusable kitchenware.",
    ],
    timing: "2024-12-22T00:00:00.000Z",
    img: "/public/d21.jpg",
    registered_users :[],
    category: "upcoming",
  },
  {
    id:5,
    title: "Switch & Save Energy",
    what_to_do:
      "Show actions taken to save electricity at home (e.g., using LED bulbs, switching off unused devices).",
    obj: "Energy conservation directly reduces carbon emissions from power plants, which are a major source of greenhouse gases. Encouraging users to adopt energy-efficient practices, such as using LED bulbs and unplugging unused devices, helps lower energy consumption and environmental impact. By participating in this contest, users contribute to global energy conservation efforts, reduce their utility bills, and inspire others to make smarter energy choices.",
    sub_process: [
      "Upload pictures or videos showing energy-saving actions, such as switching to LED bulbs, installing solar panels, or unplugging unused devices.",
      "Provide a description of the action, including estimated energy savings or reduced electricity usage.",
    ],
    scoring: [
      "4 points per verified submission.",
      "Submit 12 unique entries showcasing different energy-saving actions to complete the contest.",
    ],
    verification_rules: [
      "Submissions will be reviewed for accuracy and legitimacy.",
      "Fake or exaggerated claims will result in a deduction of 10 points and possible removal from the contest.",
    ],
    completion_reward: [
      "Earn the 'Green Energy Saver' badge.",
      "Top contributors may win prizes like energy-efficient appliances or discount vouchers for energy-saving products.",
    ],
    timing: "2024-12-29T00:00:00.000Z",
    img: "/public/saveE.webp",
    category: "live",
    registered_users :[],
  },
];


  


router.get('/',authenticateToken, async (req,res)=>{
  const user= await User.findById(req.user.userId)
    res.render('contest',{user,contests})
});




// Route to serve contest details
router.get("/:id", authenticateToken,async(req, res) => {
  const contestId = parseInt(req.params.id);
  const contest = contests.find((c) => c.id === contestId);
const user= await User.findById(req.user.userId)  
  if (contest) {
    res.render("contestDetails", { user,contest });
  } else {
    res.status(404).send("Contest not found");
  }
});

// Route to handle registration
router.post("/register", authenticateToken, async (req, res) => {
  try {
    const { contestId, userName, userEmail } = req.body;
    
    const userId = req.user.userId; // Example user ID (you can customize this)

    // Find the contest by ID
    const contest = await Contest.findOne({ id: contestId });

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    // Check if the user is already registered
    if (contest.registered_users.includes(userId)) {
      return res.status(400).json({ message: "User already registered." });
    }

    // Add the user ID to the registered_users array
    contest.registered_users.push(userId);
    await contest.save();

    res.status(200).json({ message: "Registration successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get('/enter/:id',authenticateToken,async (req,res)=>{
  const contestId = parseInt(req.params.id);
  const user= await User.findById(req.user.userId)

  const contest= await Contest.findOne({id: contestId})

  //console.log(contest)

  res.render('parContest', {user, contest })
})
module.exports = router;