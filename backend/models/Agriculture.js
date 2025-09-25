const mongoose = require('mongoose');

const agricultureSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Agriculture', agricultureSchema);