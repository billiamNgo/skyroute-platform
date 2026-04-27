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
  destination: { latitude: number; longitude: number } | null;
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
        const data = await getDroneTracking(Number(id));
        // Normalize into our Tracking shape; data includes destinationLat/destinationLon if drone is in transit
        const initial: Tracking = {
          drone: (data as any).drone || data,
          lastLocation: (data as any).lastLocation || null,
          destination: null,
        };

        // If the data includes destination coordinates from server, use them
        if (typeof (data as any).destinationLat === 'number' && typeof (data as any).destinationLon === 'number') {
          const nLat = Number((data as any).destinationLat);
          const nLon = Number((data as any).destinationLon);
          if (!isNaN(nLat) && !isNaN(nLon)) {
            initial.destination = { latitude: nLat, longitude: nLon };
          }
        }

        setTracking(initial);

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

        socket.on('order:assigned', (payload: any) => {
          // Accept multiple naming variants and treat 0 as valid
          if (Number(id) !== payload?.droneId) return;
          console.log('Order assigned to this drone', payload?.orderId);

          const destLat = payload?.destinationLat ?? payload?.destination_lat ?? payload?.destinationLatitude ?? payload?.destLat;
          const destLon = payload?.destinationLon ?? payload?.destination_lon ?? payload?.destinationLongitude ?? payload?.destLon;

          if (typeof destLat !== 'undefined' && typeof destLon !== 'undefined') {
            const nLat = Number(destLat);
            const nLon = Number(destLon);
            if (!isNaN(nLat) && !isNaN(nLon)) {
              setTracking(prev => prev ? { ...prev, destination: { latitude: nLat, longitude: nLon } } : prev);
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

  // Delivery location from tracking state
  const displayDeliveryLoc = tracking.destination
    ? [tracking.destination.latitude, tracking.destination.longitude]
    : [droneLoc[0] + 0.005, droneLoc[1] + 0.005];

  // react-leaflet typings vary; cast to any to bypass version issues
  const mapProps: any = { center: droneLoc as [number, number], zoom: 13, style: { height: '100%', width: '100%' } };
  const tileProps: any = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };
  const AnyCircleMarker: any = CircleMarker;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <div className="orders-topbar">
          <button className="orders-tab" onClick={() => navigate('/technician')}>Back</button>
        </div>

        <h1 className="dashboard-title">Drone Tracking - {id}</h1>

        <div style={{ height: '70vh', width: '100%' }}>
          <MapContainer {...mapProps}>
            <TileLayer {...tileProps} />

            <MapUpdater center={droneLoc as [number, number]} />

            <AnyCircleMarker
              key={`${droneLoc[0]}-${droneLoc[1]}`}  // forces re-render on position change
              center={droneLoc as [number, number]}
              pathOptions={{ color: 'red', fillColor: 'red' }}
              radius={8}
            >
              <Popup>Drone current location</Popup>
            </AnyCircleMarker>

            <AnyCircleMarker center={displayDeliveryLoc as [number, number]} pathOptions={{ color: 'blue', fillColor: 'blue' }} radius={8}>
              <Popup>Delivery destination</Popup>
            </AnyCircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
