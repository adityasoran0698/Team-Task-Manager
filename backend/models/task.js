const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ["to-do", "In Progress", "Done"],
    default: "to-do",
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  dueDate: {
    type: Date,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
  },
});

const Task = mongoose.model("task", TaskSchema);
module.exports = Task;
