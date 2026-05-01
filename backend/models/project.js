const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // ✅ was String
    ref: "user",
    required: true,
  },
});

const Project = mongoose.model("project", ProjectSchema);
module.exports = Project;
