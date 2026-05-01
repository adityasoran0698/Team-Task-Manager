import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const avatarGradients = [
  "from-violet-600 to-indigo-600",
  "from-cyan-600 to-teal-600",
  "from-pink-600 to-rose-600",
  "from-amber-600 to-orange-600",
  "from-emerald-600 to-green-600",
  "from-blue-600 to-cyan-600",
];

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

const MembersPage = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ── Add to Project modal state ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberId, setAddMemberId] = useState("");
  const [addProjectId, setAddProjectId] = useState("");

  // ── Remove from Project modal state ──
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState("");
  const [removeMemberName, setRemoveMemberName] = useState("");
  const [removeProjectId, setRemoveProjectId] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch Members ──
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/project/members", {
          withCredentials: true,
        });
        setMembers(res.data.users || []);
      } catch (err) {
        setError("Failed to load members.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // ── Fetch Projects ──
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.post(
          "http://localhost:8000/project/all_projects",
          {},
          { withCredentials: true },
        );
        setProjects(res.data.projects || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProjects();
  }, []);

  // ── Open Remove Modal ──
  const openRemoveModal = (member) => {
    setRemoveMemberId(member._id);
    setRemoveMemberName(member.fullname);
    setRemoveProjectId("");
    setShowRemoveModal(true);
  };

  // ── Confirm Remove Member from selected project ──
  const handleRemoveMember = async () => {
    if (!removeProjectId) return;
    setActionLoading("remove");
    try {
      await axios.delete(
        `http://localhost:8000/project/del_member/${removeProjectId}/${removeMemberId}`,
        { withCredentials: true },
      );
      setMembers((prev) => prev.filter((m) => m._id !== removeMemberId));

      setShowRemoveModal(false);
      setRemoveMemberId("");
      setRemoveMemberName("");
      setRemoveProjectId("");
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="ml-60 flex-1 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-[-80px] left-[20%] w-[420px] h-[420px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-0 w-[360px] h-[360px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">
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
                Team Members
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage workspace members and their project assignments
              </p>
            </div>
          </div>

          {/* ── Stat strip ── */}
          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold text-cyan-400">
                  {members.length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Total Members</p>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold text-violet-400">
                  {filtered.length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Showing</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4">
                <p className="text-3xl font-bold text-indigo-400">
                  {projects.length}
                </p>
                <p className="text-gray-500 text-xs mt-1">Active Projects</p>
              </div>
            </div>
          )}

          {/* ── Search bar ── */}
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
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 text-white rounded-xl pl-11 pr-10 py-3 text-sm
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

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-5 flex items-center gap-3 mb-6">
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
              <p className="text-gray-500 text-sm">Loading members...</p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-900/60 border border-gray-800 rounded-2xl border-dashed">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                {search ? "No members match your search" : "No members yet"}
              </p>
              <p className="text-gray-500 text-sm">
                {search
                  ? "Try a different keyword"
                  : "Members will appear here once registered."}
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

          {/* ── Members list ── */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((member, i) => {
                const grad = avatarGradients[i % avatarGradients.length];

                return (
                  <div
                    key={member._id}
                    className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-violet-500/30
                      rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200"
                  >
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <span className="text-white font-bold text-base leading-none">
                          {member.fullname?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {member.fullname}
                        </p>
                        <p className="text-gray-500 text-xs truncate mt-0.5">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    {/* Right: role badge + actions */}
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full font-medium bg-gray-800 text-gray-400 border border-gray-700">
                        {member.role || "Member"}
                      </span>

                      {/* Remove from Project — opens modal to pick project */}
                      <button
                        onClick={() => openRemoveModal(member)}
                        className="flex items-center gap-1.5 bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40
                          rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 transition-all duration-200"
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
                            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add to Project Modal ── */}
      {showAddModal && (
        <Modal
          title="Add Member to Project"
          onClose={() => {
            setShowAddModal(false);
            setAddMemberId("");
            setAddProjectId("");
          }}
        >
          <p className="text-gray-500 text-sm mb-5">
            Select a project to add this member to.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Project
              </label>
              <div className="relative">
                <select
                  value={addProjectId}
                  onChange={(e) => setAddProjectId(e.target.value)}
                  className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                    transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900 text-gray-400">
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                      className="bg-gray-900 text-white"
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
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
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddMemberId("");
                  setAddProjectId("");
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Remove from Project Modal ── */}
      {showRemoveModal && (
        <Modal
          title="Remove from Project"
          onClose={() => {
            setShowRemoveModal(false);
            setRemoveMemberId("");
            setRemoveMemberName("");
            setRemoveProjectId("");
          }}
        >
          {/* Member info banner */}
          <div className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {removeMemberName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                {removeMemberName}
              </p>
              <p className="text-gray-500 text-xs">
                Select a project to remove them from
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Project
              </label>
              <div className="relative">
                <select
                  value={removeProjectId}
                  onChange={(e) => setRemoveProjectId(e.target.value)}
                  className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500
                    transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900 text-gray-400">
                    Select a project
                  </option>
                  {projects.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                      className="bg-gray-900 text-white"
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500"
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

            {/* Warning note when project is selected */}
            {removeProjectId && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
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
                <p className="text-red-400 text-xs leading-relaxed">
                  This will remove{" "}
                  <span className="font-semibold">{removeMemberName}</span> from
                  the selected project and unassign them from all related tasks.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setRemoveMemberId("");
                  setRemoveMemberName("");
                  setRemoveProjectId("");
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={!removeProjectId || actionLoading === "remove"}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500
                  disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold
                  transition flex items-center justify-center gap-2"
              >
                {actionLoading === "remove" ? (
                  <>
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
                    Removing...
                  </>
                ) : (
                  <>
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
                        d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                      />
                    </svg>
                    Confirm Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MembersPage;
