import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { logoutUser } from "../utils/auth";
import { getDrones, type Drone } from '../utils/drones';
import NotificationsBell from "../components/NotificationsBell";
import "./Dashboard.css"
import "./OrdersPage.css";

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => { 
    await logoutUser();
  };

  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getDrones();
        setDrones(data);
      } catch (err) {
        // ignore for dashboard
        setDrones([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

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
            className="orders-tab"
            onClick={() => navigate('/fleet')}
          >
            Tracking
          </button>

          <NotificationsBell />
          
          <button 
            className="dashboard-danger-button" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: 24 }}>
          <h2 className="orders-section-title">Quick Track</h2>
          {loading ? (
            <div>Loading drones...</div>
          ) : drones.length === 0 ? (
            <div>No drones available</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {drones.map(d => (
                <button key={d.droneID} className="orders-tab" onClick={() => navigate(`/fleet/track/${d.droneID}`)}>
                  Track #{d.droneID}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}