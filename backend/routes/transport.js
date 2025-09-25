const express = require('express');
const router = express.Router();
const TransportService = require('../services/transportService');

router.post('/load', async (req, res) => {
  try {
    const result = await TransportService.loadData();
    console.log('Transport data load result:', result); // Debug log
    res.json(result);
  } catch (error) {
    console.error('Error in transport load route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await TransportService.getAllData();
    console.log('Raw data from TransportService:', data); // Debug log
    const flattenedData = data.flatMap(doc => doc.transport_and_infrastructure_schemes || []);
    console.log('Flattened data for response:', flattenedData); // Debug log
    if (flattenedData.length === 0) {
      console.warn('No schemes found in transport_and_infrastructure_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in transport route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;