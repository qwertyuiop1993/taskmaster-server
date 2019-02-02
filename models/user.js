const mongoose = require("mongoose");
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
  googleID: {
    type: String
  },
});


// Create model class
const User = mongoose.model("user", userSchema);

// Export the model
module.exports = User;
