const mongoose = require('mongoose');

const socialWelfareSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('SocialWelfare', socialWelfareSchema);