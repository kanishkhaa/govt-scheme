const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Transport', transportSchema);