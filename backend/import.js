require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const path = require('path');

// Import models
const Agriculture = require('./models/Agriculture');
const Education = require('./models/Education');
const Healthcare = require('./models/Healthcare');
const SocialWelfare = require('./models/SocialWelfare');
const Transport = require('./models/Transport');
const Women = require('./models/Women');

// Load datasets
const agricultureData = require(path.join(process.env.DATASET_PATH, 'agriculture.json'));
const educationData = require(path.join(process.env.DATASET_PATH, 'education.json'));
const healthcareData = require(path.join(process.env.DATASET_PATH, 'healthcare.json'));
const socialWelfareData = require(path.join(process.env.DATASET_PATH, 'socialwelfare.json'));
const transportData = require(path.join(process.env.DATASET_PATH, 'transport.json'));
const womenData = require(path.join(process.env.DATASET_PATH, 'women.json'));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear and reload function for a model
const clearAndReloadData = async (Model, data, name) => {
  try {
    console.log(`🔄 Clearing ${name} collection...`);
    await Model.deleteMany({});
    console.log(`✅ Cleared ${name} collection.`);

    console.log(`📥 Inserting new ${name} data...`);
    await Model.insertMany(data);
    console.log(`✅ ${name} data inserted successfully.`);
  } catch (error) {
    console.error(`❌ Failed to process ${name}:`, error);
    throw error;
  }
};

// Main function to refresh all collections
const refreshDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      clearAndReloadData(Agriculture, agricultureData, 'Agriculture'),
      clearAndReloadData(Education, educationData, 'Education'),
      clearAndReloadData(Healthcare, healthcareData, 'Healthcare'),
      clearAndReloadData(SocialWelfare, socialWelfareData, 'SocialWelfare'),
      clearAndReloadData(Transport, transportData, 'Transport'),
      clearAndReloadData(Women, womenData, 'Women'),
    ]);

    console.log('✅ All collections cleared and reloaded.');
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run
refreshDatabase();
