const express = require('express');
const router = express.Router();
const EducationService = require('../services/educationService');

router.get('/', async (req, res) => {
  try {
    const data = await EducationService.getAllData();
    console.log('Raw data from EducationService:', data);
    const flattenedData = data.flatMap(doc => doc.education_schemes || []);
    console.log('Flattened data for response:', flattenedData);
    if (flattenedData.length === 0) {
      console.warn('No schemes found in education_schemes');
    }
    res.json(flattenedData);
  } catch (error) {
    console.error('Error in education route:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;