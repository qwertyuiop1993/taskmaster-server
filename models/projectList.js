const mongoose = require("mongoose");
const { Schema } = mongoose;
// Define model
const ProjectListSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "teal"
  },
  image: {
    type: String,
    default: null
  }
});

module.exports = ProjectListSchema;
