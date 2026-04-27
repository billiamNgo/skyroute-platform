import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFleetTracking } from '../utils/drones';
import './DroneManagementPage.css';
import NotificationsBell from "../components/NotificationsBell";
import StaffHeader from "../components/StaffHeader";

import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io, type Socket } from 'socket.io-client';

// Fix for default marker icon
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

type DroneTrack = {
  drone: any;
  lastLocation: { latitude: number; longitude: number } | null;
  pharmacyLocation: { latitude: number; longitude: number };
};

export default function FleetTrackingPage() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<DroneTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;

    const start = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getFleetTracking();
        setFleet(data);

        const token = localStorage.getItem('token');
        socket = io((import.meta as any).env?.VITE_API_URL || 'http://localhost:8080', {
          auth: { token }
        });

        socket.on('connect', () => {
          // Join pharmacy room if any drone exists
          if (data.length > 0 && data[0].drone.pharmacyID) {
            socket?.emit('join:pharmacy', data[0].drone.pharmacyID);
          }
        });

        socket.on('drone:locationUpdate', (payload: { droneId: number; latitude: number; longitude: number }) => {
          setFleet(prev => prev.map(item => 
            item.drone.droneID === payload.droneId 
              ? { ...item, lastLocation: { latitude: payload.latitude, longitude: payload.longitude } }
              : item
          ));
        });

        socket.on('connect_error', (err: any) => {
          console.error('Socket connect error', err);
        });

      } catch (err: any) {
        setError(err.message || 'Failed to fetch fleet tracking');
      } finally {
        setLoading(false);
      }
    };

    start();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  if (loading) return <div className="dashboard-page">Loading fleet tracking...</div>;
  if (error) return <div className="dashboard-page"><div className="drone-error">{error}</div></div>;

  // Pensacola / Pace area coordinates (Seed data location)
  const defaultCenter: [number, number] = [30.54, -87.21];
  
  // Use first pharmacy location or default center
  const pLoc = fleet.length > 0 ? fleet[0].pharmacyLocation : null;
  const mapCenter: [number, number] = pLoc 
    ? [pLoc.latitude, pLoc.longitude]
    : defaultCenter;

  const mapProps: any = { 
    center: mapCenter, 
    zoom: 13, 
    style: { height: '100%', width: '100%', borderRadius: '12px' } 
  };
  const tileProps: any = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };
  const AnyCircleMarker: any = CircleMarker;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container orders-page-container">
        <StaffHeader activeTab="tracking" />

        <h1 className="dashboard-title">Fleet Live Tracking</h1>
        <p className="dashboard-subtitle">Real-time view of all drones in the pharmacy fleet.</p>

        <div style={{ height: '70vh', width: '100%', marginTop: '20px' }}>
          <MapContainer {...mapProps}>
            <TileLayer {...tileProps} />

            {fleet.map((item) => {
              // If no location, use pharmacy location
              const pos: [number, number] = item.lastLocation
                ? [item.lastLocation.latitude, item.lastLocation.longitude]
                : [item.pharmacyLocation.latitude, item.pharmacyLocation.longitude];
              
              const status = item.drone.currentStatus.toLowerCase();
              const color = status === 'in_transit' ? '#ef4444' : status === 'available' ? '#10b981' : '#f59e0b';

              return (
                <AnyCircleMarker
                  key={item.drone.droneID}
                  center={pos}
                  pathOptions={{ color: color, fillColor: color }}
                  radius={10}
                >
                  <Popup>
                    <strong>Drone #{item.drone.droneID}</strong><br />
                    Status: {item.drone.currentStatus}<br />
                    Pharmacy: {item.drone.pharmacyID}<br />
                    <button 
                      onClick={() => navigate(`/fleet/track/${item.drone.droneID}`)}
                      style={{ marginTop: '8px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </Popup>
                </AnyCircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
