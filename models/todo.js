const mongoose = require('mongoose');

// set a model for todos
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true, // validators
    minlength: 1,
    trim: true
  },
  category: {
    type: String,
    default: "Inbox"
  },
  indexInList: {
    type: Number,
    default: null
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
    type: Number,
    default: null,
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId, // go into mongoose schema to access the OBjectId data type
    required: true,
  }
})

module.exports = {
  Todo: Todo
}
