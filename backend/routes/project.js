const express = require("express");
const Project = require("../models/project.js");
const User = require("../models/user.js");
const Task = require("../models/task.js");
const { validateToken } = require("../services/auth.js");
const router = express.Router();

router.post("/create", async (req, res) => {
  const body = req.body;
  const user = await validateToken(req.cookies.token);
  if (user.role != "Admin") {
    return res.status(400).send("Access Denied");
  }
  try {
    const project = {
      name: body.name,
      description: body.description,
      createdBy: user._id,
    };
    await Project.create(project);
    return res.status(200).json({ message: "Project Created!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in creating a project" });
  }
});

router.get("/my_projects", async (req, res) => {
  try {
    const user = validateToken(req.cookies.token);

    const projects = await Project.find({
      members: user._id,
    });

    res.status(200).json(projects);
  } catch (err) {
    res.status(400).json({ message: "Error fetching projects" });
  }
});

// ── Returns only members added to projects owned by the logged-in admin ───────
router.get("/members", async (req, res) => {
  try {
    const user = await validateToken(req.cookies.token);

    const projects = await Project.find({ createdBy: user._id });

    const projectIds = projects.map((p) => p._id);

    const memberIdSet = new Set();

    projects.forEach((p) => {
      (p.members || []).forEach((id) => {
        memberIdSet.add(id.toString());
      });
    });

    // 3️⃣ 🔥 NEW: Get assigned users from tasks
    const tasks = await Task.find({
      projectId: { $in: projectIds },
    });

    tasks.forEach((task) => {
      if (task.assignee) {
        memberIdSet.add(task.assignee.toString());
      }
    });

    // 4️⃣ Fetch user details
    const members = await User.find({
      _id: { $in: Array.from(memberIdSet) },
      role: "Member",
    });

    return res.status(200).json({ users: members });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in fetching members" });
  }
});

router.delete("/del_member/:projectId/:id", async (req, res) => {
  try {
    const { projectId, id } = req.params;

    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1️⃣ Remove from project members
    await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: { members: member._id },
      },
      { new: true },
    );

    await Task.updateMany(
      { project: projectId, assignee: member._id },
      { $unset: { assignee: "" } },
    );

    return res.status(200).json({
      message: "Member removed from project and tasks",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error removing member" });
  }
});
router.get("/all_members", async (req, res) => {
  try {
    const members = await User.find({ role: "Member" });

    if (!members) {
      return res.status(404).json({ message: "No members found" });
    }
    return res.status(200).json({ members });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error fetching members" });
  }
});
router.post("/all_projects", async (req, res) => {
  const user = await validateToken(req.cookies.token);
  if (user.role != "Admin") {
    return res.status(404).json({ message: "UnAuthorized" });
  }
  try {
    const projects = await Project.find({ createdBy: user._id })
      .populate("members", "fullname email")
      .populate("createdBy", "fullname email");
    if (!projects) {
      return res.status(404).json({ message: "No projects yet" });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error in fetching Projects" });
  }
});

// ── Get single project with members populated ─────────────────────────────────
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("members", "fullname email")
      .populate("createdBy", "fullname");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error fetching project" });
  }
});

// ── Delete project ────────────────────────────────────────────────────────────
const Task = require("../models/task.js");

router.delete("/delete/:projectId", async (req, res) => {
  const user = await validateToken(req.cookies.token);

  if (user.role != "Admin") {
    return res.status(403).json({ message: "UnAuthorized" });
  }

  try {
    const { projectId } = req.params;

    await Task.deleteMany({ project:projectId });

   
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({
      message: "Project and related data deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error deleting project" });
  }
});

module.exports = router;
