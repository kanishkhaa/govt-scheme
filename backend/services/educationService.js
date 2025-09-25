const Education = require('../models/Education');
const path = require('path');
const fs = require('fs').promises;

class EducationService {
  static async loadData() {
    try {
      const datasetPath = path.resolve(__dirname, process.env.DATASET_PATH, 'education.json');
      console.log('Resolved education.json path:', datasetPath);

      if (!(await fs.access(datasetPath).then(() => true).catch(() => false))) {
        throw new Error(`❌ Dataset file not found at: ${datasetPath}`);
      }

      const rawData = JSON.parse(await fs.readFile(datasetPath, 'utf-8'));

      await Education.deleteMany({});
      await Education.insertMany([rawData]); // Insert as-is, preserving the nested structure
      console.log('✅ Education data loaded successfully');
      return { message: '✅ Education data loaded successfully' };
    } catch (error) {
      console.error(`❌ Error loading education data: ${error.message}`);
      throw new Error(`❌ Error loading education data: ${error.message}`);
    }
  }

  static async getAllData() {
    try {
      const data = await Education.find();
      console.log('Fetched education data from MongoDB:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching education data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EducationService;