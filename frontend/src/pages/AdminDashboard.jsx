import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";

const Spinner = ({ sm }) => (
  <svg
    className={`animate-spin ${sm ? "w-4 h-4" : "w-8 h-8"}`}
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

const cardAccents = [
  {
    border: "border-violet-500/30",
    icon: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300",
    glow: "hover:shadow-violet-900/20",
  },
  {
    border: "border-indigo-500/30",
    icon: "text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-300",
    glow: "hover:shadow-indigo-900/20",
  },
  {
    border: "border-cyan-500/30",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300",
    glow: "hover:shadow-cyan-900/20",
  },
  {
    border: "border-pink-500/30",
    icon: "text-pink-400",
    badge: "bg-pink-500/15 text-pink-300",
    glow: "hover:shadow-pink-900/20",
  },
  {
    border: "border-amber-500/30",
    icon: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
    glow: "hover:shadow-amber-900/20",
  },
  {
    border: "border-teal-500/30",
    icon: "text-teal-400",
    badge: "bg-teal-500/15 text-teal-300",
    glow: "hover:shadow-teal-900/20",
  },
];

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7 w-full max-w-md shadow-2xl">
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

const Input = ({ placeholder, type = "text", ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    {...props}
    className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
      placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
  />
);

const SelInput = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
      focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 appearance-none cursor-pointer"
  >
    {children}
  </select>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [showOverdueTasks, setShowOverdueTasks] = useState(false);

  const fetchProjects = async () => {
    const res = await axios.post(
      "http://localhost:8000/project/all_projects",
      {},
      { withCredentials: true },
    );
    return res.data.projects || [];
  };

  const fetchMembers = async () => {
    const res = await axios.get("http://localhost:8000/project/members", {
      withCredentials: true,
    });
    return res.data.users || [];
  };

  // Fetch all tasks across all projects to compute overdue count
  const fetchAllTasks = async (projectList) => {
    const taskPromises = projectList.map((p) =>
      axios
        .get(`http://localhost:8000/task/all/${p._id}`, {
          withCredentials: true,
        })
        .then((r) => r.data.tasks || [])
        .catch(() => []),
    );
    const results = await Promise.all(taskPromises);
    return results.flat();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [projectList, memberList] = await Promise.all([
          fetchProjects(),
          fetchMembers(),
        ]);
        setProjects(projectList);
        setMembers(memberList);
        const tasks = await fetchAllTasks(projectList);
        setAllTasks(tasks);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const now = new Date();
  const overdueTasks = allTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Done",
  );

  // ── CREATE PROJECT ────────────────────────────────────────────────────────
  const {
    register: regP,
    handleSubmit: handleP,
    reset: resetP,
    formState: { errors: errP, isSubmitting: subP },
  } = useForm();

  const onCreateProject = async (data) => {
    try {
      await axios.post("http://localhost:8000/project/create", data, {
        withCredentials: true,
      });
      resetP();
      setModal(null);
      const projectList = await fetchProjects();
      setProjects(projectList);
      const tasks = await fetchAllTasks(projectList);
      setAllTasks(tasks);
    } catch (err) {
      console.log(err);
    }
  };

  // ── ADD MEMBER ────────────────────────────────────────────────────────────
  const {
    register: regM,
    handleSubmit: handleM,
    reset: resetM,
    formState: { errors: errM, isSubmitting: subM },
  } = useForm();

  

  const closeModal = () => {
    setModal(null);
    setActiveProject(null);
  };

  // Sort projects newest first (by _id which is a MongoDB ObjectId = time-ordered)
  const recentProjects = [...projects]
    .sort((a, b) => (a._id < b._id ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="ml-60 flex-1 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[20%] w-[420px] h-[420px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-0 w-[360px] h-[360px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-0 w-[280px] h-[280px] bg-indigo-600 opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-10">
          {/* ── Page header ── */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back — here's your workspace overview
              </p>
            </div>
            <button
              onClick={() => setModal("createProject")}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-900/30"
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
              New Project
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {/* Total Projects */}
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-5 flex items-center gap-4">
                  <div className="flex-shrink-0 text-violet-400">
                    <svg
                      className="w-5 h-5"
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
                  <div>
                    <p className="text-3xl font-bold text-violet-400">
                      {projects.length}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Total Projects
                    </p>
                  </div>
                </div>

                {/* Total Members */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-5 flex items-center gap-4">
                  <div className="flex-shrink-0 text-cyan-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-cyan-400">
                      {members.length}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Total Members
                    </p>
                  </div>
                </div>

                {/* Total Tasks */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-5 flex items-center gap-4">
                  <div className="flex-shrink-0 text-indigo-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-indigo-400">
                      {allTasks.length}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">Total Tasks</p>
                  </div>
                </div>

                {/* Overdue Tasks — clickable */}
                <button
                  onClick={() =>
                    overdueTasks.length > 0 && setShowOverdueTasks(true)
                  }
                  className={`bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-5 flex items-center gap-4 text-left
                    transition-all duration-200 ${overdueTasks.length > 0 ? "hover:border-red-500/40 hover:bg-red-500/15 cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex-shrink-0 text-red-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-red-400">
                        {overdueTasks.length}
                      </p>
                      {overdueTasks.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Overdue Tasks
                      {overdueTasks.length > 0 && (
                        <span className="text-red-400/70 ml-1">
                          · tap to view
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              </div>

              {/* ── Recent projects ── */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">
                  Recent Projects
                </h2>
                {projects.length > 6 && (
                  <button
                    onClick={() => navigate("/project/projects")}
                    className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    View all
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-900/60 border border-gray-800 border-dashed rounded-2xl">
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
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">
                    No projects yet
                  </p>
                  <p className="text-gray-500 text-sm mb-5">
                    Create your first project to get started.
                  </p>
                  <button
                    onClick={() => setModal("createProject")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200"
                  >
                    + Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project, i) => {
                    const accent = cardAccents[i % cardAccents.length];
                    const memberCount = project.members?.length || 0;

                    return (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/task/project/${project._id}`)}
                        className={`group relative bg-gray-900/80 backdrop-blur-sm border ${accent.border}
                          rounded-2xl p-5 cursor-pointer hover:scale-[1.02] hover:shadow-2xl ${accent.glow}
                          transition-all duration-300 flex flex-col`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-10 h-10 bg-gray-800 border ${accent.border} rounded-xl flex items-center justify-center flex-shrink-0`}
                          >
                            <svg
                              className={`w-5 h-5 ${accent.icon}`}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(project);
                              setModal("addMember");
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${accent.badge} hover:opacity-80 transition-opacity`}
                          >
                            + Member
                          </button>
                        </div>

                        <h3 className="text-white font-semibold text-sm mb-1 truncate">
                          {project.name}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1 mb-4">
                          {project.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                          <div className="flex items-center gap-2">
                            {memberCount > 0 ? (
                              <div className="flex -space-x-1.5">
                                {(project.members || [])
                                  .slice(0, 3)
                                  .map((m, idx) => (
                                    <div
                                      key={m._id || idx}
                                      className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-gray-900 flex items-center justify-center"
                                      title={m.fullname}
                                    >
                                      <span
                                        className="text-white text-xs font-bold leading-none"
                                        style={{ fontSize: "9px" }}
                                      >
                                        {m.fullname?.charAt(0)?.toUpperCase() ||
                                          "?"}
                                      </span>
                                    </div>
                                  ))}
                                {memberCount > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                                    <span
                                      className="text-gray-400 font-bold leading-none"
                                      style={{ fontSize: "9px" }}
                                    >
                                      +{memberCount - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-700 text-xs">
                                No members
                              </span>
                            )}
                            {memberCount > 0 && (
                              <span className="text-gray-600 text-xs">
                                {memberCount}
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex items-center gap-1 ${accent.icon} text-xs font-medium group-hover:translate-x-1 transition-transform duration-200`}
                          >
                            View Tasks
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* Create Project */}
      {modal === "createProject" && (
        <Modal title="Create New Project" onClose={closeModal}>
          <form onSubmit={handleP(onCreateProject)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Project Name
              </label>
              <Input
                placeholder="e.g. Website Redesign"
                {...regP("name", { required: "Project name is required" })}
              />
              <FieldError msg={errP.name?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="What is this project about?"
                {...regP("description")}
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                  placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                  transition-all duration-200 resize-none"
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
                disabled={subP}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {subP ? (
                  <>
                    <Spinner sm /> Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

     

      {/* ── Overdue Tasks Drawer/Modal ── */}
      {showOverdueTasks && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">
                    Overdue Tasks
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {overdueTasks.length} task
                    {overdueTasks.length !== 1 ? "s" : ""} past due date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOverdueTasks(false)}
                className="text-gray-500 hover:text-white transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {overdueTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-800/60 border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {task.assignee && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                              <span
                                className="text-white font-bold"
                                style={{ fontSize: "8px" }}
                              >
                                {task.assignee.fullname
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            {task.assignee.fullname}
                          </span>
                        )}
                        <span className="text-red-400 text-xs flex items-center gap-1">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Due{" "}
                          {new Date(task.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowOverdueTasks(false);
                        navigate(`/task/project/${task.project}`);
                      }}
                      className="flex-shrink-0 flex items-center gap-1 bg-gray-700 hover:bg-violet-500/20 border border-gray-600 hover:border-violet-500/40
                        rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:text-violet-300 transition-all duration-200"
                    >
                      View
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => setShowOverdueTasks(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
