import React, { useEffect, useState } from "react";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";

const RoleBasedDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://team-task-manager-zbjw.onrender.com/user/me",
          {
            withCredentials: true, // VERY IMPORTANT for cookies
          },
        );
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Unauthorized</div>;

  return user.role === "Admin" ? <AdminDashboard /> : <MemberDashboard />;
};

export default RoleBasedDashboard;
