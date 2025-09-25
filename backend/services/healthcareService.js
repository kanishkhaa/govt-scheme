const Healthcare = require('../models/Healthcare');
const Agriculture = require('../models/Healthcare');

class HealthcareService {
  static async getAllData() {
    try {
      const data = await Healthcare.find();
      console.log('Fetched healthcare data from MongoDB:', data); // Debug log
      return data;
    } catch (error) {
      console.error(`❌ Error fetching healthcare data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = HealthcareService;