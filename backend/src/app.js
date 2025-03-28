const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');
const Crane = require('./model/cranes.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const port = 8080;
const ai = new GoogleGenerativeAI("AIzaSyDh1TZGs9qrl3oaQ3L0yPLg5NllAy1YRAk");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Connect to MongoDB before starting the server
connectDB().then(() => {
  console.log('✅ MongoDB connected');

  app.get('/getManufacturers', async (req, res) => {
    const type = req.query.type;
    if (!type) {
      return res.status(400).json({ error: 'Type parameter is required' });
    }

    try {
      const manufacturers = await Crane.find({ type }).distinct('manufacturer');
      res.json(manufacturers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch manufacturers' });
    }
  });

  app.get('/getModels', async (req, res) => {
    const manufacturer = req.query.manufacturer;
    console.log('Manufacturer:', manufacturer);
    if (!manufacturer) {
      return res.status(400).json({ error: 'Manufacturer parameter is required' });
    }

    try {
      const models = await Crane.find({ manufacturer }).distinct('model');
      res.json(models);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  app.get('/getCraneDetails', async (req, res) => {
    const model = req.query.model;
    try {
      const crane = await Crane.findOne({ model });
      console.log('Crane found:', crane);
      if (crane) {
        console.log('Crane found:', crane);
        res.json(crane);
      } else {
        res.status(404).json({ error: 'Crane not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error fetching crane details' });
    }
  });
  
  //Details for gemini api

  app.post("/recommend-crane", async (req, res) => {
    const { weight, radius, wind, terrain, height } = req.body;

    if (!weight || !radius || !wind || !terrain || !height) {
        return res.status(400).json({ error: "Missing input parameters." });
    }

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt =  `Suggest the best crane type based on these parameters:
        Load Weight: ${weight} tons, Lift Radius: ${radius} meters, Wind Conditions: ${wind}, 
        Terrain: ${terrain}, Lifting Height: ${height} meters.
        
        Provide a structured JSON response like this:
        {
          "recommendedCrane": "Type of Crane",
          "reasons": [
            "Reason 1",
            "Reason 2",
            "Reason 3"
          ],
          "alternativeOptions": [
            "Alternative 1",
            "Alternative 2"
          ]
        }
        `;

        const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
        const responseText = result.response.text();

        // Parse AI response to extract JSON correctly
        const jsonStart = responseText.indexOf("{");
        const jsonEnd = responseText.lastIndexOf("}");
        const structuredResponse = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));

        res.json(structuredResponse);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI model failed to process request." });
    }
});


  app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
  });
});