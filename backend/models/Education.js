const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Education', educationSchema);