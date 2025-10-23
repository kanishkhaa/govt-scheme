const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    picture: { type: String },
    password: { 
      type: String, 
      minlength: 8,
      select: false // Don't include in queries by default
    },
    phone: { 
      type: String, 
      match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number']
    },
    isVerified: { type: Boolean, default: false },
    profile: {
      fullName: { type: String, trim: true },
      fatherName: { type: String, trim: true },
      motherName: { type: String, trim: true },
      spouseName: { type: String, trim: true },
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
      // User-specific applied schemes
      appliedSchemes: [{
        id: { type: String, required: true }, // Scheme ID (e.g., 'agriculture-0')
        name: { type: String, required: true }, // Scheme name
        category: { type: String }, // Category for filtering/display
        description: { type: String }, // Brief desc for display
        state: { type: String }, // State for display
        status: { type: String, enum: ['applied', 'not_applied'], default: 'applied' }, // Track status
        appliedDate: { type: Date, default: Date.now }
      }],
      // User-specific bookmarked schemes
      bookmarkedSchemes: [{
        id: { type: String, required: true }, // Scheme ID (e.g., 'agriculture-0')
        name: { type: String, required: true }, // Scheme name
        category: { type: String }, // Category for filtering/display
        description: { type: String }, // Brief desc for display
        state: { type: String }, // State for display
        bookmarkedDate: { type: Date, default: Date.now }
      }]
    },
    resetPasswordToken: { type: String }, // Added for password reset
    resetPasswordExpires: { type: Date }, // Added for password reset expiration
  },
  
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;