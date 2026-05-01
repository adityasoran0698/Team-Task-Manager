import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { projectId } = useParams();
  // Fetch current user info to show name + role, and to drive nav items
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("http://localhost:8000/user/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMe();
  }, []);

  const isAdmin = user?.role === "Admin";

  // Nav link style — active vs inactive
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
    ${
      isActive
        ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
        : "text-gray-500 hover:text-white hover:bg-gray-800/60"
    }`;

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/user/logout",
        {},
        { withCredentials: true },
      );
    } catch (_) {}
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">
              TaskFlow
            </p>
            <p className="text-gray-600 text-xs">Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {/* Section label */}
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-4 mb-3">
          Main
        </p>

        {/* Member nav — both roles see this */}
        <NavLink to="/" className={navClass}>
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Dashboard
        </NavLink>

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-4 mt-5 mb-3">
              Admin
            </p>

            <NavLink to="/project/projects" className={navClass}>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
              </svg>
              All Projects
            </NavLink>

            <NavLink to="/admin/members/" className={navClass}>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Members
            </NavLink>
          </>
        )}
      </nav>

      {/* User profile + logout at the bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl">
            {/* Avatar initials */}
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user.fullname?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.fullname}
              </p>
              <span
                className={`text-xs font-medium ${isAdmin ? "text-violet-400" : "text-cyan-400"}`}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
              strokeWidth={1.8}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
