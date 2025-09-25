const Transport = require('../models/Transport');
const path = require('path');
const fs = require('fs');

class TransportService {
  static async loadData() {
    try {
      const datasetPath = path.resolve(__dirname, process.env.DATASET_PATH, 'transport.json');
      console.log('Resolved transport.json path:', datasetPath);

      if (!fs.existsSync(datasetPath)) {
        throw new Error(`❌ Dataset file not found at: ${datasetPath}`);
      }

      const transportData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

      await Transport.deleteMany({});
      await Transport.insertMany(transportData);
      console.log('Transport data inserted into MongoDB:', transportData); // Debug log
      return { message: '✅ Transport data loaded successfully' };
    } catch (error) {
      console.error(`❌ Error loading transport data: ${error.message}`);
      throw error;
    }
  }

  static async getAllData() {
    try {
      const data = await Transport.find();
      console.log('Fetched transport data from MongoDB:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`❌ Error fetching transport data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TransportService;