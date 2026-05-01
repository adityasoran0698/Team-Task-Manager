import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "to-do": { label: "To Do", pill: "bg-gray-700/60 text-gray-300" },
  "In Progress": {
    label: "In Progress",
    pill: "bg-indigo-500/20 text-indigo-300",
  },
  Done: { label: "Done", pill: "bg-emerald-500/20 text-emerald-400" },
};

const PRIORITY_CONFIG = {
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  low: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
};

const avatarGradients = [
  "from-violet-600 to-indigo-600",
  "from-cyan-600 to-teal-600",
  "from-pink-600 to-rose-600",
  "from-amber-600 to-orange-600",
  "from-emerald-600 to-green-600",
  "from-blue-600 to-cyan-600",
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const Spinner = ({ sm }) => (
  <svg
    className={`animate-spin ${sm ? "w-3.5 h-3.5" : "w-8 h-8"}`}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
      {msg}
    </p>
  ) : null;

const ModalInput = ({ placeholder, type = "text", ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    {...props}
    className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
      placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
      transition-all duration-200"
  />
);

const ModalSelect = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
      focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
      transition-all duration-200 appearance-none cursor-pointer"
  >
    {children}
  </select>
);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7 w-full max-w-md shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition text-2xl leading-none"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [modal, setModal] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const isAdmin = role === "Admin";

  // ── Fetch current user role ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(
          "https://team-task-manager-zbjw.onrender.com/user/me",
          {
            withCredentials: true,
          },
        );
        setRole(res.data.user?.role);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRole();
  }, []);

  // ── Fetch project details ─────────────────────────────────────────────────
  const fetchProject = async () => {
    try {
      const res = await axios.get(
        `https://team-task-manager-zbjw.onrender.com/project/${projectId}`,
        { withCredentials: true },
      );
      setProject(res.data.project);
    } catch (err) {
      console.log(err);
    }
  };

  // ── Fetch tasks ───────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const url = isAdmin
        ? `https://team-task-manager-zbjw.onrender.com/task/all/${projectId}`
        : `https://team-task-manager-zbjw.onrender.com/task/project/${projectId}`;
      const res = await axios.get(url, { withCredentials: true });
      setTasks(res.data.tasks);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch workspace members (admin only) ──────────────────────────────────
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        "https://team-task-manager-zbjw.onrender.com/project/all_members",
        {
          withCredentials: true,
        },
      );
      // console.log(res.data)
      setMembers(res.data.members || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (role === null) return;
    fetchProject();
    fetchTasks();
    if (isAdmin) fetchMembers();
  }, [role, projectId]);

  // ── Status counts ─────────────────────────────────────────────────────────
  const counts = {
    "to-do": tasks.filter((t) => t.status === "to-do").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Done: tasks.filter((t) => t.status === "Done").length,
  };

  // ── Update task status ────────────────────────────────────────────────────
  const updateStatus = async (taskId, status) => {
    setUpdatingId(taskId);
    try {
      await axios.post(
        `https://team-task-manager-zbjw.onrender.com/task/update_status/${taskId}`,
        { status },
        { withCredentials: true },
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t)),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete task ───────────────────────────────────────────────────────────
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(
        `https://team-task-manager-zbjw.onrender.com/task/delete/${taskId}`,
        {
          withCredentials: true,
        },
      );
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.log(err);
    }
  };

  // ── FORM: Create Task ─────────────────────────────────────────────────────
  const {
    register: regT,
    handleSubmit: handleT,
    reset: resetT,
    formState: { errors: errT, isSubmitting: subT },
  } = useForm();

  const onCreateTask = async (data) => {
    try {
      await axios.post(
        `https://team-task-manager-zbjw.onrender.com/task/create/${projectId}`,
        data,
        {
          withCredentials: true,
        },
      );
      resetT();
      setModal(null);
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // ── FORM: Assign Task ─────────────────────────────────────────────────────
  const {
    register: regA,
    handleSubmit: handleA,
    reset: resetA,
    formState: { errors: errA, isSubmitting: subA },
  } = useForm();

  const onAssignTask = async (data) => {
    try {
      await axios.post(
        `https://team-task-manager-zbjw.onrender.com/task/assign/${activeTask._id}/${data.memberId}`,
        {},
        { withCredentials: true },
      );

      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeTask._id
            ? { ...t, assignee: members.find((m) => m._id === data.memberId) }
            : t,
        ),
      );

      resetA();
      setModal(null);
    } catch (err) {
      console.log(err);
    }
  };
  const closeModal = () => {
    setModal(null);
    setActiveTask(null);
  };

  const isOverdue = (dueDate, status) =>
    dueDate && new Date(dueDate) < new Date() && status !== "Done";

  // ── Project members from project data ─────────────────────────────────────
  const projectMembers = project?.members || [];

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="ml-60 flex-1 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-80px] left-[20%] w-[420px] h-[420px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-0 w-[360px] h-[360px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">
          {/* ── Back button ── */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-violet-400 text-sm mb-8 transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </button>

          {/* ── Project Header Card ── */}
          {project && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-7 mb-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-violet-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-2xl font-bold text-white tracking-tight">
                        {project.name}
                      </h1>
                      <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-violet-400 text-xs font-semibold">
                          {isAdmin ? "Admin View" : "Member View"}
                        </span>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-gray-400 text-sm leading-relaxed mt-1 max-w-2xl">
                        {project.description}
                      </p>
                    )}
                    {project.createdBy?.fullname && (
                      <p className="text-gray-600 text-xs mt-2">
                        Created by{" "}
                        <span className="text-gray-500">
                          {project.createdBy.fullname}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setModal("createTask")}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                      text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-900/30 flex-shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Task
                  </button>
                )}
              </div>

              {/* ── Project Members Section ── */}
              {projectMembers.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    Project Members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectMembers.map((m, i) => {
                      const grad = avatarGradients[i % avatarGradients.length];
                      return (
                        <div
                          key={m._id || i}
                          className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}
                          >
                            <span className="text-white text-xs font-bold leading-none">
                              {m.fullname?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium leading-none">
                              {m.fullname}
                            </p>
                            {m.email && (
                              <p className="text-gray-500 text-xs mt-0.5">
                                {m.email}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-900/80 border border-gray-800 rounded-2xl">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                No tasks yet
              </p>
              <p className="text-gray-500 text-sm mb-5">
                {isAdmin
                  ? "Create the first task for this project."
                  : "You have no tasks assigned here yet."}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setModal("createTask")}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200"
                >
                  + Create First Task
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── Stat summary bar ── */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(counts).map(([status, count]) => {
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div
                      key={status}
                      className="bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold text-2xl">{count}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {cfg.label}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.pill}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── Task list ── */}
              <div className="space-y-4">
                {tasks.map((task) => {
                  const statusCfg =
                    STATUS_CONFIG[task.status] || STATUS_CONFIG["to-do"];
                  const isDone = task.status === "Done";
                  const isUpdating = updatingId === task._id;
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task._id}
                      className={`group bg-gray-900/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300
                        ${overdue ? "border-red-500/30" : isDone ? "border-emerald-500/20" : "border-gray-800 hover:border-violet-500/30"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* ── Left: task info ── */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {isDone && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-emerald-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                            {overdue && (
                              <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-red-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01"
                                  />
                                </svg>
                              </div>
                            )}
                            <h3
                              className={`font-semibold text-base ${isDone ? "line-through text-gray-500" : "text-white"}`}
                            >
                              {task.title}
                            </h3>
                            {task.priority && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium}`}
                              >
                                {task.priority}
                              </span>
                            )}
                            {overdue && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/15 text-red-400 border border-red-500/20">
                                Overdue
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-gray-500 text-sm leading-relaxed mb-3">
                              {task.description}
                            </p>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-4 flex-wrap">
                            {task.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold leading-none">
                                    {task.assignee.fullname
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {task.assignee.fullname}
                                </span>
                              </div>
                            ) : isAdmin ? (
                              <span className="text-amber-500/70 text-xs flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                  />
                                </svg>
                                Unassigned
                              </span>
                            ) : null}

                            {task.dueDate && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5 text-gray-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span
                                  className={`text-xs font-medium ${overdue ? "text-red-400" : isDone ? "text-gray-600" : "text-gray-400"}`}
                                >
                                  Due{" "}
                                  {new Date(task.dueDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ── Right: actions ── */}
                        <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${statusCfg.pill}`}
                          >
                            {statusCfg.label}
                          </span>

                          {/* Status dropdown */}
                          <div className="relative flex items-center gap-2">
                            {isUpdating && (
                              <div className="text-violet-400">
                                <Spinner sm />
                              </div>
                            )}
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateStatus(task._id, e.target.value)
                                }
                                disabled={isUpdating}
                                className="bg-gray-800/70 border border-gray-700 text-white text-xs rounded-xl px-3 py-2 pr-8
                                  focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                              >
                                <option value="to-do" className="bg-gray-900">
                                  To Do
                                </option>
                                <option
                                  value="In Progress"
                                  className="bg-gray-900"
                                >
                                  In Progress
                                </option>
                                <option value="Done" className="bg-gray-900">
                                  Done
                                </option>
                              </select>
                              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                                <svg
                                  className="w-3 h-3 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Admin-only actions */}
                          {isAdmin && (
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => {
                                  setActiveTask(task);
                                  setModal("assignTask");
                                }}
                                title="Assign to member"
                                className="flex items-center gap-1.5 bg-gray-800 hover:bg-indigo-500/20 border border-gray-700 hover:border-indigo-500/40
                                  rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:text-indigo-300 transition-all duration-200"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {task.assignee ? "Reassign" : "Assign"}
                              </button>

                              <button
                                onClick={() => deleteTask(task._id)}
                                title="Delete task"
                                className="flex items-center gap-1.5 bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40
                                  rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-400 transition-all duration-200"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* Create Task */}
      {modal === "createTask" && (
        <Modal title="Add New Task" onClose={closeModal}>
          <form onSubmit={handleT(onCreateTask)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Task Title
              </label>
              <ModalInput
                placeholder="e.g. Design homepage mockup"
                {...regT("title", { required: "Task title is required" })}
              />
              <FieldError msg={errT.title?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Task details..."
                {...regT("description")}
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                  placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                  transition-all duration-200 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Priority
              </label>
              <ModalSelect {...regT("priority")}>
                <option value="" className="bg-gray-900 text-gray-400">
                  Select priority
                </option>
                <option value="high" className="bg-gray-900 text-white">
                  High
                </option>
                <option value="medium" className="bg-gray-900 text-white">
                  Medium
                </option>
                <option value="low" className="bg-gray-900 text-white">
                  Low
                </option>
              </ModalSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Due Date
              </label>
              <ModalInput
                type="date"
                {...regT("dueDate")}
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                  transition-all duration-200 [color-scheme:dark]"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subT}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {subT ? (
                  <>
                    <Spinner sm /> Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Task */}
      {modal === "assignTask" && (
        <Modal title={`Assign — ${activeTask?.title}`} onClose={closeModal}>
          <p className="text-gray-500 text-sm mb-4">
            {activeTask?.assignee
              ? `Currently assigned to ${activeTask.assignee.fullname}. Select a member to reassign.`
              : "Select a member to assign this task to."}
          </p>
          <form onSubmit={handleA(onAssignTask)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Member
              </label>
              <ModalSelect
                {...regA("memberId", { required: "Please select a member" })}
              >
                <option value="" className="bg-gray-900 text-gray-400">
                  Select member
                </option>
                {members.map((m) => (
                  <option
                    key={m._id}
                    value={m._id}
                    className="bg-gray-900 text-white"
                  >
                    {m.fullname} — {m.email}
                  </option>
                ))}
              </ModalSelect>
              <FieldError msg={errA.memberId?.message} />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subA}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {subA ? (
                  <>
                    <Spinner sm /> Assigning...
                  </>
                ) : (
                  "Assign Task"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetails;
