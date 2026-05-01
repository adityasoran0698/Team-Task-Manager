import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const cardAccents = [
  {
    border: "border-violet-500/30",
    icon: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300",
    glow: "shadow-violet-900/20",
  },
  {
    border: "border-indigo-500/30",
    icon: "text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-300",
    glow: "shadow-indigo-900/20",
  },
  {
    border: "border-cyan-500/30",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300",
    glow: "shadow-cyan-900/20",
  },
  {
    border: "border-pink-500/30",
    icon: "text-pink-400",
    badge: "bg-pink-500/15 text-pink-300",
    glow: "shadow-pink-900/20",
  },
  {
    border: "border-amber-500/30",
    icon: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
    glow: "shadow-amber-900/20",
  },
  {
    border: "border-teal-500/30",
    icon: "text-teal-400",
    badge: "bg-teal-500/15 text-teal-300",
    glow: "shadow-teal-900/20",
  },
];

const FolderIcon = ({ className }) => (
  <svg
    className={className}
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
);

const PeopleIcon = ({ className }) => (
  <svg
    className={className}
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
);

const AllProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://team-task-manager-zbjw.onrender.com/project/all_projects",
        {},
        { withCredentials: true },
      );
      setProjects(res.data.projects || []);
    } catch (err) {
      console.log(err);
      setError("Failed to load projects. Make sure you're logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    )
      return;
    setDeletingId(projectId);
    try {
      await axios.delete(
        `https://team-task-manager-zbjw.onrender.com/project/delete/${projectId}`,
        {
          withCredentials: true,
        },
      );
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalMembers = projects.reduce(
    (sum, p) => sum + (p.members?.length || 0),
    0,
  );

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="ml-60 flex-1 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-80px] left-[10%] w-[500px] h-[500px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-40px] w-[400px] h-[400px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] bg-indigo-600 opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-10">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                All Projects
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Overview of every project in the workspace
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* ── Stat strip (2 cards only) ── */}
          {!loading && !error && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold text-violet-400">
                  {projects.length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Total Projects</p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold text-cyan-400">
                  {totalMembers}
                </p>
                <p className="text-gray-500 text-xs mt-1">Total Members</p>
              </div>
            </div>
          )}

          {/* ── Search bar ── */}
          {!loading && !error && projects.length > 0 && (
            <div className="relative mb-6">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name or description..."
                className="w-full bg-gray-900/80 border border-gray-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm
                  placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* ── Error state ── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-5 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
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
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Fetching all projects...</p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-900/60 border border-gray-800 rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <FolderIcon className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                {search ? "No projects match your search" : "No projects yet"}
              </p>
              <p className="text-gray-500 text-sm">
                {search
                  ? "Try a different keyword"
                  : "Create a project from the dashboard."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* ── Project grid ── */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((project, i) => {
                const accent = cardAccents[i % cardAccents.length];
                const memberCount = project.members?.length || 0;
                const isDeleting = deletingId === project._id;

                return (
                  <div
                    key={project._id}
                    className={`group relative bg-gray-900/80 backdrop-blur-sm border ${accent.border}
                      rounded-2xl p-6 hover:scale-[1.02] hover:shadow-2xl ${accent.glow}
                      transition-all duration-300 flex flex-col`}
                  >
                    {/* Card top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-11 h-11 bg-gray-800 border ${accent.border} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <FolderIcon className={`w-5 h-5 ${accent.icon}`} />
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${accent.badge}`}
                      >
                        Active
                      </span>
                    </div>

                    {/* Title + description */}
                    <h3 className="text-white font-semibold text-base mb-1.5 truncate">
                      {project.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">
                      {project.description || "No description provided."}
                    </p>

                    {/* Members row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800 mb-4">
                      <div className="flex items-center gap-2">
                        {memberCount > 0 ? (
                          <div className="flex -space-x-2">
                            {(project.members || [])
                              .slice(0, 3)
                              .map((m, idx) => (
                                <div
                                  key={m._id || idx}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-gray-900 flex items-center justify-center"
                                  title={m.fullname}
                                >
                                  <span className="text-white text-xs font-bold leading-none">
                                    {m.fullname?.charAt(0)?.toUpperCase() ||
                                      "?"}
                                  </span>
                                </div>
                              ))}
                            {memberCount > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-bold leading-none">
                                  +{memberCount - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <PeopleIcon className="w-4 h-4 text-gray-700" />
                        )}
                        <span className="text-gray-600 text-xs">
                          {memberCount === 0
                            ? "No members"
                            : `${memberCount} member${memberCount > 1 ? "s" : ""}`}
                        </span>
                      </div>

                      {project.createdBy?.fullname && (
                        <span
                          className="text-gray-700 text-xs truncate max-w-[100px]"
                          title={project.createdBy.fullname}
                        >
                          by {project.createdBy.fullname}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/task/project/${project._id}`)}
                        className={`flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40
                          rounded-xl py-2 text-xs font-medium text-gray-400 hover:text-violet-300 transition-all duration-200`}
                      >
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Project
                      </button>

                      <button
                        onClick={(e) => handleDeleteProject(e, project._id)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40
                          rounded-xl px-3 py-2 text-xs text-gray-400 hover:text-red-400 transition-all duration-200 disabled:opacity-50"
                        title="Delete project"
                      >
                        {isDeleting ? (
                          <svg
                            className="animate-spin w-3.5 h-3.5"
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
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        ) : (
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
