import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";
import "./Dashboard.css";
import "./OrdersPage.css";

type Drone = {
  droneID: number;
  currentStatus: string;
};

export default function PharmacistDronesPage() {
  const navigate = useNavigate();

  const [drones, setDrones] = useState<Drone[]>([]);
  const [loadingDrones, setLoadingDrones] = useState(true);

  const handleLogout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    const fetchDrones = async () => {
      setLoadingDrones(true);

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
          throw new Error("Failed to parse drones response.");
        }

        const dronesArray = Array.isArray(data) ? data : data.drones;

        if (!Array.isArray(dronesArray)) {
          throw new Error("API did not return an array of drones");
        }

        const mappedDrones = dronesArray.map((drone: any) => ({
          droneID: drone.droneID,
          currentStatus: drone.currentStatus || "Unknown",
        }));

        setDrones(mappedDrones);
      } catch (err) {
        console.error("Error loading drones:", err);
        setDrones([]);
      } finally {
        setLoadingDrones(false);
      }
    };

    fetchDrones();
  }, []);

  const availableDrones = drones.filter((drone) =>
    ["available", "idle", "ready"].includes(
      drone.currentStatus?.toLowerCase()
    )
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button
            className="orders-tab"
            onClick={() => navigate("/pharmacist")}
          >
            Back
          </button>

          <button
            className="dashboard-danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h1 className="dashboard-title">Available Drones</h1>
        <p className="dashboard-subtitle">
          Review drones that are ready to be assigned to delivery orders.
        </p>

        {loadingDrones ? (
          <div>Loading drones...</div>
        ) : availableDrones.length === 0 ? (
          <div className="order-details-placeholder">
            No available drones right now
          </div>
        ) : (
          <div className="order-details-card">
            {availableDrones.map((drone) => (
              <p key={drone.droneID}>
                <strong>Drone {drone.droneID}</strong> — {drone.currentStatus}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}