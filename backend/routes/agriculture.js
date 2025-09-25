const express = require('express');
const router = express.Router();
const AgricultureService = require('../services/agricultureService');

router.get('/', async (req, res) => {
  try {
    const data = await AgricultureService.getAllData();
    console.log('Raw data from AgricultureService:', data); // Debug log
    const flattenedData = data.flatMap(doc => doc.agriculture_schemes || []);
    console.log('Flattened data for response:', flattenedData); // Debug log
    if (flattenedData.length === 0) {
      console.warn('No schemes found in agriculture_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in agriculture route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;