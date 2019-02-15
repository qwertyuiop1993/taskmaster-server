const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jwt-simple");
const ProjectSchema = require("./project");

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
  name: {
    type: String
  },
  projects: [ProjectSchema]
});


// Create model class
const User = mongoose.model("user", userSchema);

// Export the model
module.exports = User;
