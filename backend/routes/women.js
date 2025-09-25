const express = require('express');
const router = express.Router();
const WomenService = require('../services/womenService');

router.post('/load', async (req, res) => {
  try {
    const result = await WomenService.loadData();
    console.log('Women data load result:', result); // Debug log
    res.json(result);
  } catch (error) {
    console.error('Error in women load route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await WomenService.getAllData();
    console.log('Raw data from WomenService:', data); // Debug log
    const flattenedData = data.flatMap(doc => doc.women_schemes || []);
    console.log('Flattened data for response:', flattenedData); // Debug log
    if (flattenedData.length === 0) {
      console.warn('No schemes found in women_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in women route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;