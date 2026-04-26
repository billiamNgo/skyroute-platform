import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDroneTracking } from '../utils/drones';
import './DroneManagementPage.css';

import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io, type Socket } from 'socket.io-client';

import { useMap } from 'react-leaflet';

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center]);
  return null;
}


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
  const [deliveryLoc, setDeliveryLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;

    const start = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getDroneTracking(Number(id));
        setTracking(data as Tracking);
        // If drone is already on a mission, fetch the active order destination
        if (data?.drone?.currentStatus === 'IN_TRANSIT') {
          try {
            const orderData = await getActiveDroneOrder(Number(id)); // you'll need this util
            if (orderData?.destinationLat && orderData?.destinationLon) {
              setDeliveryLoc([orderData.destinationLat, orderData.destinationLon]);
            }
          } catch (err) {
            console.warn('Could not fetch active order destination', err);
          }
        }

        const token = localStorage.getItem('token');
        socket = io((import.meta as any).env?.VITE_API_URL || 'http://localhost:8080', {
          auth: { token }
        });

        socket.on('connect', () => {
          const pharmacyId = data?.drone?.pharmacyID; // ← use data, not tracking
          if (pharmacyId) socket?.emit('join:pharmacy', pharmacyId);
        });
        socket.on('drone:locationUpdate', (payload: { droneId: number; latitude: number; longitude: number }) => {
          if (Number(id) !== payload.droneId) return;
          setTracking(prev => prev ? { ...prev, lastLocation: { latitude: payload.latitude, longitude: payload.longitude } } : prev);
        });

        socket.on('order:assigned', (payload: { orderId: number; droneId: number; pharmacyId: number; originLat?: number; originLon?: number; destinationLat?: number; destinationLon?: number }) => {
          // If this assignment is for our drone, set the delivery coordinates from payload
          if (Number(id) === payload.droneId) {
            console.log('Order assigned to this drone', payload.orderId);
            if (payload.destinationLat && payload.destinationLon) {
              setDeliveryLoc([payload.destinationLat, payload.destinationLon]);
            }
          }
        });

        socket.on('connect_error', (err: any) => {
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

  // Use delivery location from state when available, otherwise a small mock offset for demo
  const displayDeliveryLoc = deliveryLoc ?? [droneLoc[0] + 0.005, droneLoc[1] + 0.005];

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

            <MapUpdater center={droneLoc as [number, number]} />

            <CircleMarker 
              key={`${droneLoc[0]}-${droneLoc[1]}`}  // ← forces re-render on position change
              center={droneLoc as [number, number]} 
              pathOptions={{ color: 'red', fillColor: 'red' }} 
              radius={8}
            >
              <Popup>Drone current location</Popup>
            </CircleMarker>

            <CircleMarker center={displayDeliveryLoc as [number, number]} pathOptions={{ color: 'blue', fillColor: 'blue' }} radius={8}>
              <Popup>Delivery destination (mock)</Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
