const mongoose = require('mongoose');

// set a model for todos
let Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true, // validators
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null,
  },
  dueDate: {
    type: Date,
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId, // go into mongoose schema to access the OBjectId data type
    required: true,
  }
})

module.exports = {
  Todo: Todo
}
