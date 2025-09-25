const SocialWelfare = require('../models/SocialWelfare');
const path = require('path');
const fs = require('fs');

class SocialWelfareService {
  static async loadData() {
    try {
      const datasetPath = path.resolve(__dirname, process.env.DATASET_PATH, 'socialwelfare.json');
      console.log('Resolved socialwelfare.json path:', datasetPath);

      if (!fs.existsSync(datasetPath)) {
        throw new Error(`❌ Dataset file not found at: ${datasetPath}`);
      }

      const socialWelfareData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

      await SocialWelfare.deleteMany({});
      await SocialWelfare.insertMany(socialWelfareData);
      return { message: '✅ Social Welfare data loaded successfully' };
    } catch (error) {
      console.error('Error loading social welfare data:', error.message);
      throw new Error(`❌ Error loading social welfare data: ${error.message}`);
    }
  }

  static async getAllData() {
    try {
      const data = await SocialWelfare.find();
      console.log('Fetched social welfare data from MongoDB:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`❌ Error fetching social welfare data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SocialWelfareService;