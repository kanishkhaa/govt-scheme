const mongoose = require('mongoose');

const healthcareSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Healthcare', healthcareSchema);