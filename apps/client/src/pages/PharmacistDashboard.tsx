import { logoutUser } from "../utils/auth";
import "./Dashboard.css"

export default function PharmacistDashboard() {
const handleLogout = async () => { 
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