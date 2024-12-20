const express = require('express');
const multer = require('multer'); // For handling file uploads
const sharp = require("sharp"); // Image processing library
const fs = require("fs");
const axios = require('axios');

const dotenv = require("dotenv");

const bodyParser = require("body-parser");
const app = express();
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
dotenv.config(); 
// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });





/**
 * OCR-based bill processing
 */
router.post('/process-bill', authenticateToken, upload.single('bill'), async (req, res) => {
 const { file } = req;

    if (!file) {
        return res.status(400).json({ error: "No image file uploaded." });
    }

    const compressedFilePath = `./uploads/compressed_${file.filename}`;

    try {
        // Compress the uploaded image using Sharp
        await sharp(file.path)
            .resize({ width: 800 }) // Resize the image to a maximum width of 800px
            .toFormat("jpeg") // Ensure the output format is JPEG
            .jpeg({ quality: 80 }) // Set JPEG quality
            .toFile(compressedFilePath); // Save the compressed file

        // Read the compressed image file and convert it to Base64
        const imageBuffer = fs.readFileSync(compressedFilePath);
        const imageBase64 = imageBuffer.toString("base64");
        // Call Sambanova AI for analysis
        const response = await analyzeImageWithAI(imageBase64);
        // Extract waste type from AI response
        const wasteType = response.toLowerCase();
        console.log(wasteType)
        return res.json({ wasteType });

    } catch (error) {
        console.error("Error processing image:", error.message);
        return res.status(500).json({ error: error.message || "Failed to process the image." });
    } 
});

// Function to call Sambanova AI API for image recognition
const analyzeImageWithAI = async (imageUrl) => {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    const url = "https://api.sambanova.ai/v1/chat/completions";

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };

    const data = {
      model: "Llama-3.2-11B-Vision-Instruct",
      messages: [
          {
              "role": "user",
              "content": [
                  {
                      "type": "text",
                      "text": `You are an AI model that calculates the CO₂ footprint based on the items listed in an uploaded bill. Given the following bill, analyze it and estimate the total CO₂ footprint for the items listed. The output should be structured in the following JSON format:
  
                      {
                        "total_co2_footprint_kg": {Total Estimated CO₂ Footprint in kg},
                        "items": [
                          {
                            "item": "{Item Name}",
                            "estimated_co2_footprint_kg": {Estimated CO₂ Footprint of the item in kg}
                          },
                          ...
                        ]
                      }
  
                      Ensure:
                      1. The "total_co2_footprint_kg" field contains the sum of the estimated CO₂ footprint for all items in the bill.
                      2. Each item in the "items" list should accurately describe the item and have the corresponding estimated CO₂ footprint.
                      3. Respond only with the proper JSON structure, no additional text.
                      `
                  },
                  {
                      "type": "image_url",
                      "image_url": {
                          "url": `data:image/jpeg;base64,${imageUrl}`
                      }
                  }
              ]
          }
      ],
      temperature: 0.1,
      top_p: 0.1,
  };
  
    
    

    try {
        const response = await axios.post(url, data, { headers });
        const message = response.data.choices[0].message.content;
        console.log(message);
        return message.trim(); // Return recognized waste type
    } catch (error) {
        console.error("Error calling Sambanova API:", error.response?.data || error.message);
        throw new Error("Error with the AI API request.");
    }
};


module.exports = router;
