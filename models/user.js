const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const jwt = require("jwt-simple");

// Define model
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    minlength: 6
  },
  googleID: {
    type: String
  },
  credits: {
    type: Number,
    default: 0,
  }
});


// Create model class
const User = mongoose.model("user", userSchema);

// Export the model
module.exports = User;
