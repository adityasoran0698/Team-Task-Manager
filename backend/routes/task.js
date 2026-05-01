const express = require("express");
const Project = require("../models/project.js");
const User = require("../models/user.js");
const Task = require("../models/task.js");
const { validateToken } = require("../services/auth.js");
const router = express.Router();

// Creating a task
router.post("/create/:projectId", async (req, res) => {
  const body = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  const user = await validateToken(req.cookies.token);
  if (user.role != "Admin") {
    return res.status(400).send("Access Denied");
  }
  try {
    const task = {
      title: body.title,
      description: body.description,
      priority: body.priority || undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      createdBy: user._id,
      project: project._id,
    };
    await Task.create(task);
    return res.status(200).json({ message: "New Task Added!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in adding a task" });
  }
});

// Assigning a task

router.post("/assign/:taskId/:userId", async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // assign task
    await Task.findByIdAndUpdate(taskId, {
      assignee: userId,
    });

    
    await Project.findByIdAndUpdate(task.project, {
      $addToSet: { members: userId },
    });

    return res.status(200).json({ message: "Task assigned & member added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error assigning task" });
  }
});

// Updating Status
router.post("/update_status/:taskId", async (req, res) => {
  const body = req.body;
  const taskId = req.params.taskId;
  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: body.status },
      { new: true },
    );
    return res.status(200).json({ message: "Status Updated!", task });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in updating tasks" });
  }
});

// Delete Task
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await Task.findByIdAndDelete(id);
    return res.status(200).json({ message: "Task Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in deleting task" });
  }
});

// Get tasks assigned to current user in a project (Member)
router.get("/project/:projectId", async (req, res) => {
  try {
    const user = await validateToken(req.cookies.token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tasks = await Task.find({
      project: req.params.projectId,
      assignee: user._id,
    }).populate("assignee", "fullname email");

    res.status(200).json({ tasks });
    console.log(tasks);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error fetching tasks" });
  }
});

// Get all tasks in a project (Admin)
router.get("/all/:projectId", async (req, res) => {
  const user = await validateToken(req.cookies.token);
  if (user.role != "Admin") {
    return res.status(404).json({ message: "UnAuthorized" });
  }
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate(
      "assignee",
      "fullname email",
    );
    if (!tasks) {
      return res.status(404).json({ message: "No tasks yet" });
    }
    return res.status(200).json({ tasks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in fetching tasks" });
  }
});

module.exports = router;
