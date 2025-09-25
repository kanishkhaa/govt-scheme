const Women = require('../models/Women');
const path = require('path');
const fs = require('fs');

class WomenService {
  static async loadData() {
    try {
      const datasetPath = path.resolve(__dirname, process.env.DATASET_PATH, 'women.json');
      console.log('Resolved women.json path:', datasetPath);

      if (!fs.existsSync(datasetPath)) {
        throw new Error(`❌ Dataset file not found at: ${datasetPath}`);
      }

      const womenData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

      await Women.deleteMany({});
      await Women.insertMany(womenData);
      console.log('Women data inserted into MongoDB:', womenData); // Debug log
      return { message: '✅ Women data loaded successfully' };
    } catch (error) {
      console.error(`❌ Error loading women data: ${error.message}`);
      throw error;
    }
  }

  static async getAllData() {
    try {
      const data = await Women.find();
      console.log('Fetched women data from MongoDB:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`❌ Error fetching women data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = WomenService;