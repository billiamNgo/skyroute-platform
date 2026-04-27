import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./DroneManagementPage.css";
import NotificationsBell from "../components/NotificationsBell";
import StaffHeader from "../components/StaffHeader";

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
                const res = await fetch(`http://localhost:8080/drones/${droneId}`, { 
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

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

    const getBatteryColor = (level?: number) => {
        if (!level) return "#cbd5e1";
        if (level > 70) return "#10b981";
        if (level > 20) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container orders-page-container">
                <StaffHeader activeTab="fleet" />

                <div className="drone-details-header" style={{ marginTop: '20px' }}>
                    <h1 className="dashboard-title">Drone #{droneId} Details</h1>
                    <button 
                        className="dashboard-button"
                        onClick={() => navigate(`/fleet/track/${droneId}`)}
                        style={{ marginLeft: 'auto' }}
                    >
                        Live Tracking
                    </button>
                </div>

                {loading ? (
                    <div className="order-details-placeholder">Loading drone data...</div>
                ) : error ? (
                    <div className="drone-error">{error}</div>
                ) : drone ? (
                    <div className="order-details-card" style={{ marginTop: '20px' }}>
                        <div className="drone-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="info-item">
                                <label style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>STATUS</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        backgroundColor: drone.currentStatus === 'IN_TRANSIT' ? '#fee2e2' : '#ecfdf5',
                                        color: drone.currentStatus === 'IN_TRANSIT' ? '#ef4444' : '#10b981',
                                        fontSize: '0.9rem'
                                    }}>
                                        {drone.currentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <label style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>BATTERY LEVEL</label>
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '100px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${drone.batteryLevel || 0}%`, 
                                            height: '100%', 
                                            backgroundColor: getBatteryColor(drone.batteryLevel) 
                                        }} />
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{drone.batteryLevel}%</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <label style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>PHARMACY ID</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                                    #{drone.pharmacyID}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <h3>Maintenance Log</h3>
                            <p style={{ color: '#64748b', marginTop: '10px' }}>No recent maintenance alerts for this drone.</p>
                        </div>
                    </div>
                ) : (
                    <div className="order-details-placeholder">Drone not found.</div>
                )}
            </div>
        </div>
    );
}