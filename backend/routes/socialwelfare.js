const express = require('express');
const router = express.Router();
const SocialWelfareService = require('../services/socialWelfareService');

router.post('/load', async (req, res) => {
  try {
    const result = await SocialWelfareService.loadData();
    res.json(result);
  } catch (error) {
    console.error('Error in social welfare load route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await SocialWelfareService.getAllData();
    console.log('Raw data from SocialWelfareService:', data); // Debug log
    const flattenedData = data.flatMap(doc => doc.social_welfare_schemes || []);
    console.log('Flattened data for response:', flattenedData); // Debug log
    if (flattenedData.length === 0) {
      console.warn('No schemes found in social_welfare_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in social welfare route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;