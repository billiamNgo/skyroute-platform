//import { useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import "./Dashboard.css"

//const API_BASE = "http://localhost:8080";

export default function PharmacistDashboard() {
//const navigate = useNavigate();

  /** useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "pharmacist") { 
    navigate("/login");
  }

}, [navigate]); **/

const handleLogout = async () => { 
  /**const token = localStorage.getItem("token");

  try { 
    await fetch(`${API_BASE}/auth/logout`, { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) { 
    console.error ("Logout failed:", error);
  } finally { 
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  } **/
  await logoutUser();
};

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title"> Pharmacist Dashboard</h1>
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}