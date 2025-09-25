const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    password: { type: String },
    phone: { type: String },
    profile: {
      fullName: { type: String },
      fatherName: { type: String },
      motherName: { type: String },
      spouseName: { type: String },
      dateOfBirth: { type: String },
      age: { type: String },
      gender: { type: String },
      maritalStatus: { type: String },
      phoneNumber: { type: String },
      pincode: { type: String },
      state: { type: String },
      district: { type: String },
      urbanRural: { type: String },
      educationLevel: { type: String },
      occupation: { type: String },
      workSector: { type: String },
      annualIncome: { type: String },
      rationCardType: { type: String },
      disability: { type: String },
      aadhaarLinked: { type: String },
      govtPreference: { type: String },
      preferredSector: { type: String },
      benefitType: { type: String },
      eligibilityAwareness: { type: String },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;