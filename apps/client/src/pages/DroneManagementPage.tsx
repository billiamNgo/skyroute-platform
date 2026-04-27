import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import NotificationsBell from "../components/NotificationsBell";
import "./Dashboard.css";
import "./OrdersPage.css";
import "./DroneManagementPage.css";
import { getDrones, type Drone } from "../utils/drones";

export default function DroneManagementPage() {
  const navigate = useNavigate();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    const fetchDrones = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDrones();
        setDrones(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button
            className="orders-tab"
            onClick={() => navigate("/technician")}
          >
            Back
          </button>

          <div className="orders-nav">
            <button
              className="orders-tab"
              onClick={() => navigate("/orders")}
            >
              Orders
            </button>

            <button 
              className="orders-tab active-tab">
              Drones
            </button>

            <button
              className="orders-tab"
              onClick={() => navigate("/fleet/track")}
            >
              Tracking
            </button>

            <NotificationsBell />
          </div>

          <button
            className="dashboard-danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1 className="dashboard-title">Drone Management</h1>

        <div className="drone-panel">
          <h2 className="orders-section-title">Available Drones</h2>

          {loading ? (
            <div>Loading drones...</div>
          ) : error ? (
            <div className="drone-error">{error}</div>
          ) : drones.length === 0 ? (
            <div>No drones found.</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Drone ID</th>
                  <th>Pharmacy ID</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drones.map((drone) => (
                  <tr key={drone.droneID}>
                    <td>{drone.droneID}</td>
                    <td>{drone.pharmacyID}</td>
                    <td>{drone.currentStatus}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '8px', 
                          backgroundColor: '#e2e8f0', 
                          borderRadius: '4px', 
                          overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${drone.batteryLevel || 0}%`, 
                            height: '100%', 
                            backgroundColor: (drone.batteryLevel ?? 0) > 70 ? '#10b981' : (drone.batteryLevel ?? 0) > 20 ? '#f59e0b' : '#ef4444' 
                          }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{drone.batteryLevel}%</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/fleet/${drone.droneID}`)}
                          className="orders-tab"
                          style={{ minWidth: '70px', padding: '6px 12px' }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/fleet/track/${drone.droneID}`)}
                          className="orders-tab"
                          style={{ minWidth: '70px', padding: '6px 12px' }}
                        >
                          Track
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}