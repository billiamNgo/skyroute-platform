import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"

const API_BASE = "http://localhost:8080";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => { 
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") { 
      navigate("/login")
    }
  }, [navigate]);

  const handleLogout = async () => { 
    const token = localStorage.getItem("token");

    try { 
      await fetch(`${API_BASE}/auth/logout`, { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) { 
      console.error("Logout failed:", error);
    } finally { 
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email")
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title"> Admin Dashboard</h1>
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}