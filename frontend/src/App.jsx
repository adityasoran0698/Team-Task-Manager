import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectDetails from "./pages/ProjectDetails";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RoleBasedDashboard from "./RoleBasedDashboard";
import AllProjects from "./pages/AllProjects";
import MembersPage from "./pages/MembersPage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/project/projects" element={<AllProjects />} />
        <Route path="/admin/members/" element={<MembersPage />} />{" "}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="task/project/:projectId" element={<ProjectDetails />} />
      </Routes>
    </div>
  );
};

export default App;
