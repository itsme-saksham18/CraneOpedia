const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');
const Crane = require('./model/cranes.js');
const port = 8080;

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
  

  app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
  });
});