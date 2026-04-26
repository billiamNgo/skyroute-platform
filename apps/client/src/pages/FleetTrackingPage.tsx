import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/auth';
import { getDrones, type Drone } from '../utils/drones';
import './OrdersPage.css';
import './Dashboard.css';

export default function FleetTrackingPage() {
  const navigate = useNavigate();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDrones();
        setDrones(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load drones');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button className="orders-tab" onClick={() => navigate('/technician')}>Back</button>
          <div className="orders-nav">
            <button className="orders-tab active-tab">Tracking</button>
            <button className="orders-tab" onClick={() => navigate('/fleet')}>Drones</button>
            <button className="orders-tab" onClick={() => navigate('/orders')}>Orders</button>
          </div>
          <button className="dashboard-danger-button" onClick={logoutUser}>Logout</button>
        </div>

        <h1 className="dashboard-title">Tracking</h1>

        <div className="orders-layout">
          <div className="orders-list-panel">
            <h2 className="orders-section-title">Drones</h2>

            {loading ? (
              <div>Loading drones...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
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

          <div className="orders-details-panel">
            <h2 className="orders-section-title">Selected Drone</h2>
            <div className="order-details-placeholder">Select a drone to track it on the map</div>
          </div>
        </div>
      </div>
    </div>
  );
}
