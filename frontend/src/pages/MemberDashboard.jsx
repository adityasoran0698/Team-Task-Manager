import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const cardAccents = [
  {
    border: "border-violet-500/30",
    icon: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300",
    arrow: "text-violet-400",
  },
  {
    border: "border-indigo-500/30",
    icon: "text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-300",
    arrow: "text-indigo-400",
  },
  {
    border: "border-cyan-500/30",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300",
    arrow: "text-cyan-400",
  },
  {
    border: "border-pink-500/30",
    icon: "text-pink-400",
    badge: "bg-pink-500/15 text-pink-300",
    arrow: "text-pink-400",
  },
];

const MemberDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          "https://team-task-manager-zbjw.onrender.com/project/my_projects",
          { withCredentials: true },
        );
        setProjects(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="ml-60 flex-1 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-80px] left-[20%] w-[420px] h-[420px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-0 w-[360px] h-[360px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  TaskFlow
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                My Projects
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Projects you've been assigned to
              </p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {projects.length === 1 ? "Project" : "Projects"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
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
              <p className="text-gray-500 text-sm">
                You haven't been added to any project.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, i) => {
                const accent = cardAccents[i % cardAccents.length];
                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/task/project/${project._id}`)}
                    className={`group relative bg-gray-900/80 backdrop-blur-sm border ${accent.border}
                      rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40
                      transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-10 h-10 bg-gray-800 border ${accent.border} rounded-xl flex items-center justify-center`}
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
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${accent.badge}`}
                      >
                        Active
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1.5">
                      {project.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5">
                      {project.description || "No description provided."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <span className="text-gray-600 text-xs">
                        Click to view tasks
                      </span>
                      <div
                        className={`flex items-center gap-1 ${accent.arrow} text-sm font-medium group-hover:translate-x-1 transition-transform duration-200`}
                      >
                        View
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
                      </div>
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

export default MemberDashboard;
