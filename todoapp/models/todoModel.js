const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  status: Boolean,
  text: String,
});

module.exports = mongoose.model('Todo', TaskSchema);
