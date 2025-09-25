const Agriculture = require('../models/Agriculture');

class AgricultureService {
  static async getAllData() {
    try {
      const data = await Agriculture.find();
      console.log('Fetched agriculture data from MongoDB:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`❌ Error fetching agriculture data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AgricultureService;