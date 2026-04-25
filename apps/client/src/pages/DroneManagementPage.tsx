import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import "./Dashboard.css";
import "./OrdersPage.css";
import "./DroneManagementPage.css";

type Drone = {
  droneID: number;
  pharmacyID: number;
  currentStatus: string;
};

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
        const res = await fetch("http://localhost:8080/drones", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          console.error("Raw response from /drones:", text);
          throw new Error("Failed to parse response from server. See console for details.");
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to load drones");
        }

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array of drones");
        }

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
              onClick={() => navigate("/tracking")}
            >
              Tracking
            </button>
            
            <button
              className="orders-tab"
              onClick={() => navigate("/notifications")}
            >
              Notifications
            </button>
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
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {drones.map((drone) => (
                  <tr key={drone.droneID}>
                    <td>{drone.droneID}</td>
                    <td>{drone.pharmacyID}</td>
                    <td>{drone.currentStatus}</td>

                    <td>
                      <button
                        onClick={() => navigate(`/fleet/${drone.droneID}`)}
                        className="orders-tab"
                        >
                          View
                        </button>
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