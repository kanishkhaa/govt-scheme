const mongoose = require('mongoose');

const womenSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Women', womenSchema);