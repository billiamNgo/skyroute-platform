import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import "./Dashboard.css"
import "./OrdersPage.css";

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => { 
    await logoutUser();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title"> Technician Dashboard</h1>

        <div className="dashboard-actions">
          <button
            className="orders-tab"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </button>

          <button
            className="orders-tab"
            onClick={() => navigate("/fleet")}
          >
            Manage Drones
          </button>
          
          <button 
            className="dashboard-danger-button" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}