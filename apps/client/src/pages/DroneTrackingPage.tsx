import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDroneTracking } from '../utils/drones';
import './DroneManagementPage.css';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io, type Socket } from 'socket.io-client';

// Fix for default marker icon in many bundlers
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

type Tracking = {
  drone: any;
  lastLocation: { latitude: number; longitude: number } | null;
};

// We'll use CircleMarker for colored pins (red for drones, blue for delivery)

export default function DroneTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;

    const start = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Initial fetch
        const data = await getDroneTracking(Number(id));
        setTracking(data as Tracking);

        // Connect socket and join pharmacy room
        const token = localStorage.getItem('token');
        socket = io((import.meta as any).env?.VITE_API_URL || 'http://localhost:8080', {
          auth: { token }
        });

        socket.on('connect', () => {
          // Join the pharmacy room for authenticated user
          const pharmacyId = (socket as any).io?.pharmacyId || ((tracking && (tracking.drone?.pharmacyID)) || undefined);
          if (pharmacyId) socket?.emit('join:pharmacy', pharmacyId);
        });

        socket.on('drone:locationUpdate', (payload: { droneId: number; latitude: number; longitude: number }) => {
          if (Number(id) !== payload.droneId) return;
          setTracking(prev => prev ? { ...prev, lastLocation: { latitude: payload.latitude, longitude: payload.longitude } } : prev);
        });

        socket.on('order:assigned', (payload: { orderId: number; droneId: number; pharmacyId: number }) => {
          // If this assignment is for our drone, we could fetch order destination (not currently provided) or show a notification
          if (Number(id) === payload.droneId) {
            // we'll just keep a mocked delivery near the drone for now, or in a future change fetch order details
            console.log('Order assigned to this drone', payload.orderId);
          }
        });

        socket.on('connect_error', (err) => {
          console.error('Socket connect error', err);
        });

      } catch (err: any) {
        setError(err.message || 'Failed to fetch tracking');
      } finally {
        setLoading(false);
      }
    };

    start();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [id]);

  if (loading) return <div>Loading tracking data...</div>;
  if (error) return <div className="drone-error">{error}</div>;
  if (!tracking) return <div>No tracking data available.</div>;

  // Drone location
  const droneLoc = tracking.lastLocation
    ? [tracking.lastLocation.latitude, tracking.lastLocation.longitude]
    : [30.4383, -84.2807];

  // For demonstration: mock delivery location slightly offset from drone
  const deliveryLoc = [droneLoc[0] + 0.005, droneLoc[1] + 0.005];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button className="orders-tab" onClick={() => navigate('/technician')}>Back</button>
        </div>

        <h1 className="dashboard-title">Drone Tracking - {id}</h1>

        <div style={{ height: '70vh', width: '100%' }}>
          <MapContainer center={droneLoc as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <CircleMarker center={droneLoc as [number, number]} pathOptions={{ color: 'red', fillColor: 'red' }} radius={8}>
              <Popup>Drone current location</Popup>
            </CircleMarker>

            <CircleMarker center={deliveryLoc as [number, number]} pathOptions={{ color: 'blue', fillColor: 'blue' }} radius={8}>
              <Popup>Delivery destination (mock)</Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
