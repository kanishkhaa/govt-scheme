const express = require('express');
const router = express.Router();
const HealthcareService = require('../services/healthcareService');

router.post('/load', async (req, res) => {
  try {
    const result = await HealthcareService.loadData();
    res.json(result);
  } catch (error) {
    console.error('Error loading healthcare data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await HealthcareService.getAllData();
    console.log('Raw data from HealthcareService:', data); // Debug log
    const flattenedData = data.flatMap(doc => doc.healthcare_schemes || []);
    console.log('Flattened healthcare data for response:', flattenedData); // Debug log
    if (flattenedData.length === 0) {
      console.warn('No schemes found in healthcare_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in healthcare route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;