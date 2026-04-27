import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./DroneManagementPage.css";

type Drone = { 
    droneID: number;
    pharmacyID: number;
    currentStatus: string;
    batteryLevel?: number;
};


export default function DroneDetailsPage() { 
    const { droneId } = useParams();
    const navigate = useNavigate();

    const [drone, setDrone] = useState<Drone | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => { 
        const fetchDrone = async () => { 
            setLoading(true);
            setError("");

            try { 
                const res = await fetch
                (`http://localhost:8080/drones/${droneId}`, 
                    { 
                        headers: { 
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();

                if (!res.ok) { 
                    throw new Error(data.message || "Failed to load drone");
                }

                setDrone(data);

            } catch (err: any) { 
                setError(err.message);
            } finally { 
                setLoading(false);
            }
        };

        if (droneId) fetchDrone();
    }, [droneId]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container drone-panel">

            <button
                className="orders-tab"
                onClick={() => navigate("/fleet")}
            >
                Back to Fleet
            </button>

            <h1 className="dashboard-title">Drone Details</h1>

            {loading && <div>Loading drone...</div>}
            {error && <div className="drone-error">{error}</div>}

            {drone && (
                <div>
                    <p><strong>Drone ID:</strong> {drone.droneID}</p>
                    <p><strong>Pharmacy ID:</strong> {drone.pharmacyID}</p>
                    <p><strong>Status:</strong> {drone.currentStatus}</p>

                    <p>
                        <strong>Battery:</strong>{" "}
                        {drone.batteryLevel ?? "-"}%
                    </p>
                </div>
            )}

      </div>
    </div>
  );
}